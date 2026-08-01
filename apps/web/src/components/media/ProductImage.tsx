"use client";

import Image from "next/image";
import { useState } from "react";
import { imageUrl } from "@/lib/images";

interface Props {
  imageKey: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** contain (default) never crops the mattress; cover fills the box. */
  fit?: "contain" | "cover";
  /**
   * Card chrome (rounding, shadow, background) applied ONLY when the gradient
   * placeholder renders. Real photos get none of it — they sit contained and
   * transparent on whatever is behind them.
   */
  placeholderClassName?: string;
}

// Placeholder tones stay inside the brand's grey→blue family, but vary in
// strength per key — some near-neutral, some clearly blue (colorblocked).
function toneFromKey(key: string): { h: number; s: number } {
  let n = 0;
  for (let i = 0; i < key.length; i++) {
    n = (n * 31 + key.charCodeAt(i)) % 100000;
  }
  return { h: 198 + (n % 42), s: 10 + ((n >> 3) % 30) };
}

/**
 * Renders the R2 image for a key, or — when the bucket isn't configured yet /
 * the object 404s — a designed placeholder (deterministic grey→blue gradient
 * + faint mattress outline). Drop real images into the bucket at the seeded
 * keys and these flip to photos with zero code changes.
 *
 * Must be placed inside a `position: relative` container with a size.
 */
export function ProductImage({
  imageKey,
  alt,
  sizes,
  priority,
  className = "",
  fit = "contain",
  placeholderClassName = "",
}: Props) {
  const [errored, setErrored] = useState(false);
  const url = imageUrl(imageKey);

  if (!url || errored) {
    const { h, s } = toneFromKey(imageKey);
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 overflow-hidden ${placeholderClassName} ${className}`}
        style={{
          background: `linear-gradient(150deg, hsl(${h} ${s}% 91%), hsl(${h + 14} ${s}% 79%))`,
        }}
      >
        <svg
          viewBox="0 0 200 120"
          aria-hidden="true"
          className="absolute inset-0 m-auto h-1/2 w-1/2 opacity-15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <rect x="20" y="45" width="160" height="40" rx="10" />
          <path d="M20 65h160" strokeWidth="1.5" />
          <rect x="34" y="30" width="52" height="22" rx="9" />
          <rect x="114" y="30" width="52" height="22" rx="9" />
        </svg>
        <span className="absolute bottom-2 left-3 font-mono text-[10px] tracking-wide text-ink/30">
          {imageKey}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`${fit === "cover" ? "object-cover" : "object-contain"} ${className}`}
      onError={() => setErrored(true)}
    />
  );
}
