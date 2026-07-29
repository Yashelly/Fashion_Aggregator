import type { Metadata } from "next";
import { AiFittingRoom } from "@/components/ai-fitting-room";
import { getLocale, type SearchParamsInput } from "@/lib/i18n";
import { getMockProducts } from "@/lib/mock-products";

type AiFittingRoomPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export const metadata: Metadata = {
  title: "AI fitting room — VIBEWEAR",
  description: "Preview the private photo and product selection flow for VIBEWEAR's AI fitting room.",
};

export default async function AiFittingRoomPage({ searchParams }: AiFittingRoomPageProps) {
  const query = await searchParams;
  const locale = getLocale(query);
  const requestedProduct = Array.isArray(query.product) ? query.product[0] : query.product;
  const products = getMockProducts()
    .filter((product) => product.image_available && product.availability !== "out_of_stock")
    .sort((left, right) => {
      if (left.mock_product_id === requestedProduct) return -1;
      if (right.mock_product_id === requestedProduct) return 1;
      return 0;
    })
    .slice(0, 12)
    .map(({ mock_product_id, title, category, image_path, price_eur, currency }) => ({
      id: mock_product_id,
      title,
      category,
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
          <h1>{locale === "lt" ? "AI matavimosi kabina" : "AI fitting room"}</h1>
          <p className="lead">
            {locale === "lt"
              ? "Įkelkite savo nuotrauką, pasirinkite drabužį ir pradėkite virtualų pasimatavimą."
              : "Upload your photo, choose an item, and start a virtual try-on."}
          </p>
        </div>
      </header>
      <AiFittingRoom initialProductId={initialProductId} locale={locale} products={products} />
    </div>
  );
}
