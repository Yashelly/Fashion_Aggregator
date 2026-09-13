import type { Metadata } from "next";
import { AiFittingRoom } from "@/components/ai-fitting-room";
import { getCatalogProducts } from "@/lib/catalog";
import { getLocale, type SearchParamsInput } from "@/lib/i18n";
import { getSecondaryCopy } from "@/lib/secondary-copy";

type AiFittingRoomPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export async function generateMetadata({ searchParams }: AiFittingRoomPageProps): Promise<Metadata> {
  const locale = getLocale(await searchParams);
  const copy = getSecondaryCopy(locale).fitting;
  return { title: copy.metadataTitle, description: copy.metadataDescription };
}

export default async function AiFittingRoomPage({ searchParams }: AiFittingRoomPageProps) {
  const query = await searchParams;
  const locale = getLocale(query);
  const copy = getSecondaryCopy(locale).fitting;
  const requestedProduct = Array.isArray(query.product) ? query.product[0] : query.product;
  const products = (await getCatalogProducts())
    .filter((product) => product.image_available && product.availability !== "out_of_stock")
    .sort((left, right) => {
      if (left.mock_product_id === requestedProduct) return -1;
      if (right.mock_product_id === requestedProduct) return 1;
      return 0;
    })
    .slice(0, 12)
    .map(({ mock_product_id, title, category, color, image_path, price_eur, currency }) => ({
      id: mock_product_id,
      title,
      category,
      color,
      imagePath: image_path,
      price: price_eur,
      currency,
    }));
  const initialProductId = products.some((product) => product.id === requestedProduct)
    ? requestedProduct
    : products[0]?.id;

  return (
    <div className="route-shell">
      <header className="route-heading">
        <div>
          <h1>{copy.title}</h1>
          <p className="lead">{copy.lead}</p>
        </div>
      </header>
      <AiFittingRoom initialProductId={initialProductId} locale={locale} products={products} />
    </div>
  );
}
