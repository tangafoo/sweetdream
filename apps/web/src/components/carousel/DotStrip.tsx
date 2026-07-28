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
      <div className="flex items-center gap-2.5 rounded-full bg-ink/[0.06] px-4 py-2.5 backdrop-blur">
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
                i === index ? "w-6 bg-ink" : "w-1.5 bg-ink/30 hover:bg-ink/60"
              }`}
            />
          </button>
        ))}
      </div>
    </nav>
  );
}
