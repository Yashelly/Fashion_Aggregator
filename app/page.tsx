import Link from "next/link";
import { CinematicHero } from "@/components/cinematic-hero";
import { ProductGrid } from "@/components/product-grid";
import { getMockProducts } from "@/lib/mock-products";

const editorialLinks = [
  { number: "01", title: "NEW IN", href: "/search" },
  { number: "02", title: "TRENDING NOW", href: "/search?query=streetwear" },
  { number: "03", title: "SNEAKERS", href: "/search?query=sneakers" },
  { number: "04", title: "SUMMER EDIT", href: "/search?query=summer" },
  { number: "05", title: "SPECIAL PRICES", href: "/search?query=sale" },
];

const categoryColumns = [
  {
    title: "DISCOVER",
    links: ["NEW IN", "EDITORIAL", "LOOKBOOK", "CAMPAIGN", "STORES"],
  },
  {
    title: "COLLECTION",
    links: ["DRESSES", "T-SHIRTS", "TROUSERS", "HOODIES", "JACKETS"],
  },
  {
    title: "SHOES | ACCESSORIES",
    links: ["TRAINERS", "BAGS", "BELTS", "SUNGLASSES", "JEWELLERY"],
  },
  {
    title: "STORES",
    links: ["RESERVED", "SINSAY", "SIZEER", "MODIVO", "ABOUT DATA"],
  },
];

export default function HomePage() {
  const featuredProducts = getMockProducts().slice(28, 36);

  return (
    <>
      <CinematicHero />

      <div className="zara-home">
        <section className="editorial-index" aria-label="Editorial index">
          {editorialLinks.map((item) => (
            <Link href={item.href} key={item.title}>
              <span>{item.number}</span>
              {item.title}
            </Link>
          ))}
        </section>

        <section className="category-board" aria-label="Catalog navigation">
          {categoryColumns.map((column) => (
            <div className="category-column" key={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link}>
                    <Link href={`/search?query=${encodeURIComponent(link.toLowerCase())}`}>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="collection-strip">
          <div className="collection-copy">
            <span>DEMO FEED</span>
            <h2>STREETWEAR SELECTION</h2>
            <p>
              Synthetic products now. Approved affiliate feeds later.
            </p>
          </div>
          <Link href="/search?query=sneakers">VIEW ALL</Link>
        </section>

        <section className="zara-product-section">
          <ProductGrid products={featuredProducts} />
        </section>
      </div>
    </>
  );
}
