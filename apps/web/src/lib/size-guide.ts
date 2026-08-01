/**
 * Standard Malaysian mattress dimensions — the same for every product, only
 * width varies by size. Strings render as-is; a null shows as "—" and keeps
 * the "measurements coming soon" note visible on product pages.
 */
export const SIZE_DIMENSIONS: Record<string, { width: string | null; length: string | null }> = {
  // TODO: 190 cm is the MY-standard length — confirm it holds for the range
  Single: { width: "92 cm", length: "190 cm" },
  Twin: { width: "107 cm", length: "190 cm" },
  Queen: { width: "152 cm", length: "190 cm" },
  King: { width: "182 cm", length: "190 cm" },
};

export const DIM_PLACEHOLDER = "—";
