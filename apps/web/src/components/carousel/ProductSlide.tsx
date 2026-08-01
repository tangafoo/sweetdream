"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { MotionProps } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ProductImage } from "@/components/media/ProductImage";
import { ProductName } from "@/components/product/ProductName";
import { AmbientClouds } from "./AmbientClouds";
import { HintChevrons, HintPulse, Kbd } from "./HintChevrons";
import { StarRating } from "@/components/reviews/StarRating";
import { ambientHue } from "@/lib/ambient";
import { formatPrice } from "@/lib/format";
import { imageUrl, isHeroShot } from "@/lib/images";
import type { ProductSummary } from "@/lib/queries";

interface Props {
  product: ProductSummary;
  active: boolean;
  priority?: boolean;
  /** Open the quick-look sheet (image tap, swipe up). */
  onPeek: () => void;
  /** Navigate to the full product page ("Explore this mattress"). */
  onOpen: () => void;
  /**
   * Reports whether the slide is actually showing its full-bleed hero photo
   * (not just named after one) — the stage keys the header logo colorway and
   * counter color off this, so a 404'd hero falling back to the pale layout
   * doesn't flip the chrome dark.
   */
  onHeroLayout?: (heroVisible: boolean) => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

type HintPhase = "idle" | "up" | "down";

/**
 * Fixed-height slot for the "swipe up" chevron burst — sits outside the
 * glass card (below it on mobile, above it on desktop) and reserves its
 * space permanently so the card never moves when the arrows come and go.
 */
function UpArrowSlot({ show, className = "" }: { show: boolean; className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none flex h-12 items-center justify-center ${className}`}
    >
      <AnimatePresence>
        {show && (
          <motion.div
            key="up-arrows"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <HintChevrons dir="up" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * The "swipe down" hint at the top of the window, above everything on the
 * stage, visiting briefly after the up-hint has had its turn. Naked text
 * and arrows — no pill; on mobile it sits lower to clear the header logo.
 */
function DownHint({ show, dark }: { show: boolean; dark: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-24 z-[60] flex justify-center md:top-8">
      <AnimatePresence>
        {show && (
          <motion.div
            key="down-hint"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className={`flex flex-col items-center gap-1.5 text-xs ${
              dark
                ? "text-white/90 drop-shadow-[0_1px_6px_rgb(0_0_0/0.45)]"
                : "text-ink"
            }`}
          >
            <HintPulse>
              swipe down
              <span className="hidden md:inline">
                {" "}
                or <Kbd>↓</Kbd>
              </span>{" "}
              to browse all mattresses
            </HintPulse>
            <HintChevrons dir="down" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * The up-hint's comic timing: the arrows swipe... nothing. Swipe again —
 * and THEN the card does one cute quick hop, right on the second tick.
 * Slow build-up, fast payoff. Launch decelerates (easeOut), landing
 * accelerates (easeIn) — plain jump physics.
 */
function HeavyLift({ lifting, children }: { lifting: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      className="flex w-full justify-center"
      animate={lifting ? { y: [0, -10, 0] } : { y: 0 }}
      transition={
        lifting
          ? // arrows enter ~1.6s, first drift loop runs to ~3.6s — the hop
            // lands right as the second loop kicks off
            { delay: 3.6, duration: 0.75, times: [0, 0.45, 1], ease: ["easeOut", "easeIn"] }
          : { duration: 0.4, ease: "easeOut" }
      }
    >
      {children}
    </motion.div>
  );
}

/**
 * Per-landing hint choreography: the up-chevrons play first, then the
 * down-hint pill takes a turn at the top of the window. Nothing runs for
 * reduced-motion users — the card's static line covers both gestures.
 */
function useHintPhase(active: boolean, reduceMotion: boolean): HintPhase {
  const [phase, setPhase] = useState<HintPhase>("idle");

  useEffect(() => {
    if (!active || reduceMotion) {
      setPhase("idle");
      return;
    }
    // each phase window: ~1.6s of staggered entrance + two slow drift loops;
    // after the down-hint bows out, a 5s intermission and the whole show
    // restarts from the top for as long as the slide holds the stage
    let timers: ReturnType<typeof setTimeout>[] = [];
    const runCycle = () => {
      timers = [
        setTimeout(() => setPhase("up"), 600),
        setTimeout(() => setPhase("idle"), 6200),
        setTimeout(() => setPhase("down"), 7000),
        setTimeout(() => setPhase("idle"), 12600),
        setTimeout(runCycle, 17600),
      ];
    };
    runCycle();
    return () => {
      timers.forEach(clearTimeout);
      setPhase("idle");
    };
  }, [active, reduceMotion]);

  return phase;
}

/**
 * The frosted glass card holding a slide's name/price/CTA, in two colorways:
 * dark (over a hero photo, white text) and light (over the ambient wash, ink
 * text). One motion unit with plain children — nested staggered fades under a
 * backdrop-blur element shimmer, so the card must rise as a whole.
 */
function GlassPanel({
  product,
  dark = false,
  onOpen,
  className = "",
  enter,
  hintEmphasis = false,
}: {
  product: ProductSummary;
  dark?: boolean;
  onOpen: () => void;
  className?: string;
  enter: MotionProps;
  /** True during the up-hint phase — the hint line pulses with the card hop. */
  hintEmphasis?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const c = dark
    ? {
        panel: "border-white/25 bg-ink/25 text-white shadow-[0_20px_60px_-20px_rgb(0_0_0/0.5)]",
        soft: "text-white/80",
        muted: "text-white/70",
        cta: "bg-white/90 text-ink hover:bg-white",
        hint: "text-white/60",
      }
    : {
        panel: "border-white/50 bg-white/35 shadow-[0_20px_60px_-20px_rgb(28_23_19/0.3)]",
        soft: "text-ink-soft",
        muted: "text-ink-soft",
        cta: "border border-ink/20 bg-ivory/60 hover:bg-ink hover:text-ivory",
        hint: "text-ink-soft",
      };

  return (
    <motion.div
      {...enter}
      // mouse pointer-downs stop here so the track's drag doesn't swallow
      // them — that's what makes the panel text selectable on desktop.
      // Touch still bubbles through and swipes the carousel as usual.
      onPointerDownCapture={(e) => {
        if (e.pointerType === "mouse") e.stopPropagation();
      }}
      className={`w-full max-w-xl cursor-auto select-text rounded-3xl border px-6 py-6 text-center backdrop-blur-2xl md:max-w-2xl md:px-8 md:py-6 ${c.panel} ${className}`}
    >
      <h2 className="font-display text-3xl tracking-tight md:text-5xl">
        <ProductName name={product.name} />
      </h2>
      <p className={`mt-1.5 md:text-lg ${c.soft}`}>{product.tagline}</p>

      {/* desktop spreads sideways instead of stacking: price + stars on the
          left, CTA + gesture hint on the right — a shorter, wider card */}
      <div className="mt-3 grid grid-cols-1 justify-items-center gap-2 md:mt-5 md:grid-cols-2 md:items-center md:gap-x-6">
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg md:text-xl">
            From {formatPrice(product.basePriceCents)}
          </span>
          <StarRating
            stacked
            rating={product.avgRating}
            count={product.reviewCount}
            mutedClassName={dark ? "text-white/70" : undefined}
          />
        </div>
        <div className="mt-3 flex flex-col items-center gap-2.5 md:mt-0">
          <button
            type="button"
            onClick={onOpen}
            className={`rounded-full px-6 py-2.5 text-sm transition-colors ${c.cta}`}
          >
            Explore this mattress
          </button>
          <motion.p
            className={`text-xs ${c.hint}`}
            // the line swells the moment the third chevron lands (entrance
            // completes at ~1.6s) — a nudge, not a shout
            animate={hintEmphasis ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={
              hintEmphasis
                ? { delay: 1.6, duration: 0.6, times: [0, 0.45, 1], ease: ["easeOut", "easeIn"] }
                : { duration: 0.3 }
            }
          >
            swipe up
            <span className="hidden md:inline">
              {" "}
              or <Kbd>↑</Kbd>
            </span>{" "}
            for a quick look
            {reduceMotion && (
              <>
                {" "}
                · swipe down
                <span className="hidden md:inline">
                  {" "}
                  or <Kbd>↓</Kbd>
                </span>{" "}
                to browse all mattresses
              </>
            )}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * One slide of the landing carousel, in one of two layouts:
 *
 * - Immersive: when the product's hero photo loads, it fills the entire
 *   viewport edge-to-edge and the title/price/CTA sit in a frosted glass
 *   panel (iOS-style) with white text near the bottom.
 * - Classic: no hero yet (or it 404s) — the hue-gradient placeholder card on
 *   a pedestal glow, ink text on the ambient wash.
 */
export function ProductSlide({ product, active, priority, onPeek, onOpen, onHeroLayout }: Props) {
  const reduceMotion = useReducedMotion();
  const hue = ambientHue(product.slug);
  // Only a true "-hero" shot earns the immersive full-bleed treatment;
  // -front/-diagonal leads use the classic contained layout.
  const heroUrl = isHeroShot(product.heroImageKey) ? imageUrl(product.heroImageKey) : null;
  const [heroState, setHeroState] = useState<"pending" | "ok" | "failed">(
    heroUrl ? "pending" : "failed",
  );
  const hintPhase = useHintPhase(active, reduceMotion ?? false);

  useEffect(() => {
    if (active) onHeroLayout?.(heroState === "ok");
  }, [active, heroState, onHeroLayout]);

  // Text block softly rises in when the slide takes the stage.
  const enter = (delay: number): MotionProps => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: active ? 1 : 0, y: active ? 0 : 10 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.45, ease: EASE, delay: active ? delay : 0 },
  });

  if (heroState !== "failed" && heroUrl) {
    return (
      <section
        aria-label={product.name}
        inert={!active}
        className="relative h-full min-w-full"
      >
        {/* the hero floats on an ink backdrop, edges dissolving into the
            dark. Mobile: a tight square crop — the sides (windows, side
            tables) are cut so the bed owns the frame. Desktop: subtler —
            the photo keeps its ~16:9 shape at 90% width, so it still
            dominates the stage, just with soft edges instead of a hard
            full-bleed crop. */}
        <div className="absolute inset-0 bg-ink">
          {/* the hero IS the stage: tap anywhere on it for a quick look */}
          {/* tap-to-peek is desktop-only: on touch it fired on every stray
              tap between swipes, fighting the slide/scroll gestures */}
          <button
            type="button"
            onClick={onPeek}
            aria-label={`Quick look at ${product.name}`}
            className="pointer-events-none absolute inset-x-0 top-[7dvh] block aspect-square md:pointer-events-auto md:inset-x-[5%] md:top-[4dvh] md:aspect-video md:max-h-[82dvh]"
          >
            <Image
              src={heroUrl}
              alt={product.name}
              fill
              sizes="100vw"
              priority={priority}
              // hero slides sit far off-viewport in the translated track, so
              // default lazy loading only kicks in mid-swipe — a visible flash
              // of ambient hue before the photo fades in. Load them up front.
              loading={priority ? undefined : "eager"}
              draggable={false}
              className={`object-cover transition-opacity duration-700 ${
                heroState === "ok" ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setHeroState("ok")}
              onError={() => setHeroState("failed")}
            />
            {/* legibility wash under the glass panel */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/50 to-transparent"
            />
            {/* mobile bleeds: photo dissolves into the ink above and below */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-ink to-transparent md:hidden"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-ink md:hidden"
            />
            {/* desktop bleeds: gentler fades on all four edges */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 hidden h-20 bg-gradient-to-b from-ink to-transparent md:block"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 hidden h-24 bg-gradient-to-t from-ink to-transparent md:block"
            />
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-ink to-transparent md:block"
            />
            <div
              aria-hidden
              className="absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-ink to-transparent md:block"
            />
          </button>

          {/* inactive dim: a scrim over the photo, never photo transparency —
              fading the photo itself lets the ambient hue bleed through
              mid-swipe, a visible flash between adjacent hero slides */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-ink"
            initial={false}
            animate={{ opacity: active ? 0 : 0.45 }}
            transition={{ duration: 0.5, ease: EASE }}
          />

          {/* moonlit cloud banks drift through the ink beneath the photo —
              the card's backdrop-blur frosts them as they pass behind it */}
          <AmbientClouds slug={product.slug} active={active} tone="dusk" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-12 md:px-6 md:pb-24">
            <UpArrowSlot show={hintPhase === "up"} className="hidden text-white/80 md:flex" />
            <HeavyLift lifting={hintPhase === "up"}>
              <GlassPanel
                product={product}
                dark
                onOpen={onOpen}
                enter={enter(0.06)}
                className="pointer-events-auto"
                hintEmphasis={hintPhase === "up"}
              />
            </HeavyLift>
            <UpArrowSlot show={hintPhase === "up"} className="text-white/80 md:hidden" />
          </div>

          <DownHint show={hintPhase === "down"} dark />
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label={product.name}
      inert={!active}
      className="relative flex h-full min-w-full flex-col items-center justify-center px-6 pb-24 pt-16 md:pb-28 md:pt-20"
    >
      <AmbientClouds slug={product.slug} active={active} />
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
            background: `radial-gradient(closest-side, hsl(${hue} 42% 68% / 0.4), transparent 72%)`,
          }}
        />

        <button
          type="button"
          onClick={onPeek}
          aria-label={`Quick look at ${product.name}`}
          className="group pointer-events-none relative block aspect-[16/10] max-h-[36dvh] w-full max-w-3xl md:pointer-events-auto md:max-h-[46dvh]"
        >
          <ProductImage
            imageKey={product.heroImageKey}
            alt={product.name}
            sizes="(min-width: 768px) 768px, 100vw"
            priority={priority}
            placeholderClassName="rounded-3xl shadow-[0_30px_80px_-30px_rgb(28_23_19/0.35)]"
            className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </button>

        <UpArrowSlot show={hintPhase === "up"} className="hidden text-ink-soft md:flex" />
        {/* light frosted twin of the hero's dark glass — its backdrop-blur
            frosts the clouds drifting behind it */}
        <HeavyLift lifting={hintPhase === "up"}>
          <GlassPanel
            product={product}
            onOpen={onOpen}
            enter={enter(0.08)}
            className="mt-6 md:mt-0"
            hintEmphasis={hintPhase === "up"}
          />
        </HeavyLift>
        <UpArrowSlot show={hintPhase === "up"} className="mt-2 text-ink-soft md:hidden" />
      </motion.div>

      <DownHint show={hintPhase === "down"} dark={false} />
    </section>
  );
}
