import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/product-detail-view";
import { getPublicDemoStoreById } from "@/lib/demo-stores";
import { getMockProducts } from "@/lib/mock-products";
import { compareProductAcrossStores } from "@/lib/product-listings";

type OutPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getMockProducts().map((product) => ({
    productId: product.mock_product_id,
  }));
}

export async function generateMetadata({ params }: OutPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = getMockProducts().find((item) => item.mock_product_id === productId);

  if (!product) return {};

  return {
    title: `${product.title} — Weft`,
    description: `View ${product.title}, available sizes, product details, and styling images.`,
  };
}

export default async function OutPage({ params }: OutPageProps) {
  const { productId } = await params;
  const product = getMockProducts().find((item) => item.mock_product_id === productId);

  if (!product) notFound();

  const store = getPublicDemoStoreById(product.public_store_id);

  // Read on the server: the comparison comes from a CSV on disk, and the detail
  // view is a client component.
  const comparison = compareProductAcrossStores(product);

  // "You may also like": same category first, then anything else, four items.
  // The store label is resolved here (demo-stores reads a CSV and cannot run in
  // the client detail view) and passed down as plain, serialisable data.
  const products = getMockProducts();
  const pool = products.filter((item) => item.mock_product_id !== product.mock_product_id);
  const related = [
    ...pool.filter((item) => item.category === product.category),
    ...pool.filter((item) => item.category !== product.category),
  ]
    .slice(0, 4)
    .map((item) => ({
      id: item.mock_product_id,
      title: item.title,
      category: item.category,
      priceEur: item.price_eur,
      oldPriceEur: item.old_price_eur,
      currency: item.currency,
      image: item.image_available ? item.image_path : null,
      storeLabel: getPublicDemoStoreById(item.public_store_id)?.label ?? null,
    }));

  return (
    <ProductDetailView
      comparison={comparison}
      product={product}
      related={related}
      storeLabels={store?.label ?? null}
    />
  );
}
