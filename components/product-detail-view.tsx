"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Palette,
  Ruler,
  Sparkles,
  Store,
  UsersRound,
  X,
  ZoomIn,
} from "lucide-react";
import type { MockProduct } from "@/lib/mock-products";
import type { ProductComparison } from "@/lib/product-listings";
import {
  formatAvailabilityLabel,
  formatCategoryLabel,
  formatColorLabel,
  formatGenderLabel,
  getCopy,
  withLocale,
  type Locale,
} from "@/lib/i18n";
import { useClientLocale } from "@/lib/use-client-locale";

function price(amount: string, currency: string, locale: Locale) {
  return new Intl.NumberFormat(locale === "lt" ? "lt-LT" : "en-IE", {
    currency,
    style: "currency",
  }).format(Number(amount));
}

function productDescription(category: string, locale: Locale) {
  const lt: Record<string, string> = {
    accessories:
      "Lengvai prie skirtingų derinių pritaikoma detalė, skirta kasdieniam garderobui papildyti.",
    bags:
      "Funkcionalus siluetas kasdieniams deriniams. Tinka tiek trumpai išvykai, tiek miesto ritmui.",
    bottoms:
      "Universalaus silueto modelis, kurį lengva derinti su marškinėliais, trikotažu ar švarku.",
    dresses:
      "Išbaigtas vienos dalies derinys, tinkantis kasdienai ir ryškesniam vakaro įvaizdžiui.",
    outerwear:
      "Lengvai sluoksniuojamas viršutinis drabužis permainingam orui ir miesto deriniams.",
    shoes:
      "Kasdieniam judėjimui skirtas modelis, lengvai derinamas su laisvalaikio garderobu.",
    tops:
      "Lengvai sluoksniuojamas viršutinis drabužis, tinkantis kasdieniams ir tvarkingesniems deriniams.",
  };
  const en: Record<string, string> = {
    accessories:
      "An easy finishing detail designed to work across everyday outfits.",
    bags:
      "A functional everyday silhouette suited to short trips and city routines.",
    bottoms:
      "A versatile silhouette that pairs easily with tees, knitwear, or structured layers.",
    dresses:
      "A complete one-piece look for everyday wear or a more expressive evening outfit.",
    outerwear:
      "An easy layering piece for changing weather and everyday city outfits.",
    shoes:
      "An everyday style designed to work naturally with a relaxed wardrobe.",
    tops:
      "An easy layering piece for everyday outfits and more polished combinations.",
  };

  return (locale === "lt" ? lt : en)[category] ??
    (locale === "lt"
      ? "Universalus modelis, kurį lengva įtraukti į kasdienį garderobą."
      : "A versatile piece that fits naturally into an everyday wardrobe.");
}

