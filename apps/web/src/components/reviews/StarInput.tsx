"use client";

import { useState } from "react";

const STAR_PATH =
  "M10 1.5l2.47 5.34 5.84.65-4.34 3.96 1.17 5.76L10 14.3l-5.14 2.9 1.17-5.75L1.69 7.5l5.84-.66L10 1.5z";

interface Props {
  value: number; // 0 = unset
  onChange: (rating: number) => void;
  disabled?: boolean;
}

export function StarInput({ value, onChange, disabled }: Props) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      className="flex gap-1"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          className="p-0.5 disabled:opacity-50"
        >
          <svg
            viewBox="0 0 20 20"
            className={`h-7 w-7 transition-colors ${star <= shown ? "text-clay" : "text-line"}`}
            fill="currentColor"
          >
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  );
}
