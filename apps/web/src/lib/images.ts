export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

/**
 * Public URL for an R2 object key, or null when no bucket is configured —
 * components render a designed placeholder in that case.
 */
export function imageUrl(key: string): string | null {
  return R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : null;
}
