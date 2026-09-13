import Link from "next/link";
import { ProductGrid } from "@/components/product-grid";
import { getCatalogProducts } from "@/lib/catalog";
import { getCopy, getLocale, type SearchParamsInput, withLocale } from "@/lib/i18n";

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParamsInput> }) {
  const locale = getLocale(await searchParams);
  const t = getCopy(locale).frontend;
  const products = await getCatalogProducts();
  const photographed = products.filter((product) => product.image_available && product.availability !== "out_of_stock");

  return <div className="home-storefront">
    <section className="campaign campaign--text" aria-labelledby="home-title">
      <div className="campaign-copy">
        <h1 id="home-title">{t.heroTitle}</h1>
        <p>{t.heroLead}</p>
        <Link className="campaign-cta" href={withLocale("/search", locale)}>{t.browse}</Link>
      </div>
    </section>
    <section className="home-section" aria-labelledby="home-start">
      <div className="home-section-head"><h2 id="home-start">{t.startTitle}</h2><Link className="text-link" href={withLocale("/search", locale)}>{t.viewAll}</Link></div>
      <ProductGrid locale={locale} products={photographed.slice(0, 8)} />
    </section>
  </div>;
}
