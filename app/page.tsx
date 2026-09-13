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
    <section className="campaign" aria-labelledby="home-title">
      <div className="campaign-frame">
        <div className="campaign-image" aria-hidden="true">
          {/* Native art direction selects one crop before download, including without JavaScript. */}
          <picture>
            <source media="(max-width: 43.75em)" width={1128} height={1410}
              srcSet="/hero-assets/weft-street-mobile-640.webp 640w, /hero-assets/weft-street-mobile-960.webp 960w, /hero-assets/weft-street-mobile-1128.webp 1128w"
              sizes="100vw" />
            <img src="/hero-assets/weft-street-desktop-1920.webp"
              srcSet="/hero-assets/weft-street-desktop-1280.webp 1280w, /hero-assets/weft-street-desktop-1920.webp 1920w, /hero-assets/weft-street-desktop-2508.webp 2508w"
              sizes="100vw"
              width={2508} height={1412} alt="" fetchPriority="high" decoding="async" />
          </picture>
        </div>
        <div className="campaign-copy">
          <h1 id="home-title">{t.heroTitle}</h1>
          <p>{t.heroLead}</p>
          <Link className="campaign-cta" href={withLocale("/search", locale)}>{t.browse}</Link>
        </div>
      </div>
    </section>
    <section className="home-section" aria-labelledby="home-start">
      <div className="home-section-head"><h2 id="home-start">{t.startTitle}</h2><Link className="text-link" href={withLocale("/search", locale)}>{t.viewAll}</Link></div>
      <ProductGrid locale={locale} products={photographed.slice(0, 8)} />
    </section>
  </div>;
}
