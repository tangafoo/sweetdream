"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { ProductImage } from "@/components/media/ProductImage";
import { ProductName } from "@/components/product/ProductName";
import { HintChevrons, HintPulse, Kbd } from "./HintChevrons";
import { navImageKey } from "@/lib/images";
import type { ProductSummary } from "@/lib/queries";

interface Props {
  products: ProductSummary[];
  index: number;
  open: boolean;
  /** Jump the main carousel to product i (also closes the switcher). */
  onSelect: (i: number) => void;
  onClose: () => void;
}

/**
 * The switcher: a film strip of every mattress that drops from the top on
 * scroll/swipe down — the fast alternative to paging one slide at a time.
 * Shows ~4–5 cards at once; wheel (any axis), trackpad, or touch scrolls the
 * strip, a click jumps straight to that mattress. The active card is centered
 * on open and follows ←/→ while the strip stays up.
 */
export function QuickNav({ products, index, open, onSelect, onClose }: Props) {
  const reduceMotion = useReducedMotion();
  const stripRef = useRef<HTMLDivElement>(null);
  const settledRef = useRef(false);

  // Center the active card — instantly when the strip appears, smoothly as
  // ←/→ move the selection while it's open.
  useEffect(() => {
    if (!open) {
      settledRef.current = false;
      return;
    }
    const strip = stripRef.current;
    const card = strip?.children[index] as HTMLElement | undefined;
    if (!strip || !card) return;
    strip.scrollTo({
      left: card.offsetLeft - (strip.clientWidth - card.offsetWidth) / 2,
      behavior: settledRef.current && !reduceMotion ? "smooth" : "auto",
    });
    settledRef.current = true;
  }, [open, index, reduceMotion]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="qnav-backdrop"
            className="night-veil absolute inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            onClick={onClose}
          />
          <motion.div
            key="qnav"
            role="dialog"
            aria-modal="true"
            aria-label="Jump to a mattress"
            className="absolute inset-x-0 top-0 z-40 pt-6"
            initial={{ y: -32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -32, opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 340, damping: 34 }
            }
            // The strip owns every gesture over it: wheels scroll it (vertical
            // deltas are folded into horizontal travel so a plain mouse wheel
            // works too) and never reach the stage's ladder/paging handlers.
            onWheel={(e) => {
              e.stopPropagation();
              const el = stripRef.current;
              if (!el) return;
              el.scrollLeft += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            }}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <p className="mb-2 text-center text-xs uppercase tracking-widest text-ivory/60">
              Jump to a mattress
            </p>
            {/* py-2 keeps the active card's ring inside the scroll clip */}
            <div
              ref={stripRef}
              className="no-scrollbar flex gap-3 overflow-x-auto px-6 py-2 md:px-10"
              style={{ touchAction: "pan-x" }}
            >
              {products.map((p, i) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => onSelect(i)}
                  aria-label={`Go to ${p.name}`}
                  aria-current={i === index ? "true" : undefined}
                  className={`w-32 shrink-0 rounded-2xl p-1.5 text-left transition-all md:w-36 ${
                    i === index ? "ring-2 ring-ivory" : "opacity-75 hover:opacity-100"
                  }`}
                >
                  <span className="relative block aspect-[4/3]">
                    <ProductImage
                      imageKey={navImageKey(p)}
                      alt=""
                      sizes="144px"
                      placeholderClassName="rounded-xl"
                    />
                  </span>
                  <span className="mt-1.5 block truncate text-xs text-ivory">
                    <ProductName name={p.name} />
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-col items-center gap-1 text-[11px] text-ivory/50">
              <HintPulse>
                swipe down again
                <span className="hidden md:inline">
                  {" "}
                  or <Kbd>↓</Kbd>
                </span>{" "}
                for the full menu
              </HintPulse>
              <HintChevrons dir="down" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
