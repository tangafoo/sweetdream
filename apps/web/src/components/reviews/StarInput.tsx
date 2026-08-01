"use client";

import { useState } from "react";
import { STAR_PATH } from "./star-path";

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
            className={`h-7 w-7 transition-colors ${star <= shown ? "text-star" : "text-line"}`}
            fill="currentColor"
          >
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  );
}
