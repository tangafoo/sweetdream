"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ambientTone } from "@/lib/ambient";

/**
 * Scalloped cloud-bank silhouettes. sweetdream is stars and clouds — this is
 * the clouds part. Left and right banks get different bump arrangements so
 * the two sides never mirror each other.
 */
function bankPath(bumps: Array<[width: number, amp: number]>, scale: number, y: number): string {
  let d = `M0 ${y}`;
  let x = 0;
  for (const [w, a] of bumps) {
    d += ` Q ${x + w / 2} ${Math.round(y - a * scale)} ${x + w} ${y}`;
    x += w;
  }
  return `${d} V 200 H 0 Z`;
}

/**
 * Layer geometry and motion. Each layer sways, bobs, and puff-breathes on its
 * own easeInOut clock — sc/y shape the silhouette (via bankPath), bob/sway are
 * amplitudes in SVG units, puff is the breathing scale peak, and dy/dx/ds are
 * the seconds per bob/sway/breath cycle. All durations are deliberately
 * distinct so the phases slide past each other and never visibly repeat.
 */
const LAYERS = [
  { sc: 1.2, y: 92, bob: 10, sway: 26, puff: 1.05, dy: 19, dx: 27, ds: 23 },
  { sc: 1.5, y: 122, bob: 16, sway: 34, puff: 1.08, dy: 14, dx: 21, ds: 17 },
  { sc: 1.0, y: 150, bob: 7, sway: 18, puff: 1.04, dy: 11, dx: 15, ds: 13 },
];

/**
 * Per-side character: silhouette, sway direction, and tempo. The right bank
 * runs ~35% slower than the left and sways the opposite way — two skies, two
 * tempos. Paths are pure constants, precomputed once at module load.
 *
 * `mobile` is a third, standalone silhouette: one full-width bank of a few
 * wide, low bumps. Phone viewports squeeze the 1440-unit viewBox into a
 * couple hundred CSS pixels, so the desktop bump counts read as spikes —
 * fewer and broader keeps the clouds cloud-shaped at that compression.
 */
const SIDES = {
  left: {
    dir: 1,
    tempo: 1,
    paths: LAYERS.map((l) =>
      bankPath([[200, 34], [150, 20], [240, 46], [170, 26], [130, 14], [210, 38], [160, 22], [180, 30]], l.sc, l.y),
    ),
  },
  right: {
    dir: -1,
    tempo: 1.35,
    paths: LAYERS.map((l) =>
      bankPath([[180, 26], [220, 44], [140, 18], [190, 34], [160, 22], [230, 40], [150, 16], [170, 28]], l.sc, l.y),
    ),
  },
  mobile: {
    dir: 1,
    tempo: 1.2,
    paths: LAYERS.map((l) =>
      bankPath([[380, 22], [340, 34], [400, 26], [320, 16]], l.sc, l.y),
    ),
  },
} as const;

/** Deepened shades of the product tone, one per layer, darkest in front. */
function layerFills(h: number, s: number): string[] {
  const deep = Math.min(s + 24, 72);
  const rich = Math.min(s + 34, 78);
  return [
    `hsl(${h + 6} ${deep}% 40% / 0.35)`,
    `hsl(${h + 14} ${deep}% 28% / 0.45)`,
    `hsl(${h + 22} ${rich}% 18% / 0.55)`,
  ];
}

// Film-strip fade: one smooth horizontal ramp — soft at both ends, full
// strength around the lower corners, dipping to a faint presence mid-stage
// so the content stays clear. No plateaus, no hard zones, no visible seams.
const STRIP_MASK =
  "linear-gradient(90deg, transparent 0%, rgb(0 0 0 / 0.5) 10%, black 22%, rgb(0 0 0 / 0.4) 38%, rgb(0 0 0 / 0.15) 50%, rgb(0 0 0 / 0.4) 62%, black 78%, rgb(0 0 0 / 0.5) 90%, transparent 100%)";

// Mobile: the single bank spans edge to edge, so no horizontal shaping —
// just one vertical ramp that lets the cloud tops melt into the backdrop.
const MOBILE_MASK =
  "linear-gradient(180deg, transparent 0%, rgb(0 0 0 / 0.55) 30%, black 60%)";

function CloudBank({
  side,
  fills,
  reduceMotion,
}: {
  side: keyof typeof SIDES;
  fills: string[];
  reduceMotion: boolean;
}) {
  const { dir, tempo, paths } = SIDES[side];

  return (
    <div
      className={`absolute bottom-0 h-full ${
        side === "mobile" ? "inset-x-0" : side === "left" ? "left-0 w-[58%]" : "right-0 w-[58%]"
      }`}
    >
      {LAYERS.map((layer, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-full w-full"
          style={{ transformOrigin: "50% 100%" }}
          {...(reduceMotion
            ? {}
            : {
                animate: {
                  y: [0, -layer.bob, 0, -layer.bob * 0.55, 0],
                  x: [0, layer.sway * dir, -layer.sway * 0.6 * dir, 0],
                  scale: [1, layer.puff, 0.985, 1],
                },
                transition: {
                  y: { duration: layer.dy * tempo, repeat: Infinity, ease: "easeInOut" },
                  x: { duration: layer.dx * tempo, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: layer.ds * tempo, repeat: Infinity, ease: "easeInOut" },
                },
              })}
        >
          <path d={paths[i]} fill={fills[i]} />
        </motion.svg>
      ))}
    </div>
  );
}

/**
 * Velvet cloud banks pinned to the bottom of a slide, in deepened shades of
 * the product's tone. Crisp SVG — no rasterized blur. Mounted inside classic
 * slides only (hero photos carry their own atmosphere), above the
 * placeholder, below the glass panel — whose backdrop-blur frosts the clouds
 * breathing behind it. The bank only exists while its slide holds the stage:
 * it blooms in from blank once the paging spring settles.
 */
export function AmbientClouds({ slug, active }: { slug: string; active: boolean }) {
  const reduceMotion = useReducedMotion() ?? false;
  const { h, s } = ambientTone(slug);
  const fills = layerFills(h, s);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[26dvh] overflow-hidden md:h-[32dvh]"
    >
      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            key="clouds"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // ride the outgoing slide: stay solid through most of the paging
            // spring, then fade once the slide is essentially offscreen — an
            // immediate fade reads as the clouds blinking out mid-flight
            exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.3 } }}
            // hold the bloom until the paging spring has mostly settled, so
            // the clouds fill in after the slide lands instead of mid-flight
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.9, ease: "easeOut", delay: 0.3 }
            }
          >
            <div
              className="absolute inset-0 md:hidden"
              style={{ maskImage: MOBILE_MASK, WebkitMaskImage: MOBILE_MASK }}
            >
              <CloudBank side="mobile" fills={fills} reduceMotion={reduceMotion} />
            </div>
            <div
              className="absolute inset-0 hidden md:block"
              style={{ maskImage: STRIP_MASK, WebkitMaskImage: STRIP_MASK }}
            >
              <CloudBank side="left" fills={fills} reduceMotion={reduceMotion} />
              <CloudBank side="right" fills={fills} reduceMotion={reduceMotion} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
