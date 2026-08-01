const myr = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  maximumFractionDigits: 0,
});

export function formatPrice(cents: number): string {
  return myr.format(Math.round(cents / 100));
}

const dateFmt = new Intl.DateTimeFormat("en-MY", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

/**
 * Split a trailing height token off a product name — "Sweet Luxury 16″" →
 * base "Sweet Luxury" + size "16″" — so the size can be typeset lighter and
 * smaller. Names without one ("Royal Blue Emporium") get size: null.
 */
export function splitProductName(name: string): { base: string; size: string | null } {
  const m = name.match(/^(.*\S)\s+(\d+(?:″|"|cm))$/);
  return m ? { base: m[1], size: m[2] } : { base: name, size: null };
}
