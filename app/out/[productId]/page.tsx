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

  return (
    <ProductDetailView
      comparison={comparison}
      product={product}
      storeLabels={store?.label ?? null}
    />
  );
}
