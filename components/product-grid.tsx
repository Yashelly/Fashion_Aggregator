import type { MockProduct } from "@/lib/mock-products";
import { ExternalLink, Heart } from "lucide-react";
import {
  formatColorLabel,
  formatGenderLabel,
  formatStoreName,
  formatTagLabel,
  getCopy,
  type Locale,
  withLocale,
} from "@/lib/i18n";

function formatPrice(amount: string, currency: string, locale: Locale) {
  const value = Number(amount);
  if (Number.isNaN(value)) return `${amount} ${currency}`;
  return new Intl.NumberFormat(locale === "lt" ? "lt-LT" : "en-US", {
    currency,
    style: "currency",
  }).format(value);
}

const curatedImages = [
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
];

const tokenImages = [
  {
    tokens: ["boot", "boots"],
    url: "https://unsplash.com/photos/vBOFLGvKuOk/download?force=true&w=900",
  },
  {
    tokens: ["sneaker", "sneakers", "trainer", "trainers"],
    url: "https://unsplash.com/photos/zt6Wm7levtg/download?force=true&w=900",
  },
  {
    tokens: ["trouser", "trousers", "jogger", "joggers", "pants", "jeans"],
    url: "https://unsplash.com/photos/Iing2lv2WBw/download?force=true&w=900",
  },
  {
    tokens: ["dress", "dresses"],
    url: "https://unsplash.com/photos/gtqIYS7NVkI/download?force=true&w=900",
  },
  {
    tokens: ["bag", "bags", "tote", "crossbody", "shoulder"],
    url: "https://unsplash.com/photos/9aZC_v4mLwE/download?force=true&w=900",
  },
];

const categoryImages: Record<string, string> = {
  accessories:
    "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=900&q=80",
  activewear:
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
  bags:
    "https://unsplash.com/photos/9aZC_v4mLwE/download?force=true&w=900",
  bottoms:
    "https://unsplash.com/photos/Iing2lv2WBw/download?force=true&w=900",
  dresses:
    "https://unsplash.com/photos/gtqIYS7NVkI/download?force=true&w=900",
  knitwear:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  outerwear:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  shoes:
    "https://unsplash.com/photos/zt6Wm7levtg/download?force=true&w=900",
  sweats:
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
  tops:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
};

function getDisplayImage(product: MockProduct, index: number) {
  if (product.image_url && !product.image_url.includes("placehold.co")) {
    return product.image_url;
  }

  const searchable = `${product.title} ${product.category} ${product.subcategory}`.toLowerCase();
  const tokenMatch = tokenImages.find((candidate) =>
    candidate.tokens.some((token) => searchable.includes(token)),
  );

  if (tokenMatch) return tokenMatch.url;

  return categoryImages[product.category] ?? curatedImages[index % curatedImages.length];
}

function formatSizes(sizeOptions: string, locale: Locale) {
  const t = getCopy(locale).productGrid;
  const sizes = sizeOptions.split("|").filter(Boolean);
  if (sizes.length === 0) return "";
  if (sizes.length <= 4) return `${t.sizes} ${sizes.join(", ")}`;
  return `${t.sizes} ${sizes[0]}-${sizes[sizes.length - 1]}`;
}

export function ProductGrid({
  locale = "en",
  products,
}: {
  locale?: Locale;
  products: MockProduct[];
}) {
  const t = getCopy(locale).productGrid;

  if (products.length === 0) {
    return (
      <section className="notice">
        <p>{t.noResults}</p>
        <a className="button secondary" href={withLocale("/search", locale)}>
          {t.clearFilters}
        </a>
      </section>
    );
  }

  return (
    <section className="grid" aria-label={t.aria}>
      {products.map((product, index) => (
        <article
          className={`product-card${product.availability === "out_of_stock" ? " is-sold-out" : ""}`}
          key={product.mock_product_id}
        >
          <div className="product-media">
            {product.availability === "out_of_stock" ? (
              <img
                alt={`${product.title} by ${product.brand}`}
                className="product-image"
                src={getDisplayImage(product, index)}
              />
            ) : (
              <a
                href={`/out/${product.mock_product_id}`}
                aria-label={`${t.viewProduct} ${product.title}`}
              >
                <img
                  alt={`${product.title} by ${product.brand}`}
                  className="product-image"
                  src={getDisplayImage(product, index)}
                />
              </a>
            )}
            {product.old_price_eur ? <span className="product-badge">{t.sale}</span> : null}
            {product.availability === "limited" ? (
              <span className="product-badge muted">{t.limited}</span>
            ) : null}
            {product.availability === "out_of_stock" ? (
              <span className="product-badge muted">{t.outOfStock}</span>
            ) : null}
            <button
              className="save-button"
              disabled
              title={t.wishlistComingSoon}
              type="button"
              aria-label={`${t.wishlistComingSoon}: ${product.title}`}
            >
              <Heart size={17} />
            </button>
          </div>
          <div className="product-body">
            <div className="product-kicker">{product.brand}</div>
            <h2 className="product-title">{product.title}</h2>
            <div className="meta product-source">
              {formatStoreName(product.store_slug)} · {formatColorLabel(product.color, locale)} ·{" "}
              {formatGenderLabel(product.gender, locale)}
            </div>
            <div className="product-price-row">
              <span className="price">
                {formatPrice(product.price_eur, product.currency, locale)}
              </span>{" "}
              {product.old_price_eur ? (
                <span className="old-price">
                  {formatPrice(product.old_price_eur, product.currency, locale)}
                </span>
              ) : null}
            </div>
            <div className="small">{formatSizes(product.size_options, locale)}</div>
            <div className="tags">
              {product.style_tags.split("|").slice(0, 2).map((tag) => (
                <span className="tag" key={`${product.mock_product_id}-${tag}`}>
                  {formatTagLabel(tag, locale)}
                </span>
              ))}
            </div>
            {product.availability === "out_of_stock" ? (
              <span className="product-link disabled" aria-disabled="true">
                {t.soldOut}
              </span>
            ) : (
              <a
                aria-label={`${t.viewProduct} ${product.title} ${formatStoreName(product.store_slug)}`}
                className="product-link"
                href={`/out/${product.mock_product_id}`}
              >
                {t.viewAt} {formatStoreName(product.store_slug)}{" "}
                <ExternalLink aria-hidden="true" size={14} />
              </a>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