function StoreComparison({
  comparison,
  locale,
  viewingStoreId,
}: {
  comparison: ProductComparison;
  locale: Locale;
  viewingStoreId: string;
}) {
  const t = getCopy(locale).comparison;
  const currency = comparison.listings[0].currency;
  const money = (amount: number) => price(String(amount), currency, locale);

  return (
    <section aria-label={t.aria} className="store-comparison">
      <div className="store-comparison-head">
        <h2>{t.title}</h2>
        <p>{t.storeCount(comparison.storeCount)}</p>
      </div>

      <p className="store-comparison-saving">
        {comparison.spread > 0 ? t.saving(money(comparison.spread)) : t.samePrice}
      </p>

      <div className="store-comparison-scroll">
        <table className="store-comparison-table">
          <thead>
            <tr>
              <th scope="col">{t.columnStore}</th>
              <th scope="col">{t.columnPrice}</th>
              <th scope="col">{t.columnSizes}</th>
            </tr>
          </thead>
          <tbody>
            {comparison.listings.map((listing) => {
              const isLowest = listing.priceEur === comparison.lowestPrice;
              return (
                <tr className={isLowest ? "is-lowest" : undefined} key={listing.listingId}>
                  {/* Availability sits under the store name rather than in a
                      fourth column — the detail card is too narrow for four,
                      and a clipped column is worse than a stacked one. */}
                  <th scope="row">
                    <Link href={withLocale(`/search?store=${listing.store.id}`, locale)}>
                      {listing.store.label[locale]}
                    </Link>
                    {listing.store.id === viewingStoreId ? (
                      <span className="store-comparison-tag">{t.thisStore}</span>
                    ) : null}
                    <span className={`availability availability-${listing.availability}`}>
                      <span className="sr-only">{t.columnAvailability}: </span>
                      {formatAvailabilityLabel(listing.availability, locale)}
                    </span>
                  </th>
                  <td>
                    <strong>{money(listing.priceEur)}</strong>
                    {listing.oldPriceEur ? <del>{money(listing.oldPriceEur)}</del> : null}
                    {isLowest ? <span className="store-comparison-best">{t.best}</span> : null}
                  </td>
                  <td className="store-comparison-sizes-cell">{listing.sizes.join(" · ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {comparison.sizesNotEverywhere.length > 0 ? (
        <p className="store-comparison-sizes">
          {t.partialSizes(comparison.sizesNotEverywhere.join(", "))}
        </p>
      ) : null}
      <p className="store-comparison-note">{t.syntheticNote}</p>
    </section>
  );
}

function ProductSummary({
  className,
  locale,
  product,
  storeLabel,
}: {
  className: string;
  locale: Locale;
  product: MockProduct;
  storeLabel: string;
}) {
  const categoryLabel = formatCategoryLabel(product.category, locale);

  return (
    <header className={className}>
      <p className="product-detail-category">{categoryLabel}</p>
      <h1>{product.title}</h1>
      <Link
        className="product-detail-store"
        href={withLocale(`/search?store=${product.public_store_id}`, locale)}
      >
        <Store aria-hidden="true" size={16} />
        {storeLabel}
      </Link>
      <div className="product-detail-price">
        <strong>{price(product.price_eur, product.currency, locale)}</strong>
        {product.old_price_eur ? (
          <del>{price(product.old_price_eur, product.currency, locale)}</del>
        ) : null}
      </div>
      <p className={`availability availability-${product.availability}`}>
        {formatAvailabilityLabel(product.availability, locale)}
      </p>
    </header>
  );
}

export function ProductDetailView({
  comparison,
  product,
  storeLabels,
}: {
  comparison: ProductComparison | null;
  product: MockProduct;
  storeLabels: { en: string; lt: string } | null;
}) {
  const locale = useClientLocale();
  // The image the shopper tapped to enlarge; null = lightbox closed.
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!zoom) return;
    // Remember what was focused so we can hand focus back on close, trap Escape,
    // move focus into the dialog, and stop the page behind it from scrolling.
    restoreFocus.current = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoom(null);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      restoreFocus.current?.focus?.();
    };
  }, [zoom]);

  const storeLabel = storeLabels
    ? storeLabels[locale]
    : locale === "lt"
      ? "Parduotuvė"
      : "Store";
  const categoryLabel = formatCategoryLabel(product.category, locale);
  const colorLabel = formatColorLabel(product.color, locale);
  const genderLabel = formatGenderLabel(product.gender, locale);
  const sizes = product.size_options.split("|").filter(Boolean);
  const productAlt = `${product.title}, ${categoryLabel}, ${storeLabel}`;
  const styledAlt =
    locale === "lt"
      ? `${product.title} stilizuotame derinyje`
      : `${product.title} in a styled look`;

  return (
    <div className="route-shell product-detail-page">
      <nav className="product-breadcrumbs" aria-label={locale === "lt" ? "Kelias" : "Breadcrumb"}>
        <Link href={withLocale("/search", locale)}>
          <ArrowLeft aria-hidden="true" size={16} />
          {locale === "lt" ? "Paieška" : "Search"}
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={withLocale(`/search?category=${product.category}`, locale)}>
          {categoryLabel}
        </Link>
      </nav>

      <div className="product-detail-layout">
        <ProductSummary
          className="product-mobile-summary"
          locale={locale}
          product={product}
          storeLabel={storeLabel}
        />

        <section className="product-gallery" aria-label={locale === "lt" ? "Prekės nuotraukos" : "Product images"}>
          <figure>
            <button
              type="button"
              className="product-detail-media product-zoom-trigger"
              onClick={() => setZoom({ src: product.image_path, alt: productAlt })}
              aria-label={locale === "lt" ? "Padidinti nuotrauką" : "Enlarge image"}
            >
              <Image
                alt={productAlt}
                fill
                priority
                sizes="(max-width: 767px) 92vw, 42vw"
                src={product.image_path}
              />
              <span className="product-zoom-badge" aria-hidden="true"><ZoomIn size={18} /></span>
            </button>
            <figcaption>{locale === "lt" ? "Prekė" : "Product view"}</figcaption>
          </figure>
          <figure>
            <button
              type="button"
              className="product-detail-media product-zoom-trigger"
              onClick={() => setZoom({ src: product.detail_image_path, alt: styledAlt })}
              aria-label={locale === "lt" ? "Padidinti nuotrauką" : "Enlarge image"}
            >
              <Image
                alt={styledAlt}
                fill
                sizes="(max-width: 767px) 92vw, 42vw"
                src={product.detail_image_path}
              />
              <span className="product-zoom-badge" aria-hidden="true"><ZoomIn size={18} /></span>
            </button>
            <figcaption>{locale === "lt" ? "Derinio idėja" : "Styled view"}</figcaption>
          </figure>
        </section>

        <article className="product-detail-card">
          <ProductSummary
            className="product-detail-intro"
            locale={locale}
            product={product}
            storeLabel={storeLabel}
          />

          <section className="product-description">
            <h2>{locale === "lt" ? "Aprašymas" : "Description"}</h2>
            <p>{productDescription(product.category, locale)}</p>
            <p>
              {locale === "lt"
                ? "Nuotraukose galite palyginti prekę atskirai ir stilizuotame derinyje."
                : "Use the two images to compare the item on its own and in a styled look."}
            </p>
          </section>

          {comparison ? (
            <StoreComparison
              comparison={comparison}
              locale={locale}
              viewingStoreId={product.public_store_id}
            />
          ) : null}

          <section className="product-size-section">
            <div>
              <h2>{locale === "lt" ? "Galimi dydžiai" : "Available sizes"}</h2>
              <Ruler aria-hidden="true" size={18} />
            </div>
            <ul aria-label={locale === "lt" ? "Dydžių sąrašas" : "Size list"}>
              {sizes.map((size) => <li key={size}>{size}</li>)}
            </ul>
          </section>

          <dl className="product-detail-facts">
            <div>
              <dt><Palette aria-hidden="true" size={17} />{locale === "lt" ? "Spalva" : "Colour"}</dt>
              <dd>{colorLabel}</dd>
            </div>
            <div>
              <dt><UsersRound aria-hidden="true" size={17} />{locale === "lt" ? "Skirta" : "For"}</dt>
              <dd>{genderLabel}</dd>
            </div>
            <div>
              <dt><Info aria-hidden="true" size={17} />{locale === "lt" ? "Kategorija" : "Category"}</dt>
              <dd>{categoryLabel}</dd>
            </div>
          </dl>

          <div className="product-detail-actions">
            <Link
              className="button"
              href={withLocale(`/ai-fitting-room?product=${product.mock_product_id}`, locale)}
            >
              <Sparkles aria-hidden="true" size={18} />
              {locale === "lt" ? "Pasimatuoti su AI" : "Try with AI"}
            </Link>
            <Link className="button secondary" href={withLocale("/search", locale)}>
              {locale === "lt" ? "Grįžti į paiešką" : "Back to search"}
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>

          <p className="product-purchase-note">
            {locale === "lt"
              ? "Pirkimo nuoroda dar neaktyvi."
              : "The purchase link is not active yet."}
          </p>
        </article>
      </div>

      {zoom ? (
        // Click-to-enlarge lightbox. Backdrop click, the close button, or Escape
        // all dismiss it; clicking the image itself does not, so the shopper can
        // examine it. A plain <img> (not next/image) keeps the overlay simple —
        // it renders at whatever size the viewport allows, object-fit: contain.
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={locale === "lt" ? "Padidinta nuotrauka" : "Enlarged image"}
          onClick={() => setZoom(null)}
        >
          <button
            ref={closeRef}
            type="button"
            className="lightbox-close"
            onClick={() => setZoom(null)}
            aria-label={locale === "lt" ? "Uždaryti" : "Close"}
          >
            <X aria-hidden="true" size={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="lightbox-image"
            src={zoom.src}
            alt={zoom.alt}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
