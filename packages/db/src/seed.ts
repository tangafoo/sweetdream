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
    for (const [i, product] of products.entries()) {
      if (product._count.reviews > 0) continue; // don't stack demo data on real reviews
      // vary count/selection per product so the histograms look organic
      const count = (i % sampleReviews.length) + 1;
      for (let j = 0; j < count; j++) {
        const sample = sampleReviews[(i + j) % sampleReviews.length];
        await prisma.review.create({
          data: { productId: product.id, ...sample },
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
