import {
  featuresSchema,
  getPrisma,
  sizePricingSchema,
  type Product,
  type SizePricing,
} from "@sd/db";
import { seedProducts } from "@sd/db/seed-data";

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  firmness: number;
  heightInches: number;
  features: string[];
  sizes: SizePricing;
  basePriceCents: number;
  heroImageKey: string;
  galleryImageKeys: string[];
  sortOrder: number;
  avgRating: number | null;
  reviewCount: number;
}

export interface ReviewDTO {
  id: string;
  rating: number;
  authorName: string;
  body: string;
  createdAt: string; // ISO
  imageKeys: string[];
}

function fromSeed(): ProductSummary[] {
  return seedProducts.map((p) => ({
    ...p,
    id: p.slug,
    avgRating: null,
    reviewCount: 0,
  }));
}

let warnedFallback = false;
function warnFallback(err: unknown) {
  if (warnedFallback) return;
  warnedFallback = true;
  console.warn(
    "[queries] Database unavailable — rendering from seed data (placeholder mode).",
    err instanceof Error ? err.message : err,
  );
}

/**
 * Validated base fields for a product row, or null when its JSON columns are
 * malformed (one bad hand-edited row should drop that row, not flip the whole
 * catalog into seed fallback).
 */
function productFields(p: Product): Omit<ProductSummary, "avgRating" | "reviewCount"> | null {
  const sizes = sizePricingSchema.safeParse(p.sizes);
  const features = featuresSchema.safeParse(p.features);
  if (!sizes.success || !features.success) {
    console.warn(`[queries] product "${p.slug}" has malformed sizes/features JSON — skipping row`);
    return null;
  }
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    firmness: p.firmness,
    heightInches: p.heightInches,
    features: features.data,
    sizes: sizes.data,
    basePriceCents: p.basePriceCents,
    heroImageKey: p.heroImageKey,
    galleryImageKeys: p.galleryImageKeys,
    sortOrder: p.sortOrder,
  };
}

export async function getProductsWithStats(): Promise<ProductSummary[]> {
  try {
    const prisma = getPrisma();
    const [products, stats] = await Promise.all([
      prisma.product.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.review.groupBy({
        by: ["productId"],
        where: { status: "PUBLISHED" },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);
    const statsById = new Map(stats.map((s) => [s.productId, s]));
    const summaries = products
      .map((p) => {
        const fields = productFields(p);
        if (!fields) return null;
        const s = statsById.get(p.id);
        return {
          ...fields,
          avgRating: s?._avg.rating ?? null,
          reviewCount: s?._count._all ?? 0,
        };
      })
      .filter((p): p is ProductSummary => p !== null);
    if (summaries.length === 0) {
      // reachable DB but no (valid) products — e.g. migrated-but-not-seeded.
      // The seed fallback keeps the storefront alive instead of crashing.
      console.warn("[queries] Product table is empty — rendering from seed data.");
      return fromSeed();
    }
    return summaries;
  } catch (err) {
    warnFallback(err);
    return fromSeed();
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<{ product: ProductSummary; reviews: ReviewDTO[] } | null> {
  try {
    const prisma = getPrisma();
    const p = await prisma.product.findUnique({
      where: { slug },
      include: {
        reviews: {
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          include: { images: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
    if (!p) {
      // Distinguish "this slug doesn't exist" (real 404) from "table is empty"
      // (migrated-but-not-seeded — the list views fall back to seed data, so
      // product links must resolve too or they'd all 404).
      const count = await prisma.product.count();
      if (count === 0) {
        const seed = fromSeed().find((s) => s.slug === slug);
        return seed ? { product: seed, reviews: [] } : null;
      }
      return null;
    }
    const fields = productFields(p);
    if (!fields) {
      const seed = fromSeed().find((s) => s.slug === slug);
      return seed ? { product: seed, reviews: [] } : null;
    }
    const ratings = p.reviews.map((r) => r.rating);
    const avgRating = ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null;
    return {
      product: {
        ...fields,
        avgRating,
        reviewCount: p.reviews.length,
      },
      reviews: p.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        authorName: r.authorName,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
        imageKeys: r.images.map((img) => img.key),
      })),
    };
  } catch (err) {
    warnFallback(err);
    const seed = fromSeed().find((p) => p.slug === slug);
    return seed ? { product: seed, reviews: [] } : null;
  }
}
