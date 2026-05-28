import Link from "next/link";
import { ProductGrid } from "@/components/product-grid";
import { getMockProducts } from "@/lib/mock-products";

export default function HomePage() {
  const featuredProducts = getMockProducts().slice(0, 8);

  return (
    <div className="stack">
      <section className="hero">
        <div>
          <h1>Find fashion by vibe, not by store.</h1>
          <p className="lead">
            A visual fashion discovery MVP for Lithuanian shoppers. Search demo
            products by style, color, price, size, and store before live
            affiliate feeds are approved.
          </p>
          <p className="small">
            Current mode: mock data only. Live products should come from approved
            affiliate/product feeds.
          </p>
          <p>
            <Link className="button" href="/search">
              Open demo search
            </Link>
          </p>
        </div>
        <form className="search-panel" action="/search">
          <div className="search-form">
            <label className="field">
              <span>Search demo catalog</span>
              <input
                className="input"
                name="query"
                placeholder="black sneakers, summer dress, office"
              />
            </label>
            <button className="button" type="submit">
              Search
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2>Demo products</h2>
        <ProductGrid products={featuredProducts} />
      </section>
    </div>
  );
}

