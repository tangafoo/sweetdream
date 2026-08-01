"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * A hand-doodled gesture mark — three pen flicks, no two alike. The lead
 * stroke is a wide confident sweep with uneven arms; a narrower one huddles
 * right under it, drifting left of center; the last trails off further down,
 * lighter and lazier, wandering right.
 *
 * Choreography, in two acts:
 * 1. Entrance — the stroke furthest from the text/card lands first, the
 *    others follow at 0.5s beats, each popping in with overshoot and a
 *    little twist. Grand entrances only.
 * 2. Drift — once everyone's on stage, the column settles into a slow
 *    rippling slide in the swipe direction until the parent fades it out.
 */
const STROKES = [
  // opening flick nearest the text: small, tight, tentative
  { d: "M14 4 Q19 6 23 12 Q28 7 33 3", w: 1.4, o: 0.5 },
  // second beat: wider, leaning right, gaining confidence
  { d: "M12 20 Q19 23 24 29 Q30 23 37 20", w: 1.8, o: 0.75 },
  // the finale, furthest out: the wide bold sweep at full contrast —
  // the gesture crescendos in the direction it's pointing
  { d: "M5 38 Q16 41 24 49 Q33 42 44 36", w: 2.4, o: 1 },
] as const;

// stroke 2 (the straggler) sits furthest out in both directions, so it
// opens the show; the bold lead sweep arrives last, closest to the card
const ENTRANCE_STAGGER_S = 0.5;
const ENTRANCE_POP_S = 0.6;
const DRIFT_LOOP_S = 2;

/** Seconds until the last chevron lands — the cue for the hint-text pulse. */
export const ENTRANCE_TOTAL_S = (STROKES.length - 1) * ENTRANCE_STAGGER_S + ENTRANCE_POP_S;
/** Seconds until the second drift loop kicks off — the cue for the card hop. */
export const SECOND_DRIFT_TICK_S = ENTRANCE_TOTAL_S + DRIFT_LOOP_S;

const ENTRANCE_TOTAL_MS = ENTRANCE_TOTAL_S * 1000;

/**
 * Keycap chip for gesture hints — the daisyUI-style kbd look: hairline
 * border with a thicker bottom edge for key depth, tinted from currentColor
 * so it sits naturally on both the dark and light hint colorways.
 */
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded border border-b-2 border-current/30 bg-current/10 px-1 align-middle font-sans text-[10px] leading-none">
      {children}
    </kbd>
  );
}

/**
 * Gentle swell for a hint line, cued to the moment the third chevron lands
 * (the entrance finishes at ENTRANCE_TOTAL_MS). Mount-scoped: runs once per
 * appearance, so anything inside AnimatePresence re-pulses each visit.
 */
export function HintPulse({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      animate={{ scale: [1, 1.08, 1] }}
      transition={{
        delay: ENTRANCE_TOTAL_S,
        duration: 0.6,
        times: [0, 0.45, 1],
        ease: ["easeOut", "easeIn"],
      }}
    >
      {children}
    </motion.span>
  );
}

export function HintChevrons({ dir }: { dir: "up" | "down" }) {
  const [drifting, setDrifting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrifting(true), ENTRANCE_TOTAL_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <span aria-hidden className={`block ${dir === "up" ? "rotate-180" : ""}`}>
      <svg viewBox="0 0 48 56" className="h-12 w-10" fill="none" stroke="currentColor">
        {STROKES.map((s, i) => (
          <motion.path
            key={i}
            d={s.d}
            strokeWidth={s.w}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            initial={{ opacity: 0, scale: 0.3, rotate: -12 }}
            animate={
              drifting
                ? { opacity: s.o, scale: 1, rotate: 0, y: [0, 7, 0] }
                : { opacity: s.o, scale: [0.3, 1.2, 1], rotate: [-12, 6, 0] }
            }
            transition={
              drifting
                ? {
                    y: {
                      duration: DRIFT_LOOP_S,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.22,
                    },
                    duration: 0.3,
                  }
                : {
                    duration: ENTRANCE_POP_S,
                    delay: (STROKES.length - 1 - i) * ENTRANCE_STAGGER_S,
                    ease: [0.34, 1.56, 0.64, 1],
                  }
            }
          />
        ))}
      </svg>
    </span>
  );
}
