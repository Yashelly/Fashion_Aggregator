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
      <section className="home-section category-section">
        <div className="section-label"><p>{locale === "lt" ? "Naršyti kategorijas" : "Browse categories"}</p></div>
        <nav className="category-links" aria-label={t.catalogAria}>
          {categories.map(([label, href]) => (
            <Link href={withLocale(href, locale)} key={href}>{label}<ArrowRight aria-hidden="true" size={18} /></Link>
          ))}
        </nav>
      </section>
      <section className="home-section discovery-section">
        <div className="section-label"><p>{locale === "lt" ? "Šios savaitės atranka" : "This week’s edit"}</p></div>
        <div className="section-content">
          <div className="section-heading">
            <div><p className="eyebrow">{locale === "lt" ? "NAUJIENOS" : "NEW ARRIVALS"}</p><h2>{locale === "lt" ? "Nauja kolekcijoje" : "New in the collection"}</h2></div>
            <Link className="text-link" href={withLocale("/search", locale)}>{locale === "lt" ? "Visi rezultatai" : "All results"}<ArrowRight aria-hidden="true" size={18} /></Link>
          </div>
          <ProductGrid locale={locale} products={products} />
        </div>
      </section>
      <section className="trust-band">
        <div><p className="eyebrow">{locale === "lt" ? "Kitas žingsnis" : "What’s next"}</p><h2>{locale === "lt" ? "Atrask dabar. Pirkimas — vėliau." : "Discover now. Shop later."}</h2><p>{t.trust.text}</p></div>
        <Link className="button inverse" href={withLocale("/data-sources", locale)}>{t.trust.cta}<ArrowRight aria-hidden="true" size={18} /></Link>
      </section>
    </div>
  );
}
