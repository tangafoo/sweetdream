import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/brand/Footer";
import { Gallery } from "@/components/product/Gallery";
import { NeighborNav } from "@/components/product/NeighborNav";
import { PriceBySize } from "@/components/product/PriceBySize";
import { SizeGuide } from "@/components/product/SizeGuide";
import { SpecList } from "@/components/product/SpecList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewSummary } from "@/components/reviews/ReviewSummary";
import { StarRating } from "@/components/reviews/StarRating";
import { formatPrice } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { getProductBySlug, getProductsWithStats } from "@/lib/queries";

export const revalidate = 3600; // + on-demand revalidatePath when a review publishes
export const dynamicParams = false;

export async function generateStaticParams() {
  const products = await getProductsWithStats();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) return {};
  return {
    title: data.product.name,
    description: `${data.product.tagline}. From ${formatPrice(data.product.basePriceCents)}.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [data, all] = await Promise.all([getProductBySlug(slug), getProductsWithStats()]);
  if (!data) notFound();
  const { product, reviews } = data;

  const i = all.findIndex((p) => p.slug === slug);
  const prev = i > 0 ? all[i - 1] : null;
  const next = i >= 0 && i < all.length - 1 ? all[i + 1] : null;

  const sizes = product.sizes;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.tagline,
    image: imageUrl(product.heroImageKey) ?? undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: (Math.min(...sizes.map((s) => s.priceCents)) / 100).toFixed(2),
      highPrice: (Math.max(...sizes.map((s) => s.priceCents)) / 100).toFixed(2),
      offerCount: sizes.length,
    },
    ...(product.avgRating !== null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.avgRating.toFixed(1),
        reviewCount: product.reviewCount,
      },
    }),
  };

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-24 md:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href={`/?p=${product.slug}`}
        className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span> All mattresses
      </Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* sticky ends with this grid, so the gallery stays in view exactly
            until the Sizes & measurements section takes over */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Gallery
            name={product.name}
            imageKeys={[product.heroImageKey, ...product.galleryImageKeys]}
          />
        </div>

        <div>
          <h1 className="font-display text-4xl tracking-tight md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 text-lg text-ink-soft">{product.tagline}</p>
          <a href="#reviews" className="mt-4 inline-block">
            <StarRating rating={product.avgRating} count={product.reviewCount} />
          </a>

          <div className="mt-8">
            <PriceBySize sizes={sizes} />
          </div>

          <div className="mt-10">
            <SpecList
              firmness={product.firmness}
              heightInches={product.heightInches}
              features={product.features}
            />
          </div>

          <div className="mt-10 space-y-4 border-t border-line pt-8 leading-relaxed text-ink/85">
            {product.description.split("\n\n").map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>
      </div>

      <section id="sizes" className="mt-20 scroll-mt-24">
        <h2 className="font-display text-3xl tracking-tight md:text-4xl">
          Sizes &amp; measurements
        </h2>
        <div className="mt-6">
          <SizeGuide sizes={sizes} />
        </div>
      </section>

      <section id="reviews" className="mt-24 scroll-mt-24">
        <h2 className="font-display text-3xl tracking-tight md:text-4xl">Reviews</h2>
        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
          <div className="space-y-10">
            <ReviewSummary reviews={reviews} />
            <ReviewForm productSlug={product.slug} />
          </div>
          <ReviewList reviews={reviews} />
        </div>
      </section>

      <NeighborNav prev={prev} next={next} />

      <Footer />
    </main>
  );
}
