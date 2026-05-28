import type { MockProduct } from "@/lib/mock-products";

function formatStore(slug: string) {
  return slug.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ProductGrid({ products }: { products: MockProduct[] }) {
  if (products.length === 0) {
    return (
      <section className="notice">
        <p>No demo products matched this search. Try sneakers, dress, black, or streetwear.</p>
      </section>
    );
  }

  return (
    <section className="grid" aria-label="Demo product results">
      {products.map((product) => (
        <article className="product-card" key={product.mock_product_id}>
          <img
            alt={`${product.title} demo placeholder`}
            className="product-image"
            src={product.image_url}
          />
          <div className="product-body">
            <div className="meta">{formatStore(product.store_slug)}</div>
            <h2 className="product-title">{product.title}</h2>
            <div className="meta">
              {product.brand} · {product.color} · {product.gender}
            </div>
            <div>
              <span className="price">
                {product.price_eur} {product.currency}
              </span>{" "}
              {product.old_price_eur ? (
                <span className="old-price">
                  {product.old_price_eur} {product.currency}
                </span>
              ) : null}
            </div>
            <div className="tags">
              {product.style_tags.split("|").map((tag) => (
                <span className="tag" key={`${product.mock_product_id}-${tag}`}>
                  {tag}
                </span>
              ))}
            </div>
            <a className="button secondary" href={`/out/${product.mock_product_id}`}>
              View in store
            </a>
            <div className="small">
              Demo only · {product.source_status} · {product.availability}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

