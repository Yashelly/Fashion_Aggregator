import Link from "next/link";
import { CinematicHero } from "@/components/cinematic-hero";
import { ProductGrid } from "@/components/product-grid";
import { getCopy, getLocale, type SearchParamsInput, withLocale } from "@/lib/i18n";
import { getMockProducts } from "@/lib/mock-products";

type HomePageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const locale = getLocale(await searchParams);
  const t = getCopy(locale).home;
  const featuredProducts = getMockProducts().slice(28, 36);

  return (
    <>
      <CinematicHero locale={locale} />

      <div className="zara-home">
        <section className="editorial-index" aria-label={t.editorialAria}>
          {t.editorialLinks.map((item) => (
            <Link href={withLocale(item.href, locale)} key={item.title}>
              <span>{item.number}</span>
              {item.title}
            </Link>
          ))}
        </section>

        <section className="category-board" aria-label={t.catalogAria}>
          {t.categoryColumns.map((column) => (
            <div className="category-column" key={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={withLocale(link.href, locale)}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="collection-strip">
          <div className="collection-copy">
            <span>{t.collection.eyebrow}</span>
            <h2>{t.collection.title}</h2>
            <p>{t.collection.text}</p>
          </div>
          <Link href={withLocale(t.collection.href, locale)}>{t.collection.cta}</Link>
        </section>

        <section className="zara-product-section">
          <ProductGrid locale={locale} products={featuredProducts} />
        </section>

        <section className="trust-strip" aria-label={t.trust.aria}>
          <p>{t.trust.text}</p>
          <Link href={withLocale("/data-sources", locale)}>{t.trust.cta}</Link>
        </section>
      </div>
    </>
  );
}
