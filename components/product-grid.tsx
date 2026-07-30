import type { MockProduct } from "@/lib/mock-products";
import { ArrowRight, Footprints, ImageOff, Shirt, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getPublicDemoStoreById, getPublicDemoStoreLabel } from "@/lib/demo-stores";
import {
  formatAvailabilityLabel,
  formatCategoryLabel,
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

export function ProductGrid({
  ariaLabel,
  locale = "en",
  products,
}: {
  ariaLabel?: string;
  locale?: Locale;
  products: MockProduct[];
}) {
  const t = getCopy(locale).productGrid;
  const resultsLabel =
    ariaLabel ??
    (locale === "lt"
      ? `Produktų rezultatai: ${products.length}`
      : `Product results: ${products.length}`);

  if (!products.length) {
    return (
      <section className="empty-state" role="status">
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
        const store = getPublicDemoStoreById(product.public_store_id);
        const storeLabel = store
          ? getPublicDemoStoreLabel(store, locale)
          : locale === "lt"
            ? "Parduotuvė"
            : "Store";
        const categoryLabel = formatCategoryLabel(product.category, locale);
        const mediaAlt =
          locale === "lt"
            ? `${product.title}, ${categoryLabel}, ${storeLabel}`
            : `${product.title}, ${categoryLabel}, ${storeLabel}`;
        return (
          <article className={`product-tile tone-${index % 4}${unavailable ? " is-sold-out" : ""}`} key={product.mock_product_id}>
            {unavailable ? (
              <div
                aria-label={product.image_available ? undefined : mediaAlt}
                className={`product-media${product.image_available ? " has-image" : ""}`}
                role={product.image_available ? undefined : "img"}
              >
                {product.image_available ? (
                  <Image
                    alt={mediaAlt}
                    fill
                    sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
                    src={product.image_path}
                  />
                ) : (
                  <>
                    <span className="demo-media-label">{locale === "lt" ? "VIETA NUOTRAUKAI" : "IMAGE PLACEHOLDER"}</span>
                    <ProductGlyph category={product.category} />
                    <span className="media-category">{categoryLabel}</span>
                  </>
                )}
              </div>
            ) : (
              <a className={`product-media${product.image_available ? " has-image" : ""}`} href={href} aria-label={mediaAlt}>
                {product.image_available ? (
                  <Image
                    alt={mediaAlt}
                    fill
                    sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
                    src={product.image_path}
                  />
                ) : (
                  <>
                    <span className="demo-media-label">{locale === "lt" ? "VIETA NUOTRAUKAI" : "IMAGE PLACEHOLDER"}</span>
                    <span aria-hidden="true" className="product-glyph"><ProductGlyph category={product.category} /></span>
                    <span className="media-category">{categoryLabel}</span>
                  </>
                )}
              </a>
            )}
            <div className="product-body">
              <p className="product-kicker">{categoryLabel}</p>
              <h2 className="product-title">
                <Link href={href}>{product.title}</Link>
              </h2>
              <Link
                className="product-store"
                href={`/search?store=${product.public_store_id}${locale === "lt" ? "&lang=lt" : ""}`}
              >
                {storeLabel}
              </Link>
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
                <div><dt>{locale === "lt" ? "Skirta" : "For"}</dt><dd>{formatGenderLabel(product.gender, locale)}</dd></div>
              </dl>
              <p className={`availability availability-${product.availability}`}>{formatAvailabilityLabel(product.availability, locale)}</p>
              {unavailable ? (
                <span className="product-link disabled" aria-disabled="true">{t.soldOut}</span>
              ) : (
                <a aria-label={`${locale === "lt" ? "Peržiūrėti prekę" : "View product"}: ${product.title}`} className="product-link" href={href}>{locale === "lt" ? "Peržiūrėti" : "View details"}<ArrowRight aria-hidden="true" size={16} /></a>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
