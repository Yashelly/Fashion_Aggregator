import Link from "next/link";
import type { MockProduct } from "@/lib/mock-products";
import { getPublicDemoStoreById, getPublicDemoStoreLabel } from "@/lib/demo-stores";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductImage } from "@/components/product-image";
import { formatAvailabilityLabel, getCopy, type Locale, withLocale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format-price";
import {
  SearchContinuityController,
} from "@/components/search-continuity";
import { productLinkDomId } from "@/lib/search-continuity";

export function ProductGrid({ ariaLabel, locale = "en", products, returnTo = "/search" }: {
  ariaLabel?: string; locale?: Locale; products: MockProduct[]; returnTo?: string;
}) {
  const t = getCopy(locale).frontend;
  return <section className="product-grid" aria-label={ariaLabel ?? t.resultAria(products.length)}>
    <SearchContinuityController />
    {products.map((product, index) => {
      const href = withLocale(`/out/${product.mock_product_id}?returnTo=${encodeURIComponent(returnTo)}`, locale);
      const mediaFocusTarget = productLinkDomId(product.mock_product_id, "media");
      const titleFocusTarget = productLinkDomId(product.mock_product_id, "title");
      const store = getPublicDemoStoreById(product.public_store_id);
      const storeLabel = store ? getPublicDemoStoreLabel(store, locale) : t.storeFallback;
      const styled = index % 2 === 0 && product.detail_image_available;
      const image = styled ? product.detail_image_path : product.image_available ? product.image_path : null;
      return <article className={`product-tile${product.availability === "out_of_stock" ? " is-sold-out" : ""}`} key={product.mock_product_id}>
        <div className="product-media-wrap">
          <Link className="product-media" href={href} aria-label={`${t.viewDetails}: ${product.title}`}
            id={mediaFocusTarget} data-search-continuity data-product-id={product.mock_product_id} data-search-href={returnTo}>
            <ProductImage src={image} alt={styled ? getCopy(locale).productDetail.styledAlt(product.title) : product.title}
              unavailableLabel={t.imageUnavailable} eager={index < 4} sizes="(max-width: 43.75em) 50vw, (max-width: 56.25em) 34vw, (min-width: 2560px) 854px, 34vw" />
          </Link>
          <WishlistButton locale={locale} label={product.title} productId={product.mock_product_id} />
        </div>
        <div className="product-body">
          <h2 className="product-title"><Link className="product-link" href={href}
            id={titleFocusTarget} data-search-continuity data-product-id={product.mock_product_id} data-search-href={returnTo}>{product.title}</Link></h2>
          <div className="product-meta">
            <Link className="product-store" href={withLocale(`/search?store=${product.public_store_id}`, locale)}>{storeLabel}</Link>
            <div className="product-price-row">
            <span className="price"><span className="sr-only">{t.currentPrice}: </span><data value={product.price_eur}>{formatPrice(product.price_eur, product.currency, locale)}</data></span>
            {product.old_price_eur && Number(product.old_price_eur) > Number(product.price_eur) ? <span className="old-price"><span className="sr-only">{t.previousPrice}: </span><del>{formatPrice(product.old_price_eur, product.currency, locale)}</del></span> : null}
            </div>
          </div>
          {product.availability !== "in_stock" && <p className={`availability availability-${product.availability}`}>{formatAvailabilityLabel(product.availability, locale)}</p>}
        </div>
      </article>;
    })}
  </section>;
}
