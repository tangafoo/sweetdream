import { formatDate } from "@/lib/format";
import type { ReviewDTO } from "@/lib/queries";
import { ReviewImageStrip } from "./ReviewImageStrip";
import { StarRating } from "./StarRating";

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
  if (reviews.length === 0) {
    return (
      <p className="text-ink-soft">
        No reviews yet — be the first to share how you slept.
      </p>
    );
  }
  return (
    <div className="space-y-8">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
