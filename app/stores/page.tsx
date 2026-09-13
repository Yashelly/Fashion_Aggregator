import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { getCatalogProducts } from "@/lib/catalog";
import {
  getPublicDemoStoreLabel,
  getPublicDemoStores,
} from "@/lib/demo-stores";
import { getCopy, getLocale, type SearchParamsInput, withLocale } from "@/lib/i18n";
import { getSecondaryCopy } from "@/lib/secondary-copy";

type StoresPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const locale = getLocale(await searchParams);
  const copy = getCopy(locale).pages.stores;
  const secondaryCopy = getSecondaryCopy(locale).stores;
  const products = await getCatalogProducts();
  const stores = getPublicDemoStores();

  return (
    <div className="route-shell stores-route">
      <header className="route-heading">
        <div>
          <h1>{copy.title}</h1>
          <p className="lead">{copy.lead}</p>
        </div>
      </header>

      <section className="demo-store-grid" aria-label={copy.title}>
        {stores.map((store) => {
          const storeProducts = products.filter(
            (product) => product.public_store_id === store.id,
          );
          const storeLabel = getPublicDemoStoreLabel(store, locale);
          const categoryCount = new Set(
            storeProducts.map((product) => product.category),
          ).size;
          const href = withLocale(`/search?store=${store.id}`, locale);
          const collage = storeProducts
            .filter((product) => product.image_available)
            .slice(0, 3);

          return (
            <Link
              aria-label={`${copy.browseCta}: ${storeLabel}`}
              className="demo-store-card"
              href={href}
              key={store.id}
            >
              <div className="demo-store-copy">
                <h2>{storeLabel}</h2>
                <p>{copy.fallbackDescription}</p>
                <span>{secondaryCopy.summary(storeProducts.length, categoryCount)}</span>
                <ArrowRight aria-hidden="true" className="demo-store-arrow" size={22} />
              </div>
              {collage.length > 0 ? (
                <div className="demo-store-collage" aria-hidden="true">
                  {collage.map((product) => (
                    <span className="demo-store-thumb" key={product.mock_product_id}>
                      <ProductImage alt="" sizes="(max-width: 43.75em) 34vw, (min-width: 2560px) 427px, 17vw" src={product.image_path} unavailableLabel={secondaryCopy.imageUnavailable} />
                    </span>
                  ))}
                </div>
              ) : (
                <div className="demo-store-icon">
                  <ShoppingBag aria-hidden="true" size={24} />
                </div>
              )}
            </Link>
          );
        })}
      </section>
    </div>
  );
}
