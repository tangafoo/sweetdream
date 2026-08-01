"use client";

import { useRef, useState } from "react";
import { formatDate } from "@/lib/format";
import type { ReviewDTO } from "@/lib/queries";
import { ReviewImageStrip } from "./ReviewImageStrip";
import { StarRating } from "./StarRating";

const PAGE_SIZE = 6;

function ReviewCard({ review }: { review: ReviewDTO }) {
  return (
    <article className="border-b border-line pb-8 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium">{review.authorName}</span>
        <time dateTime={review.createdAt} className="text-sm text-ink-soft">
          {formatDate(review.createdAt)}
        </time>
      </div>
      <div className="mt-1.5">
        <StarRating rating={review.rating} />
      </div>
      <p className="mt-3 leading-relaxed text-ink/85">{review.body}</p>
      {review.imageKeys.length > 0 && <ReviewImageStrip imageKeys={review.imageKeys} />}
    </article>
  );
}

export function ReviewList({ reviews }: { reviews: ReviewDTO[] }) {
  const [page, setPage] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  if (reviews.length === 0) {
    return (
      <p className="text-ink-soft">
        No reviews yet — be the first to share how you slept.
      </p>
    );
  }

  const totalPages = Math.ceil(reviews.length / PAGE_SIZE);
  // router.refresh() after posting can shrink the list while page state persists
  const current = Math.min(page, totalPages - 1);
  const visible = reviews.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  function goTo(next: number) {
    setPage(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={topRef} className="scroll-mt-24 space-y-8">
      {visible.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {totalPages > 1 && (
        <nav aria-label="Review pages" className="flex items-center justify-between">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => goTo(current - 1)}
            className="rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-ink/50 disabled:opacity-40 disabled:hover:border-line"
          >
            ← Previous
          </button>
          <span aria-live="polite" className="text-sm text-ink-soft">
            Page {current + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={current === totalPages - 1}
            onClick={() => goTo(current + 1)}
            className="rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-ink/50 disabled:opacity-40 disabled:hover:border-line"
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}
