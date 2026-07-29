import type { MockProduct } from "@/lib/mock-products";
import { ArrowRight, Footprints, ImageOff, Shirt, ShoppingBag } from "lucide-react";
import {
  formatAvailabilityLabel,
  formatColorLabel,
  formatGenderLabel,
  getCopy,
  type Locale,
} from "@/lib/i18n";

function price(amount: string, currency: string, locale: Locale) {
  const value = Number(amount);
  if (Number.isNaN(value)) return `${amount} ${currency}`;
  return new Intl.NumberFormat(locale === "lt" ? "lt-LT" : "en-IE", {
    currency,
    style: "currency",
  }).format(value);
}

function ProductGlyph({ category }: { category: string }) {
  if (category === "shoes") return <Footprints aria-hidden="true" />;
  if (category === "bags" || category === "accessories") return <ShoppingBag aria-hidden="true" />;
  if (["tops", "outerwear", "knitwear", "sweats", "dresses"].includes(category)) return <Shirt aria-hidden="true" />;
  return <ImageOff aria-hidden="true" />;
}

function sizes(value: string) {
  const list = value.split("|").filter(Boolean);
  return list.length > 5 ? `${list[0]}–${list[list.length - 1]}` : list.join(" · ");
}

export function ProductGrid({ locale = "en", products }: { locale?: Locale; products: MockProduct[] }) {
  const t = getCopy(locale).productGrid;
  const resultsLabel =
    locale === "lt"
      ? `Produktų rezultatai: ${products.length}`
      : `Product results: ${products.length}`;

  if (!products.length) {
    return (
      <section className="empty-state" role="status">
        <span className="index-stamp">00</span>
        <div>
          <h2>{t.noResults}</h2>
          <p>{locale === "lt" ? "Pabandykite platesnį terminą arba pašalinkite filtrą." : "Try a broader phrase or remove a filter."}</p>
          <a className="button secondary" href={locale === "lt" ? "/search?lang=lt" : "/search"}>{t.clearFilters}</a>
        </div>
      </section>
    );
  }

  return (
    <section className="product-grid" aria-label={resultsLabel}>
      {products.map((product, index) => {
        const unavailable = product.availability === "out_of_stock";
        const href = `/out/${product.mock_product_id}${locale === "lt" ? "?lang=lt" : ""}`;
        return (
          <article className={`product-tile tone-${index % 4}${unavailable ? " is-sold-out" : ""}`} key={product.mock_product_id}>
            <a className="product-media" href={unavailable ? undefined : href} aria-disabled={unavailable || undefined} tabIndex={unavailable ? -1 : undefined}>
              <span className="demo-media-label">DEMO IMAGE</span>
              <ProductGlyph category={product.category} />
              <span className="media-category">{product.category}</span>
              <span className="media-code">{String(index + 1).padStart(2, "0")}</span>
            </a>
            <div className="product-body">
              <span className="synthetic-label">SYNTHETIC PREVIEW</span>
              <p className="product-kicker">{product.brand} · {product.category}</p>
              <h2 className="product-title">{product.title}</h2>
              <div className="product-price-row">
                <span className="price">
                  <span className="sr-only">{locale === "lt" ? "Dabartinė kaina: " : "Current price: "}</span>
                  <data value={product.price_eur}>{price(product.price_eur, product.currency, locale)}</data>
                </span>
                {product.old_price_eur ? (
                  <span className="old-price">
                    <span className="sr-only">{locale === "lt" ? "Ankstesnė kaina: " : "Previous price: "}</span>
                    <del>{price(product.old_price_eur, product.currency, locale)}</del>
                  </span>
                ) : null}
              </div>
              <dl className="product-facts">
                <div><dt>{locale === "lt" ? "Spalva" : "Colour"}</dt><dd>{formatColorLabel(product.color, locale)}</dd></div>
                <div><dt>{locale === "lt" ? "Dydžiai" : "Sizes"}</dt><dd>{sizes(product.size_options)}</dd></div>
                <div><dt>{locale === "lt" ? "Skirta" : "Edit"}</dt><dd>{formatGenderLabel(product.gender, locale)}</dd></div>
              </dl>
              <p className={`availability availability-${product.availability}`}>{formatAvailabilityLabel(product.availability, locale)} · VIBEWEAR demo</p>
              {unavailable ? (
                <span className="product-link disabled" aria-disabled="true">{t.soldOut}</span>
              ) : (
                <a className="product-link" href={href}>{locale === "lt" ? "Peržiūrėti demo" : "View demo details"}<ArrowRight aria-hidden="true" size={16} /></a>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
