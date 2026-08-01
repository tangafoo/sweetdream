"use client";

interface Props {
  products: Array<{ slug: string; name: string }>;
  index: number;
  onSelect: (i: number) => void;
}

export function DotStrip({ products, index, onSelect }: Props) {
  return (
    <nav
      aria-label="Jump to mattress"
      className="absolute inset-x-0 bottom-7 flex justify-center"
    >
      {/* black gloss: deep translucent pill, hairline top highlight riding
          the curve, soft drop shadow lifting it off the stage */}
      <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-ink/70 px-4 py-2.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_10px_30px_-12px_rgb(0_0_0/0.55)] backdrop-blur">
        {products.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={p.name}
            aria-current={i === index ? "true" : undefined}
            className="flex h-3 items-center"
          >
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/75"
              }`}
            />
          </button>
        ))}
      </div>
    </nav>
  );
}
