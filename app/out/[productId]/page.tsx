import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Palette,
  Ruler,
  Sparkles,
  Store,
  UsersRound,
} from "lucide-react";
import { getPublicDemoStoreById, getPublicDemoStoreLabel } from "@/lib/demo-stores";
import {
  formatAvailabilityLabel,
  formatCategoryLabel,
  formatColorLabel,
  formatGenderLabel,
  getLocale,
  normalizeParams,
  type Locale,
  type SearchParamsInput,
  withLocale,
} from "@/lib/i18n";
import { getMockProducts } from "@/lib/mock-products";

type OutPageProps = {
  params: Promise<{
    productId: string;
  }>;
  searchParams: Promise<SearchParamsInput>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getMockProducts().map((product) => ({
    productId: product.mock_product_id,
  }));
}

export async function generateMetadata({ params }: OutPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = getMockProducts().find((item) => item.mock_product_id === productId);

  if (!product) return {};

  return {
    title: `${product.title} — VIBEWEAR`,
    description: `View ${product.title}, available sizes, product details, and styling images.`,
  };
}

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

function ProductSummary({
  className,
  locale,
  product,
  storeLabel,
}: {
  className: string;
  locale: Locale;
  product: ReturnType<typeof getMockProducts>[number];
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

export default async function OutPage({ params, searchParams }: OutPageProps) {
  const { productId } = await params;
  const product = getMockProducts().find((item) => item.mock_product_id === productId);

  if (!product) notFound();

  const query = normalizeParams(await searchParams);
  const locale = getLocale(query);
  const store = getPublicDemoStoreById(product.public_store_id);
  const storeLabel = store
    ? getPublicDemoStoreLabel(store, locale)
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
            <div className="product-detail-media">
              <Image
                alt={productAlt}
                fill
                priority
                sizes="(max-width: 767px) 92vw, 42vw"
                src={product.image_path}
              />
            </div>
            <figcaption>{locale === "lt" ? "Prekė" : "Product view"}</figcaption>
          </figure>
          <figure>
            <div className="product-detail-media">
              <Image
                alt={styledAlt}
                fill
                sizes="(max-width: 767px) 92vw, 42vw"
                src={product.detail_image_path}
              />
            </div>
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
              <dt><UsersRound aria-hidden="true" size={17} />{locale === "lt" ? "Skirta" : "Edit"}</dt>
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
    </div>
  );
}
