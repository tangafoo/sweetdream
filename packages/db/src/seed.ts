import { getPrisma } from "./index";
import { sampleReviews, seedProducts } from "./seed-data";

const withReviews = process.argv.includes("--with-reviews");

async function main() {
  const prisma = getPrisma();

  for (const p of seedProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: p,
      update: p,
    });
  }
  console.log(`Seeded ${seedProducts.length} products (idempotent upsert by slug).`);

  if (withReviews) {
    const products = await prisma.product.findMany({
      select: { id: true, slug: true, _count: { select: { reviews: true } } },
    });
    let created = 0;
    const now = Date.now();
    for (const product of products) {
      if (product._count.reviews > 0) continue; // don't stack demo data on real reviews
      const samples = sampleReviews[product.slug] ?? [];
      for (const [j, sample] of samples.entries()) {
        // deterministic spread over the past ~6 months so lists don't share one timestamp
        const daysAgo = ((product.slug.length * 13 + j * 37) % 170) + 3;
        await prisma.review.create({
          data: {
            productId: product.id,
            ...sample,
            createdAt: new Date(now - daysAgo * 86_400_000),
          },
        });
        created++;
      }
    }
    console.log(`Created ${created} sample reviews (skipped products that already had reviews).`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
