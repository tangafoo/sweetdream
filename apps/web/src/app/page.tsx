import { CarouselStage } from "@/components/carousel/CarouselStage";
import { getProductsWithStats } from "@/lib/queries";

export const revalidate = 3600; // + on-demand revalidatePath when a review publishes

export default async function Home() {
  const products = await getProductsWithStats();
  return <CarouselStage products={products} />;
}
