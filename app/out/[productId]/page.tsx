import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClickoutAnalyticsTracker } from "@/components/clickout-analytics-tracker";
import { ProductDetailView } from "@/components/product-detail-view";
import { getCatalogProducts } from "@/lib/catalog";
import { getPublicDemoStoreById } from "@/lib/demo-stores";
import { getCopy, getLocale } from "@/lib/i18n";
import {
  sanitizeSearchReturnTo,
  toPublicProduct,
  toPublicRelatedProduct,
} from "@/lib/public-product";

type OutPageProps = {
  params: Promise<{
    productId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getCatalogProducts()).map((product) => ({
    productId: product.mock_product_id,
  }));
}

export async function generateMetadata({ params, searchParams }: OutPageProps): Promise<Metadata> {
  const { productId } = await params;
  const locale = getLocale(await searchParams);
  const product = (await getCatalogProducts()).find((item) => item.mock_product_id === productId);

  if (!product) return {};

  return {
    title: `${product.title} — Weft`,
    description: getCopy(locale).productDetail.metadataDescription(product.title),
  };
}

export default async function OutPage({ params, searchParams }: OutPageProps) {
  const { productId } = await params;
  const query = await searchParams;
  const products = await getCatalogProducts();
  const product = products.find((item) => item.mock_product_id === productId);

  if (!product) notFound();

  const store = getPublicDemoStoreById(product.public_store_id);
  const related = products
    .filter(
      (item) =>
        item.mock_product_id !== product.mock_product_id &&
        item.category === product.category,
    )
    .slice(0, 4)
    .map((item) =>
      toPublicRelatedProduct(
        item,
        getPublicDemoStoreById(item.public_store_id)?.label ?? null,
      ),
    );

  return (
    <>
      <ClickoutAnalyticsTracker productId={product.mock_product_id} />
      <ProductDetailView
        product={toPublicProduct(product, store?.label ?? null)}
        related={related}
        returnTo={sanitizeSearchReturnTo(query.returnTo)}
      />
    </>
  );
}
