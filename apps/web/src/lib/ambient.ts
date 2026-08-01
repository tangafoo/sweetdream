/**
 * Per-product ambient palette for the landing carousel.
 *
 * Colorblocked brand palette: every backdrop stays inside the grey→blue
 * family, but saturation and lightness swing product to product — from
 * near-neutral silvers through steely mids to icy pales, with the Royal
 * Blues wearing the richest blue in the lineup. Lightness stays high enough
 * that ink (#1c1713) text is always comfortable on top.
 */

type Tone = { h: number; s: number; l: number };

const TONES: Record<string, Tone> = {
  "sweet-luxury-16": { h: 228, s: 14, l: 88 }, // silver
  "sweet-comfort-14": { h: 214, s: 30, l: 87 }, // soft blue
  "unity-14": { h: 210, s: 42, l: 84 }, // confident steel-sky
  "sweet-icesilk-13": { h: 196, s: 48, l: 88 }, // icy pale blue
  "sweet-harmony-14": { h: 218, s: 10, l: 91 }, // quiet pale grey
  "spine-support-12": { h: 222, s: 26, l: 82 }, // steel
  "sleep-ortho-12": { h: 208, s: 18, l: 86 }, // clinical grey-blue
  "hotel-spinal-12": { h: 230, s: 16, l: 84 }, // slate
  "dream-cloud-13": { h: 204, s: 36, l: 90 }, // cloud blue
  "sleep-care-25cm": { h: 216, s: 8, l: 89 }, // near-neutral grey
  "sweet-repose-10": { h: 212, s: 22, l: 88 }, // dove blue-grey
  "royal-blue-5-star-40cm": { h: 226, s: 52, l: 82 }, // royal blue, naturally
  "royal-blue-emporium": { h: 236, s: 40, l: 80 }, // deep indigo-slate
};

/** Deterministic 0–99999 hash — the seed for every derived tone (ambient
 * washes here, image placeholders in ProductImage). */
export function toneHash(str: string): number {
  let n = 0;
  for (let i = 0; i < str.length; i++) {
    n = (n * 31 + str.charCodeAt(i)) % 100000;
  }
  return n;
}

/** Deterministic fallback for slugs not in the hand-tuned map — grey→blue only. */
function hashTone(slug: string): Tone {
  const n = toneHash(slug);
  return { h: 198 + (n % 42), s: 8 + ((n >> 3) % 38), l: 84 + ((n >> 7) % 7) };
}

export function ambientTone(slug: string): Tone {
  return TONES[slug] ?? hashTone(slug);
}

export function ambientHue(slug: string): number {
  return ambientTone(slug).h;
}

/**
 * Full-viewport ambient wash: a soft radial glow near top-center (the "stage
 * light" over the mattress) over a bolder, blockier diagonal wash that
 * deepens toward the bottom-right corner.
 */
export function ambientBackground(slug: string): string {
  const { h, s, l } = ambientTone(slug);
  return [
    `radial-gradient(110% 70% at 50% 18%, hsl(${h} ${Math.min(s + 10, 58)}% ${Math.min(l + 6, 96)}%) 0%, transparent 62%)`,
    `linear-gradient(165deg, hsl(${h} ${s}% ${Math.min(l + 7, 97)}%) 0%, hsl(${h} ${Math.min(s + 6, 58)}% ${l - 2}%) 48%, hsl(${h + 12} ${Math.min(s + 16, 62)}% ${l - 16}%) 100%)`,
  ].join(", ");
}

