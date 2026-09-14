import type { Metadata } from "next";
import { AccountDashboard } from "@/components/account-dashboard";
import { getCatalogProducts } from "@/lib/catalog";
import { getPublicDemoStoreById } from "@/lib/demo-stores";
import { getCopy, getLocale, type SearchParamsInput } from "@/lib/i18n";
import { toPublicProduct } from "@/lib/public-product";

type SavedPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export const metadata: Metadata = {
  title: "Saved pieces — Weft",
  description: "Saved clothing and recent searches stored in this browser.",
};

export default async function SavedPage({ searchParams }: SavedPageProps) {
  const locale = getLocale(await searchParams);
  const t = getCopy(locale).frontend;
  const products = (await getCatalogProducts()).map((product) => {
    const store = getPublicDemoStoreById(product.public_store_id);
    return toPublicProduct(product, store?.label ?? null);
  });

  return (
    <div className="route-shell">
      <header className="route-heading">
        <h1>{t.savedPageTitle}</h1>
        <p className="lead">{t.savedPageLead}</p>
      </header>
      <AccountDashboard locale={locale} products={products} />
    </div>
  );
}
