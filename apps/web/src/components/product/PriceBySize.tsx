"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { SizePricing } from "@sd/db/types";

export function PriceBySize({ sizes }: { sizes: SizePricing }) {
  const defaultIndex = Math.max(
    0,
    sizes.findIndex((s) => s.label === "Queen"),
  );
  const [selected, setSelected] = useState(defaultIndex);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
        {sizes.map((size, i) => (
          <button
            key={size.label}
            type="button"
            role="radio"
            aria-checked={i === selected}
            onClick={() => setSelected(i)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              i === selected
                ? "border-ink bg-ink text-ivory"
                : "border-line hover:border-ink/40"
            }`}
          >
            {size.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-3xl font-medium tracking-tight">
        {formatPrice(sizes[selected].priceCents)}
        <span className="ml-2 align-middle text-sm font-normal text-ink-soft">
          {sizes[selected].label}
        </span>
      </p>
    </div>
  );
}
