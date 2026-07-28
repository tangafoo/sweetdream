/**
 * Per-product ambient palette for the landing carousel.
 *
 * Each mattress gets a hand-tuned hue that loosely evokes its name; the
 * carousel stage washes the whole viewport in a soft gradient built from it
 * (Pokémon starter-screen style). Saturation/lightness are kept in a muted,
 * near-ivory band so ink (#1c1713) text stays comfortably readable on top.
 */

const HUES: Record<string, number> = {
  "aurora-cloud": 158, // aurora green shimmer
  "nimbus-one": 215, // rain-cloud blue
  "drift-hybrid": 190, // drifting sea teal
  "solace-firm": 35, // calm warm amber
  "meridian-luxe": 45, // gilded gold
  "haven-organic": 110, // leafy green
  "atlas-support": 230, // stone slate blue
  "lumen-cool": 205, // cool daylight
  "ember-plush": 20, // glowing ember
  "tidal-balance": 175, // tidal aqua
  "sierra-latex": 70, // high-desert sage
  "velvet-night": 275, // violet dusk
  "polaris-elite": 250, // north-star indigo
  "onyx-reserve": 335, // deep wine plum
};

/** Deterministic fallback for slugs not in the hand-tuned map. */
function hashHue(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) % 360;
  }
  return h;
}

export function ambientHue(slug: string): number {
  return HUES[slug] ?? hashHue(slug);
}

/**
 * Full-viewport ambient wash: a soft radial glow near top-center (the "stage
 * light" over the mattress) layered on a gentle diagonal linear wash. Muted
 * enough that ink text passes contrast everywhere.
 */
export function ambientBackground(slug: string): string {
  const h = ambientHue(slug);
  const h2 = (h + 25) % 360;
  return [
    `radial-gradient(110% 70% at 50% 18%, hsl(${h} 42% 86%) 0%, transparent 62%)`,
    `linear-gradient(165deg, hsl(${h} 34% 94%) 0%, hsl(${h2} 28% 88%) 100%)`,
  ].join(", ");
}
