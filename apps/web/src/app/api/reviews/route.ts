import { getPrisma, type ReviewStatus } from "@sd/db";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { imageUrl } from "@/lib/images";
import { clientIp, hashIp } from "@/lib/ip";
import { moderateReview } from "@/lib/moderation";
import { rateLimit } from "@/lib/ratelimit";
import { deleteObjects, headObject, promoteObject, r2Configured } from "@/lib/r2";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  ALLOWED_IMAGE_TYPES,
  INCOMING_KEY_PATTERN,
  MAX_IMAGE_BYTES,
  reviewSubmissionSchema,
} from "@/lib/validation";

export const runtime = "nodejs";

const GENERIC_REJECTION = "Your review couldn't be posted.";

export async function POST(req: Request) {
  try {
    // 1. Validate payload shape
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }
    const parsed = reviewSubmissionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    const { productSlug, rating, authorName, body, imageKeys, turnstileToken } = parsed.data;
    const ip = clientIp(req);

    // 2. Turnstile (single-use token, so verified once, here at final submit)
    const turnstile = await verifyTurnstile(turnstileToken, ip);
    if (!turnstile.ok) {
      return NextResponse.json({ error: "verification_failed" }, { status: 403 });
    }

    // 3. Rate limit per IP
    const limit = await rateLimit("submit", ip);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "rate_limited" },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds ?? 3600) },
        },
      );
    }

    // 4. Product must exist
    const prisma = getPrisma();
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true, slug: true },
    });
    if (!product) {
      return NextResponse.json({ error: "unknown_product" }, { status: 404 });
    }

    // 5. Verify uploaded images actually match what was presigned
    //    (a presigned PUT can't enforce size, so re-check reality via HEAD).
    //    ETags are kept to pin promotion to these exact bytes (see promoteObject).
    const imageEtags = new Map<string, string>();
    if (imageKeys.length > 0) {
      if (!r2Configured()) {
        return NextResponse.json({ error: "uploads_unavailable" }, { status: 503 });
      }
      const draftIds = new Set(
        imageKeys.map((k) => k.match(INCOMING_KEY_PATTERN)![1]),
      );
      if (draftIds.size !== 1 || new Set(imageKeys).size !== imageKeys.length) {
        return NextResponse.json({ error: GENERIC_REJECTION }, { status: 422 });
      }
      const heads = await Promise.all(imageKeys.map((k) => headObject(k)));
      const allValid = heads.every(
        (h) =>
          h.exists &&
          h.sizeBytes > 0 &&
          h.sizeBytes <= MAX_IMAGE_BYTES &&
          h.contentType in ALLOWED_IMAGE_TYPES &&
          h.etag !== "",
      );
      if (!allValid) {
        await deleteObjects(imageKeys).catch(() => {});
        return NextResponse.json({ error: GENERIC_REJECTION }, { status: 422 });
      }
      imageKeys.forEach((key, i) => imageEtags.set(key, heads[i].etag));
    }

    // 6. Moderate text + images in one omni-moderation call.
    //    Any state where images can't be moderated fails closed to PENDING.
    let status: ReviewStatus = "PUBLISHED";
    let verdict: Awaited<ReturnType<typeof moderateReview>> | null = null;
    const publicImageUrls = imageKeys
      .map((k) => imageUrl(k))
      .filter((u): u is string => u !== null);
    if (publicImageUrls.length !== imageKeys.length) {
      // R2 write creds are set but NEXT_PUBLIC_R2_PUBLIC_URL isn't — the images
      // have no fetchable URL for the moderation API, so don't auto-publish them.
      console.warn("[reviews] NEXT_PUBLIC_R2_PUBLIC_URL unset — images can't be moderated, storing as PENDING");
      status = "PENDING";
    } else {
      try {
        verdict = await moderateReview(`${authorName}\n\n${body}`, publicImageUrls);
      } catch (err) {
        // Moderation unavailable → fail closed: store hidden, flip manually if legit
        console.error("[reviews] moderation failed, storing as PENDING:", err);
        status = "PENDING";
      }
    }

    if (verdict?.flagged) {
      await deleteObjects(imageKeys).catch(() => {});
      try {
        // keep a hidden record for audit; images are already gone
        await prisma.review.create({
          data: {
            productId: product.id,
            rating,
            authorName,
            body,
            status: "REJECTED",
            ipHash: hashIp(ip),
            moderation: verdict.results as object,
          },
        });
      } catch (err) {
        console.error("[reviews] failed to store REJECTED audit record:", err);
      }
      return NextResponse.json({ error: GENERIC_REJECTION }, { status: 422 });
    }
    const moderationResults = verdict?.results ?? null;

    // 7+8. Promote images out of the lifecycle-expired incoming/ prefix, then
    //      insert. If anything fails after promotion, delete the promoted
    //      copies — otherwise they'd sit unreferenced on the public bucket
    //      forever (the lifecycle rule only covers incoming/).
    const permanentKeys: string[] = [];
    let review;
    try {
      for (const key of imageKeys) {
        permanentKeys.push(await promoteObject(key, imageEtags.get(key)!));
      }
      if (imageKeys.length > 0) {
        await deleteObjects(imageKeys).catch(() => {});
      }
      review = await prisma.review.create({
        data: {
          productId: product.id,
          rating,
          authorName,
          body,
          status,
          ipHash: hashIp(ip),
          moderation: moderationResults as object | undefined,
          images: {
            create: permanentKeys.map((key, i) => ({ key, sortOrder: i })),
          },
        },
        include: { images: { orderBy: { sortOrder: "asc" } } },
      });
    } catch (err) {
      await deleteObjects(permanentKeys).catch(() => {});
      await deleteObjects(imageKeys).catch(() => {});
      const httpStatus = (err as { $metadata?: { httpStatusCode?: number } })?.$metadata
        ?.httpStatusCode;
      if (httpStatus === 412) {
        // If-Match failed: the object changed after verification/moderation —
        // someone re-PUT the presigned URL. Reject, never publish those bytes.
        return NextResponse.json({ error: GENERIC_REJECTION }, { status: 422 });
      }
      throw err;
    }

    // 9. Revalidate the static pages that show ratings
    if (status === "PUBLISHED") {
      revalidatePath("/");
      revalidatePath(`/products/${product.slug}`);
    }

    return NextResponse.json(
      {
        review: {
          id: review.id,
          rating: review.rating,
          authorName: review.authorName,
          body: review.body,
          createdAt: review.createdAt.toISOString(),
          imageKeys: review.images.map((img) => img.key),
          status: review.status,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[reviews] submission failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
