"use client";

import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { PriceBySize } from "@/components/product/PriceBySize";
import { StarRating } from "@/components/reviews/StarRating";
import type { ProductSummary } from "@/lib/queries";

interface Props {
  product: ProductSummary;
  open: boolean;
  onClose: () => void;
  /** Navigate to the full product page (gallery, specs, reviews). */
  onExplore: () => void;
}

/**
 * Compact bottom-sheet preview shown when the visitor scrolls/swipes down on
 * the carousel: price by size, feel, and a blurb — the full page is only a
 * click away via "Explore this mattress". Content tracks the active slide, so
 * paging ←/→ while it's open works as a quick comparison mode.
 */
export function QuickView({ product, open, onClose, onExplore }: Props) {
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="absolute inset-0 z-30 bg-ink/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} — quick look`}
            className="absolute inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl rounded-t-3xl border border-b-0 border-line bg-ivory shadow-[0_-20px_60px_-20px_rgb(28_23_19/0.35)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 320, damping: 34 }
            }
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
            // Swallow wheel events only when the sheet's content can actually
            // scroll in that direction; otherwise let them bubble to the stage,
            // where a further scroll-down (or scroll-up) dismisses the sheet.
            // Horizontal wheel always bubbles — paging stays live underneath.
            onWheel={(e) => {
              const el = scrollRef.current;
              if (!el || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
              const canScrollDown = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
              const canScrollUp = el.scrollTop > 0;
              if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
                e.stopPropagation();
              }
            }}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {/* grab handle — the drag-to-dismiss region */}
            <div
              className="flex cursor-grab touch-none justify-center py-3 active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <span aria-hidden className="h-1 w-10 rounded-full bg-line" />
            </div>

            <div ref={scrollRef} className="max-h-[62dvh] overflow-y-auto px-6 pb-7 md:px-8">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-display text-3xl tracking-tight">{product.name}</h3>
                <StarRating rating={product.avgRating} count={product.reviewCount} />
              </div>
              <p className="mt-1 text-ink-soft">{product.tagline}</p>

              <div className="mt-5">
                <PriceBySize sizes={product.sizes} />
              </div>

              <div className="mt-5 flex items-center gap-3 text-sm text-ink-soft">
                <span>Feel</span>
                <span className="flex flex-1 gap-1" aria-label={`Firmness ${product.firmness} out of 10`}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full ${i < product.firmness ? "bg-clay" : "bg-line"}`}
                    />
                  ))}
                </span>
                <span className="tabular-nums">{product.firmness}/10</span>
                <span className="text-line">|</span>
                <span className="tabular-nums">{product.heightInches}&Prime; tall</span>
              </div>

              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-ink/85">
                {product.description.split("\n\n")[0]}
              </p>

              <button
                type="button"
                onClick={onExplore}
                className="mt-6 w-full rounded-full bg-ink px-6 py-3.5 text-sm text-ivory transition-opacity hover:opacity-90"
              >
                Explore this mattress
              </button>
              <p className="mt-2 text-center text-xs text-ink-soft">
                Full gallery, measurements &amp; reviews
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
