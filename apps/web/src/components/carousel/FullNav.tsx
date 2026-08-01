"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ProductImage } from "@/components/media/ProductImage";
import { ProductName } from "@/components/product/ProductName";
import { imageUrl, navImageKey } from "@/lib/images";
import type { ProductSummary } from "@/lib/queries";

interface Props {
  products: ProductSummary[];
  index: number;
  open: boolean;
  /** Jump the main carousel to product i (also closes the nav). */
  onSelect: (i: number) => void;
  onClose: () => void;
}

/**
 * The immersive nav — second stop on the way down. A full-viewport night sky
 * with the whole collection laid out as a grid, plus the site's other
 * destinations (warranty, contact). Scrolling is fully contained while it's
 * open; ✕, Esc, or ↑ leaves — picking a mattress jumps the carousel there.
 */
export function FullNav({ products, index, open, onSelect, onClose }: Props) {
  const reduceMotion = useReducedMotion();
  const darkLogo = imageUrl("sd-logo-darktheme.webp");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="fullnav"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="night-sky absolute inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
          // The nav owns every scroll while it's open. Letting end-of-grid
          // wheels bubble to the stage (the old "scroll past the top to step
          // back" gesture) meant trackpad momentum at either end spilled into
          // the carousel's ascend/descend ladder — the nav would dismiss
          // itself mid-scroll. Exit is deliberate now: ✕, Esc, or ↑.
          onWheel={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="absolute right-5 top-5 z-10 rounded-full border border-ivory/20 p-2.5 text-ivory/70 transition-colors hover:border-ivory/50 hover:text-ivory"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

          <motion.div
            className="h-full overflow-y-auto overscroll-contain px-6 pb-14 pt-16 md:px-10"
            style={{ touchAction: "pan-y" }}
            initial={{ y: reduceMotion ? 0 : 26 }}
            animate={{ y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 32 }}
          >
            <div className="mx-auto max-w-5xl">
              {darkLogo ? (
                <Image
                  src={darkLogo}
                  alt="SweetDream"
                  width={700}
                  height={264}
                  className="mx-auto h-12 w-auto opacity-90"
                />
              ) : (
                <p className="text-center text-xs uppercase tracking-[0.25em] text-ivory/50">
                  sweetdream
                </p>
              )}
              <h2 className="mt-2 text-center font-display text-3xl tracking-tight text-ivory md:text-4xl">
                The collection
              </h2>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {products.map((p, i) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => onSelect(i)}
                    aria-label={`Go to ${p.name}`}
                    aria-current={i === index ? "true" : undefined}
                    className={`rounded-2xl p-2 pb-2.5 text-left transition-all ${
                      i === index
                        ? "ring-2 ring-ivory/80"
                        : "opacity-85 hover:bg-ivory/[0.06] hover:opacity-100"
                    }`}
                  >
                    <span className="relative block aspect-[4/3]">
                      <ProductImage
                        imageKey={navImageKey(p)}
                        alt=""
                        sizes="200px"
                        placeholderClassName="rounded-xl"
                      />
                    </span>
                    <span className="mt-2 block truncate text-xs text-ivory">
                      <ProductName name={p.name} />
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-14 flex flex-col items-center gap-5 border-t border-ivory/10 pt-10">
                <Link
                  href="/warranty"
                  className="font-display text-2xl tracking-tight text-ivory/85 transition-colors hover:text-ivory md:text-3xl"
                >
                  Warranty request
                </Link>
                <Link
                  href="/contact"
                  className="font-display text-2xl tracking-tight text-ivory/85 transition-colors hover:text-ivory md:text-3xl"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
