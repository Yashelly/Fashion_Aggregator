import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import {
  getPublicDemoStoreLabel,
  getPublicDemoStores,
} from "@/lib/demo-stores";
import { getCopy, getLocale, type SearchParamsInput, withLocale } from "@/lib/i18n";
import { getMockProducts } from "@/lib/mock-products";

type StoresPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const locale = getLocale(await searchParams);
  const copy = getCopy(locale).pages.stores;
  const products = getMockProducts();
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

          return (
            <Link
              aria-label={`${copy.browseCta}: ${storeLabel}`}
              className="demo-store-card"
              href={href}
              key={store.id}
            >
              <div className="demo-store-icon">
                <ShoppingBag aria-hidden="true" size={24} />
              </div>
              <div className="demo-store-copy">
                <p className="store-eyebrow">{locale === "lt" ? "VIBEWEAR ATRANKA" : "VIBEWEAR EDIT"}</p>
                <h2>{storeLabel}</h2>
                <p>{copy.fallbackDescription}</p>
                <span>
                  {locale === "lt"
                    ? `${storeProducts.length} prekių · ${categoryCount} kategorijos`
                    : `${storeProducts.length} products · ${categoryCount} categories`}
                </span>
              </div>
              <ArrowRight aria-hidden="true" className="demo-store-arrow" size={22} />
            </Link>
          );
        })}
      </section>
    </div>
  );
}
