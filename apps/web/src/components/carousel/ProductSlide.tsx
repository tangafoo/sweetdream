"use client";

import { motion, useReducedMotion } from "motion/react";
import { ProductImage } from "@/components/media/ProductImage";
import { StarRating } from "@/components/reviews/StarRating";
import { ambientHue } from "@/lib/ambient";
import { formatPrice } from "@/lib/format";
import type { ProductSummary } from "@/lib/queries";

interface Props {
  product: ProductSummary;
  active: boolean;
  priority?: boolean;
  /** Open the quick-look sheet (image tap, scroll/swipe down). */
  onPeek: () => void;
  /** Navigate to the full product page ("Explore this mattress"). */
  onOpen: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function ProductSlide({ product, active, priority, onPeek, onOpen }: Props) {
  const reduceMotion = useReducedMotion();
  const hue = ambientHue(product.slug);

  // Text block softly rises in when the slide takes the stage.
  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: active ? 1 : 0, y: active ? 0 : 10 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.45, ease: EASE, delay: active ? delay : 0 },
  });

  return (
    <section
      aria-label={product.name}
      inert={!active}
      className="relative flex h-full min-w-full flex-col items-center justify-center px-6 pb-24 pt-16 md:pb-28 md:pt-20"
    >
      <motion.div
        animate={{ opacity: active ? 1 : 0.3, scale: active ? 1 : 0.94 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative flex w-full flex-col items-center text-center"
      >
        {/* pedestal glow: soft blurred halo in the product's ambient hue */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[6%] -z-10 h-[52%] w-[82%] max-w-2xl -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(closest-side, hsl(${hue} 55% 68% / 0.45), transparent 72%)`,
          }}
        />

        <button
          type="button"
          onClick={onPeek}
          aria-label={`Quick look at ${product.name}`}
          className="group relative block aspect-[16/10] max-h-[42dvh] w-full max-w-3xl overflow-hidden rounded-3xl shadow-[0_30px_80px_-30px_rgb(28_23_19/0.35)] md:max-h-[52dvh]"
        >
          <ProductImage
            imageKey={product.heroImageKey}
            alt={product.name}
            sizes="(min-width: 768px) 768px, 100vw"
            priority={priority}
            className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </button>

        <motion.h2
          {...enter(0.06)}
          className="mt-6 font-display text-4xl tracking-tight md:mt-8 md:text-6xl"
        >
          {product.name}
        </motion.h2>
        <motion.p {...enter(0.12)} className="mt-2 text-ink-soft md:text-lg">
          {product.tagline}
        </motion.p>

        <motion.div
          {...enter(0.18)}
          className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        >
          <span className="text-lg md:text-xl">
            From {formatPrice(product.basePriceCents)}
          </span>
          <StarRating rating={product.avgRating} count={product.reviewCount} />
        </motion.div>

        <motion.button
          {...enter(0.24)}
          type="button"
          onClick={onOpen}
          className="mt-6 rounded-full border border-ink/15 px-6 py-2.5 text-sm transition-colors hover:bg-ink hover:text-ivory md:mt-7"
        >
          Explore this mattress
        </motion.button>

        <motion.span {...enter(0.3)} className="mt-4 text-xs text-ink-soft">
          <span className="md:hidden">swipe up for a quick look</span>
          <span className="hidden md:inline">scroll down for a quick look</span>
        </motion.span>
      </motion.div>
    </section>
  );
}
