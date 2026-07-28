import Link from "next/link";
import { ProductImage } from "@/components/media/ProductImage";
import { formatPrice } from "@/lib/format";
import type { ProductSummary } from "@/lib/queries";

function NeighborCard({
  product,
  direction,
}: {
  product: ProductSummary;
  direction: "prev" | "next";
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group flex items-center gap-5 rounded-2xl border border-line p-4 transition-colors hover:border-ink/30 ${
        direction === "next" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <span className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xl">
        <ProductImage imageKey={product.heroImageKey} alt="" sizes="112px" />
      </span>
      <span>
        <span className="block text-xs uppercase tracking-widest text-ink-soft">
          {direction === "prev" ? "← Previous" : "Next →"}
        </span>
        <span className="mt-1 block font-display text-xl">{product.name}</span>
        <span className="mt-0.5 block text-sm text-ink-soft">
          From {formatPrice(product.basePriceCents)}
        </span>
      </span>
    </Link>
  );
}

export function NeighborNav({
  prev,
  next,
}: {
  prev: ProductSummary | null;
  next: ProductSummary | null;
}) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="More mattresses" className="mt-24 grid gap-4 border-t border-line pt-10 sm:grid-cols-2">
      <div>{prev && <NeighborCard product={prev} direction="prev" />}</div>
      <div>{next && <NeighborCard product={next} direction="next" />}</div>
    </nav>
  );
}
