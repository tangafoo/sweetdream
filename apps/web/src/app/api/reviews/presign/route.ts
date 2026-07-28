import { NextResponse } from "next/server";
import { clientIp } from "@/lib/ip";
import { presignPut, r2Configured } from "@/lib/r2";
import { rateLimit } from "@/lib/ratelimit";
import { ALLOWED_IMAGE_TYPES, presignRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = presignRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const ip = clientIp(req);
  const limit = await rateLimit("presign", ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) },
      },
    );
  }

  if (!r2Configured()) {
    return NextResponse.json({ error: "uploads_unavailable" }, { status: 503 });
  }

  const draftId = crypto.randomUUID();
  const uploads = await Promise.all(
    parsed.data.files.map(async (file, i) => {
      const key = `reviews/incoming/${draftId}/${i}.${ALLOWED_IMAGE_TYPES[file.contentType]}`;
      return { key, url: await presignPut(key, file.contentType) };
    }),
  );

  return NextResponse.json({ draftId, uploads });
}
