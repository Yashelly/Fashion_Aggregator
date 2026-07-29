import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CinematicHero } from "@/components/cinematic-hero";
import { ProductGrid } from "@/components/product-grid";
import { getCopy, getLocale, type SearchParamsInput, withLocale } from "@/lib/i18n";
import { getMockProducts } from "@/lib/mock-products";

type HomePageProps = { searchParams: Promise<SearchParamsInput> };

export default async function HomePage({ searchParams }: HomePageProps) {
  const locale = getLocale(await searchParams);
  const t = getCopy(locale).home;
  const products = getMockProducts().filter((product) => product.availability !== "out_of_stock").slice(0, 8);
  const categories = locale === "lt"
    ? [["Moterims", "/search?gender=women"], ["Vyrams", "/search?gender=men"], ["Unisex", "/search?gender=unisex"], ["Avalynė", "/search?category=shoes"], ["Rankinės", "/search?category=bags"], ["Išpardavimas", "/search?status=sale"]]
    : [["Women", "/search?gender=women"], ["Men", "/search?gender=men"], ["Unisex", "/search?gender=unisex"], ["Shoes", "/search?category=shoes"], ["Bags", "/search?category=bags"], ["Sale edit", "/search?status=sale"]];

  return (
    <div className="home-stack">
      <CinematicHero locale={locale} />
      <section className="indexed-section category-index">
        <div className="section-rail"><span>02</span><p>{locale === "lt" ? "Naršyti kategorijas" : "Browse the index"}</p></div>
        <nav className="category-links" aria-label={t.catalogAria}>
          {categories.map(([label, href], index) => (
            <Link href={withLocale(href, locale)} key={href}><span>{String(index + 1).padStart(2, "0")}</span>{label}<ArrowRight aria-hidden="true" size={18} /></Link>
          ))}
        </nav>
      </section>
      <section className="indexed-section discovery-section">
        <div className="section-rail"><span>03</span><p>{locale === "lt" ? "Šios savaitės demonstracija" : "This week’s demo edit"}</p></div>
        <div className="section-content">
          <div className="section-heading">
            <div><p className="eyebrow">SYNTHETIC / ORIGINAL PLACEHOLDERS</p><h2>{locale === "lt" ? "Nauja indekse" : "New in the index"}</h2></div>
            <Link className="text-link" href={withLocale("/search", locale)}>{locale === "lt" ? "Visi rezultatai" : "All results"}<ArrowRight aria-hidden="true" size={18} /></Link>
          </div>
          <ProductGrid locale={locale} products={products} />
        </div>
      </section>
      <section className="trust-band">
        <span className="index-stamp">04</span>
        <div><p className="eyebrow">{locale === "lt" ? "Aiški riba" : "A clear source boundary"}</p><h2>{locale === "lt" ? "Dabar — demonstracija. Vėliau — tik patvirtinti šaltiniai." : "Demo now. Approved sources only, later."}</h2><p>{t.trust.text}</p></div>
        <Link className="button inverse" href={withLocale("/data-sources", locale)}>{t.trust.cta}<ArrowRight aria-hidden="true" size={18} /></Link>
      </section>
    </div>
  );
}
