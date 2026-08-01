"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ProductSummary } from "@/lib/queries";
import { DotStrip } from "./DotStrip";
import { FullNav } from "./FullNav";
import { ProductSlide } from "./ProductSlide";
import { QuickNav } from "./QuickNav";
import { QuickView } from "./QuickView";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The landing carousel. Paging is a native CSS scroll-snap track — the
 * browser owns swipe physics, momentum, and edge clamping, so slides can
 * never settle between snap points or overshoot past the ends. `index` is
 * derived from scroll position; programmatic navigation (keys, dots, navs)
 * just scrolls the track.
 */
export function CarouselStage({ products }: { products: ProductSummary[] }) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  // False until the initial ?p=/random jump has been applied — the stage is
  // held invisible so visitors never see a flash of slide 0.
  const [ready, setReady] = useState(false);
  // Vertical ladder, one rung per gesture. Up goes deeper into the product:
  // quick-look sheet, then the full product page. Down goes wider into
  // navigation: the switcher strip (level 1), then the immersive full nav
  // (level 2). The opposite direction steps back; peek and nav never overlap.
  const [peek, setPeek] = useState(false);
  const [navLevel, setNavLevel] = useState(0);

  const indexRef = useRef(index);
  indexRef.current = index;

  const scrollToIndex = useCallback(
    (i: number) => {
      const clamped = Math.min(products.length - 1, Math.max(0, i));
      setIndex(clamped);
      const el = trackRef.current;
      if (!el) return;
      // Long jumps (navs, dots across the deck) teleport instead of flying
      // through every slide in between; neighbors glide.
      const smooth = Math.abs(clamped - Math.round(el.scrollLeft / el.clientWidth)) <= 2;
      el.scrollTo({
        left: clamped * el.clientWidth,
        behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto",
      });
    },
    [products.length],
  );

  // Restore position from ?p=<slug>, or land on a random mattress (starter-
  // selection style). Read on the client in a layout effect so `/` stays
  // static and Math.random never runs during render (no hydration mismatch).
  useLayoutEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("p");
    const found = slug ? products.findIndex((p) => p.slug === slug) : -1;
    const i = found >= 0 ? found : Math.floor(Math.random() * products.length);
    setIndex(i);
    const el = trackRef.current;
    if (el) el.scrollLeft = i * el.clientWidth;
    setReady(true);
  }, [products]);

  // index follows the scroll position (throttled to one update per frame).
  const rafRef = useRef(0);
  const onScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const el = trackRef.current;
      if (!el) return;
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setIndex(Math.min(products.length - 1, Math.max(0, i)));
    });
  };
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // Rotation/resize changes the slide width — re-pin the current slide.
  useEffect(() => {
    const onResize = () => {
      const el = trackRef.current;
      if (el) el.scrollLeft = indexRef.current * el.clientWidth;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Reflect position in the URL for refresh/share (no navigation, no
  // re-render). Gated on `ready` so a `?p=` slug is never clobbered by the
  // pre-restore slide 0 render.
  useEffect(() => {
    if (!ready) return;
    window.history.replaceState(null, "", index === 0 ? "/" : `/?p=${products[index].slug}`);
  }, [ready, index, products]);

  const openProduct = useCallback(
    (i: number) => router.push(`/products/${products[i].slug}`),
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
        scrollToIndex(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollToIndex(index + 1);
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
  }, [index, peek, navLevel, scrollToIndex, ascend, descend]);

  // Wheel: horizontal intent scrolls the snap track natively — only vertical
  // intent is ours. Fingers swiping up (deltaY > 0) raise the sheet from the
  // bottom — again for the full detail page — while fingers swiping down
  // (deltaY < 0) pull the nav down from the top. The opposite motion pushes
  // an overlay back where it came from.
  const wheelY = useRef(0);
  const wheelLockUntil = useRef(0);
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      wheelY.current = 0;
      return;
    }
    const now = performance.now();
    if (now < wheelLockUntil.current) return;
    wheelY.current += e.deltaY;
    if (wheelY.current > 140) {
      wheelY.current = 0;
      wheelLockUntil.current = now + 800;
      ascend();
    } else if (wheelY.current < -120) {
      wheelY.current = 0;
      wheelLockUntil.current = now + 800;
      descend();
    }
  };

  // Touch: the track's touch-action is pan-x, so horizontal swipes scroll
  // natively and predominantly-vertical swipes fall through to us — up
  // raises the quick look / full page, down lowers the sheet or opens the
  // switcher. (Overlays stop touch propagation and handle their own gestures.)
  const touchStart = useRef<{ x: number; y: number } | null>(null);
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
    <main
      aria-roledescription="carousel"
      aria-label="Mattress collection"
      className={`relative h-dvh overflow-hidden transition-opacity duration-500 motion-reduce:transition-none ${
        ready ? "opacity-100" : "opacity-0"
      }`}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* the snap track: native scroll, one full-viewport slide per snap
          point. overscroll-x-contain keeps edge swipes from turning into
          browser back/forward navigation. */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        style={{ touchAction: "pan-x" }}
      >
        {products.map((product, i) => (
          <ProductSlide
            key={product.slug}
            product={product}
            active={i === index}
            near={Math.abs(i - index) <= 1}
            onPeek={() => setPeek(true)}
            onOpen={() => openProduct(i)}
            onHeroLayout={i === index ? setHeroLive : undefined}
          />
        ))}
      </div>

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
        onClick={() => scrollToIndex(index - 1)}
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
        onClick={() => scrollToIndex(index + 1)}
        disabled={index === products.length - 1}
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-ink/10 bg-ivory/70 p-3 backdrop-blur transition-opacity hover:bg-sand disabled:opacity-0 md:block"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <DotStrip products={products} index={index} onSelect={scrollToIndex} />

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
          scrollToIndex(i);
          setNavLevel(0);
        }}
        onClose={() => setNavLevel(0)}
      />

      <FullNav
        products={products}
        index={index}
        open={navLevel === 2}
        onSelect={(i) => {
          scrollToIndex(i);
          setNavLevel(0);
        }}
        onClose={() => setNavLevel(0)}
      />
    </main>
  );
}
