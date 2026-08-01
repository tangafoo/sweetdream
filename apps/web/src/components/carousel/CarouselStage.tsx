"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ambientBackground } from "@/lib/ambient";
import type { ProductSummary } from "@/lib/queries";
import { DotStrip } from "./DotStrip";
import { FullNav } from "./FullNav";
import { ProductSlide } from "./ProductSlide";
import { QuickNav } from "./QuickNav";
import { QuickView } from "./QuickView";

const SWIPE_DISTANCE = 80; // px
const SWIPE_POWER = 8000; // offset.x * |velocity.x|

export function CarouselStage({ products }: { products: ProductSummary[] }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  // False until the initial ?p=/random jump has been applied: while false the
  // track snaps instantly (no N-slide fly-by) and the stage is held invisible.
  const [ready, setReady] = useState(false);
  // Vertical ladder, one rung per gesture. Up goes deeper into the product:
  // quick-look sheet, then the full product page. Down goes wider into
  // navigation: the switcher strip (level 1), then the immersive full nav
  // (level 2). The opposite direction steps back; peek and nav never overlap.
  const [peek, setPeek] = useState(false);
  const [navLevel, setNavLevel] = useState(0);
  const draggingRef = useRef(false);
  const wheelX = useRef(0);
  const wheelY = useRef(0);
  const wheelLockUntil = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (i: number) => setIndex(Math.min(products.length - 1, Math.max(0, i))),
    [products.length],
  );

  // Restore position from ?p=<slug>, or land on a random mattress (starter-
  // selection style). Read on the client in a layout effect so `/` stays
  // static and Math.random never runs during render (no hydration mismatch).
  useLayoutEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("p");
    const i = slug ? products.findIndex((p) => p.slug === slug) : -1;
    setIndex(i >= 0 ? i : Math.floor(Math.random() * products.length));
  }, [products]);

  // Reveal the stage only after the initial jump has been committed.
  useEffect(() => {
    setReady(true);
  }, []);

  // Reflect position in the URL for refresh/share (no navigation, no
  // re-render). Gated on `ready` so a `?p=` slug is never clobbered by the
  // pre-restore slide 0 render.
  useEffect(() => {
    if (!ready) return;
    window.history.replaceState(null, "", index === 0 ? "/" : `/?p=${products[index].slug}`);
  }, [ready, index, products]);

  const openProduct = useCallback(
    (i: number) => {
      if (draggingRef.current) return;
      router.push(`/products/${products[i].slug}`);
    },
    [router, products],
  );

  // One rung of the vertical ladder, shared by ↑/↓ keys, wheel, and touch.
  // Ascend goes deeper into the product (unwind nav → raise the quick look →
  // open the full page); descend goes wider into navigation (lower the sheet
  // → switcher → immersive full nav).
  const ascend = useCallback(() => {
    if (navLevel > 0) setNavLevel(navLevel - 1);
    else if (peek) openProduct(index);
    else setPeek(true);
  }, [navLevel, peek, index, openProduct]);

  const descend = useCallback(() => {
    if (peek) setPeek(false);
    else setNavLevel(Math.min(2, navLevel + 1));
  }, [peek, navLevel]);

  // Arrow keys navigate (also while an overlay is open — quick comparison).
  // ↑ / Enter ascends, ↓ descends, Esc returns to neutral.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest("button, a, input, textarea, select")) {
        return; // don't fight focused interactive elements
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(index + 1);
      } else if (e.key === "ArrowUp" || e.key === "Enter") {
        e.preventDefault();
        ascend();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        descend();
      } else if (e.key === "Escape") {
        if (peek || navLevel > 0) {
          e.preventDefault();
          setPeek(false);
          setNavLevel(0);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, peek, navLevel, go, ascend, descend]);

  // Trackpad/wheel: horizontal intent pages the carousel. Vertical intent is
  // direct manipulation (matches touch): fingers swiping up (deltaY > 0)
  // raise the sheet from the bottom — again for the full detail page —
  // while fingers swiping down (deltaY < 0) pull the nav down from the top.
  // The opposite motion pushes an overlay back where it came from.
  const onWheel = (e: React.WheelEvent) => {
    const now = performance.now();
    if (now < wheelLockUntil.current) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      wheelX.current += e.deltaX;
      if (Math.abs(wheelX.current) > 90) {
        go(index + (wheelX.current > 0 ? 1 : -1));
        wheelX.current = 0;
        wheelY.current = 0;
        wheelLockUntil.current = now + 550;
      }
    } else if (e.deltaY > 0) {
      wheelY.current += e.deltaY;
      if (wheelY.current > 140) {
        wheelX.current = 0;
        wheelY.current = 0;
        wheelLockUntil.current = now + 800;
        ascend();
      }
    } else if (e.deltaY < 0) {
      wheelY.current += e.deltaY;
      if (wheelY.current < -120) {
        wheelX.current = 0;
        wheelY.current = 0;
        wheelLockUntil.current = now + 800;
        descend();
      }
    }
  };

  // Two-finger horizontal swipes must page the carousel, never trigger the
  // browser's back/forward gesture. overscroll-behavior-x handles Chrome;
  // this non-passive preventDefault covers the rest (React's own wheel
  // listeners are passive, so it has to be a native listener).
  const stageRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const preventHistorySwipe = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.preventDefault();
    };
    el.addEventListener("wheel", preventHistorySwipe, { passive: false });
    return () => el.removeEventListener("wheel", preventHistorySwipe);
  }, []);

  // Touch: predominantly-vertical swipes mirror the wheel — up raises the
  // quick look / full page, down lowers the sheet or opens the switcher.
  // (The track's own drag is x-locked, so neither fights paging; overlays
  // stop touch propagation and handle their own gestures.)
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dy) <= Math.abs(dx) * 1.2) return;
    if (dy < -70) ascend();
    else if (dy > 70) descend();
  };

  const activeSlug = products[index].slug;

  // True only while the active slide is really showing its full-bleed hero
  // photo — reported by the slide itself, so 404'd heroes that fall back to
  // the pale layout keep the light chrome.
  const [heroLive, setHeroLive] = useState(false);

  // Flag the body while a hero photo holds the stage so the fixed header
  // (outside this tree) can swap to the white logo via CSS.
  useEffect(() => {
    document.body.toggleAttribute("data-stage-dark", heroLive);
    return () => document.body.removeAttribute("data-stage-dark");
  }, [heroLive]);

  return (
    <motion.main
      ref={stageRef}
      aria-roledescription="carousel"
      aria-label="Mattress collection"
      className="relative h-dvh overflow-hidden"
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      // Hide any pre-hydration flash of slide 0, then fade the stage in once
      // the random/?p= position is applied — the "arrival" reveal.
      initial={{ opacity: 0 }}
      animate={{ opacity: ready ? 1 : 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
    >
      {/* ambient atmosphere: crossfades with the active mattress */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={activeSlug}
            className="absolute inset-0"
            style={{ background: ambientBackground(activeSlug) }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: "easeOut" }}
          />
        </AnimatePresence>
      </div>

      <motion.div
        className="relative flex h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: "pan-y" }}
        drag="x"
        // Below-threshold drags must spring back to the CURRENT slide.
        // (dragConstraints {left:0,right:0} looked equivalent but pinned the
        // spring target to x=0 — slide 0 — so any tiny no-op drag at index n
        // silently flew the track back to the first slide while `index`
        // still said n: the "blank dimmed slide" bug.)
        dragSnapToOrigin
        onDragStart={() => {
          draggingRef.current = true;
        }}
        onDragEnd={(_, info) => {
          // let the click that follows a drag get suppressed first
          setTimeout(() => {
            draggingRef.current = false;
          }, 0);
          const power = info.offset.x * Math.abs(info.velocity.x);
          if (info.offset.x < -SWIPE_DISTANCE || power < -SWIPE_POWER) go(index + 1);
          else if (info.offset.x > SWIPE_DISTANCE || power > SWIPE_POWER) go(index - 1);
        }}
        animate={{ x: `${-index * 100}%` }}
        transition={
          reduceMotion || !ready
            ? { duration: 0 } // snap: initial ?p=/random jump must not fly across N slides
            : { type: "spring", stiffness: 250, damping: 32 }
        }
      >
        {products.map((product, i) => (
          <ProductSlide
            key={product.slug}
            product={product}
            active={i === index}
            priority={i === 0}
            onPeek={() => setPeek(true)}
            onOpen={() => openProduct(i)}
            onHeroLayout={i === index ? setHeroLive : undefined}
          />
        ))}
      </motion.div>

      {/* position counter — white over full-bleed hero photos, ink over the
          pale ambient slides; the soft shadow keeps it legible either way */}
      <div
        className={`absolute right-6 top-6 text-sm tabular-nums transition-colors duration-500 md:right-10 ${
          heroLive
            ? "text-white/80 drop-shadow-[0_1px_4px_rgb(0_0_0/0.45)]"
            : "text-ink-soft"
        }`}
      >
        {String(index + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
      </div>

      {/* edge arrows (pointer devices) */}
      <button
        type="button"
        aria-label="Previous mattress"
        onClick={() => go(index - 1)}
        disabled={index === 0}
        className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-ink/10 bg-ivory/70 p-3 backdrop-blur transition-opacity hover:bg-sand disabled:opacity-0 md:block"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next mattress"
        onClick={() => go(index + 1)}
        disabled={index === products.length - 1}
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-ink/10 bg-ivory/70 p-3 backdrop-blur transition-opacity hover:bg-sand disabled:opacity-0 md:block"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <DotStrip products={products} index={index} onSelect={go} />

      <QuickView
        product={products[index]}
        open={peek}
        onClose={() => setPeek(false)}
        onExplore={() => openProduct(index)}
      />

      <QuickNav
        products={products}
        index={index}
        open={navLevel === 1}
        onSelect={(i) => {
          go(i);
          setNavLevel(0);
        }}
        onClose={() => setNavLevel(0)}
      />

      <FullNav
        products={products}
        index={index}
        open={navLevel === 2}
        onSelect={(i) => {
          go(i);
          setNavLevel(0);
        }}
        onClose={() => setNavLevel(0)}
      />
    </motion.main>
  );
}
