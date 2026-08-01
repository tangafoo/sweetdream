import type { ReviewDTO } from "@/lib/queries";
import { StarRating } from "./StarRating";

export function ReviewSummary({ reviews }: { reviews: ReviewDTO[] }) {
  if (reviews.length === 0) return null;

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const histogram = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  return (
    <div>
      <div className="flex items-end gap-4">
        <span className="font-display text-6xl leading-none">{avg.toFixed(1)}</span>
        <div className="pb-1">
          <StarRating rating={avg} />
          <p className="mt-1 text-sm text-ink-soft">
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <dl className="mt-6 space-y-1.5">
        {histogram.map(({ stars, count }) => (
          <div key={stars} className="flex items-center gap-3 text-sm">
            <dt className="w-8 shrink-0 text-right tabular-nums text-ink-soft">{stars}★</dt>
            <dd className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full bg-star"
                style={{ width: `${(count / reviews.length) * 100}%` }}
              />
            </dd>
            <span className="w-6 shrink-0 tabular-nums text-ink-soft">{count}</span>
          </div>
        ))}
      </dl>
    </div>
  );
}
