import { STAR_PATH } from "./star-path";

function StarRow({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-[1em] w-[1em]" fill="currentColor">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

interface Props {
  rating: number | null;
  count?: number;
  className?: string;
  /** Color for the secondary text — override on dark/glass surfaces. */
  mutedClassName?: string;
  /** Stacked: larger centered stars with the count on its own line below. */
  stacked?: boolean;
}

/** Fractional star display: outline row with a width-clipped filled overlay. */
export function StarRating({
  rating,
  count,
  className = "",
  mutedClassName = "text-ink-soft",
  stacked = false,
}: Props) {
  if (rating === null) {
    return (
      <span className={`text-sm ${mutedClassName} ${className}`}>No reviews yet</span>
    );
  }
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const stars = (
    <span className={`relative inline-flex leading-none ${stacked ? "text-2xl" : "text-base"}`}>
      <StarRow className="text-line" />
      <span
        className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap"
        style={{ width: `${pct}%` }}
      >
        <StarRow className="text-star" />
      </span>
    </span>
  );
  const label = count !== undefined && (
    <span className={`text-sm ${mutedClassName}`}>
      {rating.toFixed(1)} · {count} review{count === 1 ? "" : "s"}
    </span>
  );

  return (
    <span
      className={`${
        stacked ? "inline-flex flex-col items-center gap-1.5" : "inline-flex items-center gap-2"
      } ${className}`}
      aria-label={`Rated ${rating.toFixed(1)} out of 5${count !== undefined ? ` from ${count} reviews` : ""}`}
    >
      {stars}
      {label}
    </span>
  );
}
