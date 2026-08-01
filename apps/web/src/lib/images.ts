const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

/**
 * Public URL for an R2 object key, or null when no bucket is configured —
 * components render a designed placeholder in that case.
 */
export function imageUrl(key: string): string | null {
  return R2_PUBLIC_URL && key ? `${R2_PUBLIC_URL}/${key}` : null;
}

/**
 * True for a genuine `-hero` shot — the styled, full-bleed-worthy photo.
 * Lead images that are merely the best available (`-front`, `-diagonal`)
 * render in the classic contained layout instead of the immersive one.
 */
export function isHeroShot(key: string): boolean {
  return key.includes("-hero");
}

/**
 * Thumbnail for the nav strips (switcher + full nav): the construction
 * "-skeleton" shot when the product has one, else its hero. Product photos
 * follow a flat `{name}-{variant}.webp` naming scheme in the bucket, with
 * hero > front as the lead shot and skeleton reserved for nav buttons.
 */
export function navImageKey(p: { heroImageKey: string; galleryImageKeys: string[] }): string {
  return p.galleryImageKeys.find((k) => k.includes("skeleton")) ?? p.heroImageKey;
}
