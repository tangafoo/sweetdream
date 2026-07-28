"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ProcessedImage } from "@/lib/client-image";
import { ImageDropzone } from "./ImageDropzone";
import { StarInput } from "./StarInput";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Phase = "idle" | "uploading" | "submitting" | "success";

export function ReviewForm({ productSlug }: { productSlug: string }) {
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>();
  const turnstileRef = useRef<TurnstileInstance>(null);

  const busy = phase === "uploading" || phase === "submitting";

  // Blob preview URLs pin decoded images in memory until revoked; make sure
  // they're released when the form goes away (success path revokes eagerly).
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(
    () => () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    },
    [],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating === 0) {
      setError("Pick a star rating first.");
      return;
    }

    try {
      // 1) Upload photos straight to R2 via presigned PUTs
      let imageKeys: string[] = [];
      if (images.length > 0) {
        setPhase("uploading");
        const presignRes = await fetch("/api/reviews/presign", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            files: images.map((img) => ({
              contentType: img.contentType,
              sizeBytes: img.blob.size,
            })),
          }),
        });
        if (presignRes.status === 429) {
          throw new Error("Too many upload attempts — please try again in a few minutes.");
        }
        if (presignRes.status === 503) {
          throw new Error("Photo uploads aren't available right now. Try again without photos.");
        }
        if (!presignRes.ok) throw new Error("Couldn't prepare the photo upload.");
        const { uploads } = (await presignRes.json()) as {
          uploads: Array<{ key: string; url: string }>;
        };
        await Promise.all(
          uploads.map(async (upload, i) => {
            const put = await fetch(upload.url, {
              method: "PUT",
              headers: { "content-type": images[i].contentType },
              body: images[i].blob,
            });
            if (!put.ok) throw new Error("A photo failed to upload — please try again.");
          }),
        );
        imageKeys = uploads.map((u) => u.key);
      }

      // 2) Submit the review (turnstile → rate limit → moderation happen server-side)
      setPhase("submitting");
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productSlug,
          rating,
          authorName,
          body,
          imageKeys,
          turnstileToken,
        }),
      });

      if (res.status === 429) {
        throw new Error("You've posted a few reviews recently — please try again later.");
      }
      if (res.status === 403) {
        throw new Error("We couldn't verify you're human. Refresh the page and try again.");
      }
      if (res.status === 422) {
        throw new Error("Your review couldn't be posted.");
      }
      if (!res.ok) throw new Error("Something went wrong — please try again.");

      const data = (await res.json()) as { review: { status: string } };
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setImages([]);
      setPendingApproval(data.review.status === "PENDING");
      setPhase("success");
      router.refresh(); // pull the revalidated page with the new review
    } catch (err) {
      setPhase("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
      turnstileRef.current?.reset(); // tokens are single-use
      setTurnstileToken(undefined);
    }
  }

  if (phase === "success") {
    return (
      <div className="rounded-2xl border border-line bg-sand/50 p-6">
        <h3 className="font-display text-2xl">Thank you!</h3>
        <p className="mt-2 text-ink-soft">
          {pendingApproval
            ? "Your review was received and will appear once it's been checked."
            : "Your review is live."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line p-6">
      <h3 className="font-display text-2xl">Leave a review</h3>
      <p className="mt-1 text-sm text-ink-soft">No account needed.</p>

      <div className="mt-5 space-y-5">
        <StarInput value={rating} onChange={setRating} disabled={busy} />

        <div>
          <label htmlFor="review-name" className="mb-1.5 block text-sm text-ink-soft">
            Name
          </label>
          <input
            id="review-name"
            type="text"
            required
            maxLength={80}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            disabled={busy}
            placeholder="How should we credit you?"
            className="w-full rounded-lg border border-line bg-ivory px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-ink-soft/60 focus:border-ink/50 disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="review-body" className="mb-1.5 block text-sm text-ink-soft">
            Your review
          </label>
          <textarea
            id="review-body"
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={busy}
            placeholder="How are you sleeping?"
            className="w-full resize-y rounded-lg border border-line bg-ivory px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-ink-soft/60 focus:border-ink/50 disabled:opacity-60"
          />
        </div>

        <ImageDropzone images={images} onChange={setImages} disabled={busy} />

        {TURNSTILE_SITE_KEY && (
          <Turnstile
            ref={turnstileRef}
            siteKey={TURNSTILE_SITE_KEY}
            onSuccess={setTurnstileToken}
            options={{ size: "flexible" }}
          />
        )}

        {error && <p className="text-sm text-clay-deep">{error}</p>}

        <button
          type="submit"
          disabled={busy || (Boolean(TURNSTILE_SITE_KEY) && !turnstileToken)}
          className="w-full rounded-full bg-ink px-6 py-3 text-sm text-ivory transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {phase === "uploading"
            ? "Uploading photos…"
            : phase === "submitting"
              ? "Posting…"
              : "Post review"}
        </button>
      </div>
    </form>
  );
}
