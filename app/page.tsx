import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CinematicHero } from "@/components/cinematic-hero";
import { ProductGrid } from "@/components/product-grid";
import { formatCategoryLabel, getLocale, type SearchParamsInput, withLocale } from "@/lib/i18n";
import { getMockProducts } from "@/lib/mock-products";

type HomePageProps = { searchParams: Promise<SearchParamsInput> };

// Categories featured as image tiles on the home page, in display order. Any
// that have no demo image are dropped so a tile is never empty.
const FEATURED_CATEGORIES = ["outerwear", "shoes", "dresses", "bags", "knitwear", "trousers"];

export default async function HomePage({ searchParams }: HomePageProps) {
  const locale = getLocale(await searchParams);
  const products = getMockProducts();

  const categoryTiles = FEATURED_CATEGORIES.map((category) => {
    const rep = products.find((p) => p.category === category && p.image_available);
    return rep ? { category, image: rep.image_path } : null;
  }).filter((tile): tile is { category: string; image: string } => tile !== null);

  const popular = products.filter((p) => p.image_available).slice(0, 8);

  return (
    <>
      <CinematicHero locale={locale} />

      <div className="route-shell home-storefront">
        <section className="home-section" aria-labelledby="home-categories">
          <div className="home-section-head">
            <h2 id="home-categories">{locale === "lt" ? "Pirkti pagal kategoriją" : "Shop by category"}</h2>
          </div>
          <div className="category-tiles">
            {categoryTiles.map((tile) => (
              <Link
                className="category-tile"
                href={withLocale(`/search?category=${tile.category}`, locale)}
                key={tile.category}
              >
                <span className="category-tile-media">
                  <Image alt="" aria-hidden="true" fill sizes="(max-width: 767px) 50vw, 33vw" src={tile.image} />
                </span>
                <span className="category-tile-label">
                  {formatCategoryLabel(tile.category, locale)}
                  <ArrowRight aria-hidden="true" size={18} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-section" aria-labelledby="home-popular">
          <div className="home-section-head">
            <h2 id="home-popular">{locale === "lt" ? "Populiaru dabar" : "Popular now"}</h2>
            <Link className="home-section-link" href={withLocale("/search", locale)}>
              {locale === "lt" ? "Žiūrėti visas" : "View all"}
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <ProductGrid
            ariaLabel={locale === "lt" ? "Populiarios prekės" : "Popular products"}
            locale={locale}
            products={popular}
          />
        </section>
      </div>
    </>
  );
}
