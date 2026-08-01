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

/** Layer silhouettes: sc/y shape each bank via bankPath, back to front. */
const LAYERS = [
  { sc: 1.2, y: 92 },
  { sc: 1.5, y: 122 },
  { sc: 1.0, y: 150 },
];

/**
 * Per-side silhouettes, precomputed once at module load.
 *
 * `mobile` is a third, standalone silhouette: one full-width bank of a few
 * wide, low bumps. Phone viewports squeeze the 1440-unit viewBox into a
 * couple hundred CSS pixels, so the desktop bump counts read as spikes —
 * fewer and broader keeps the clouds cloud-shaped at that compression.
 */
const SIDES = {
  left: {
    paths: LAYERS.map((l) =>
      bankPath([[200, 34], [150, 20], [240, 46], [170, 26], [130, 14], [210, 38], [160, 22], [180, 30]], l.sc, l.y),
    ),
  },
  right: {
    paths: LAYERS.map((l) =>
      bankPath([[180, 26], [220, 44], [140, 18], [190, 34], [160, 22], [230, 40], [150, 16], [170, 28]], l.sc, l.y),
    ),
  },
  mobile: {
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

// Each desktop bank dissolves at its inner edge — without this the SVG's
// hard vertical cut at 42%/58% viewport reads as two faint seam lines
// mid-stage (the old drift animation used to keep those edges moving).
const INNER_FADE = {
  left: "linear-gradient(90deg, black 70%, transparent 100%)",
  right: "linear-gradient(270deg, black 70%, transparent 100%)",
  mobile: undefined,
} as const;

function CloudBank({ side, fills }: { side: keyof typeof SIDES; fills: string[] }) {
  const { paths } = SIDES[side];
  const fade = INNER_FADE[side];

  return (
    <div
      className={`absolute bottom-0 h-full ${
        side === "mobile" ? "inset-x-0" : side === "left" ? "left-0 w-[58%]" : "right-0 w-[58%]"
      }`}
      style={fade ? { maskImage: fade, WebkitMaskImage: fade } : undefined}
    >
      {paths.map((d, i) => (
        <svg
          key={i}
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-full w-full"
        >
          <path d={d} fill={fills[i]} />
        </svg>
      ))}
    </div>
  );
}

/**
 * Velvet cloud banks pinned to the bottom of a slide, in deepened shades of
 * the product's tone. Crisp static SVG — pure paint, no animation loops.
 * Mounted inside classic slides only (hero photos carry their own
 * atmosphere), above the placeholder, below the glass panel — whose
 * backdrop-blur frosts the clouds behind it. The bank fades in as its slide
 * takes the stage.
 */
export function AmbientClouds({ slug, active }: { slug: string; active: boolean }) {
  const { h, s } = ambientTone(slug);
  const fills = layerFills(h, s);

  return (
    <div
      aria-hidden
      // the enter delay makes the clouds the LAST act of a slide's staged
      // entrance — the glass card must be fully opaque before anything dark
      // blooms behind it, or the translucent card reads as sitting behind
      // the clouds. Leaving is immediate (delay only applies on activate).
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-[26dvh] overflow-hidden transition-opacity duration-700 motion-reduce:transition-none md:h-[32dvh] ${
        active ? "opacity-100 delay-500" : "opacity-0 delay-0"
      }`}
    >
      <div
        className="absolute inset-0 md:hidden"
        style={{ maskImage: MOBILE_MASK, WebkitMaskImage: MOBILE_MASK }}
      >
        <CloudBank side="mobile" fills={fills} />
      </div>
      <div
        className="absolute inset-0 hidden md:block"
        style={{ maskImage: STRIP_MASK, WebkitMaskImage: STRIP_MASK }}
      >
        <CloudBank side="left" fills={fills} />
        <CloudBank side="right" fills={fills} />
      </div>
    </div>
  );
}
