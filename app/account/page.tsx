import type { Metadata } from "next";
import { AccountDashboard } from "@/components/account-dashboard";
import { getCatalogProducts } from "@/lib/catalog";
import { getPublicDemoStoreById } from "@/lib/demo-stores";
import { getLocale, type SearchParamsInput } from "@/lib/i18n";
import { toPublicProduct } from "@/lib/public-product";

type AccountPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export const metadata: Metadata = {
  title: "Your space — Weft",
  description: "Your saved clothing and recent searches in this browser.",
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const locale = getLocale(await searchParams);
  const products = (await getCatalogProducts()).map((product) => {
    const store = getPublicDemoStoreById(product.public_store_id);
    return toPublicProduct(product, store?.label ?? null);
  });

  return (
    <div className="route-shell">
      <header className="route-heading">
        <div>
          <h1>{locale === "lt" ? "Tavo erdvė" : "Your space"}</h1>
          <p className="lead">
            {locale === "lt"
              ? "Išsaugotos prekės ir naujausios paieškos vienoje vietoje."
              : "Your saved pieces and recent searches in one place."}
          </p>
        </div>
      </header>
      <AccountDashboard locale={locale} products={products} />
    </div>
  );
}
