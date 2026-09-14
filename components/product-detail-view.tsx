"use client";

import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Palette,
  Rotate3D,
  Ruler,
  Store,
  UsersRound,
  X,
  ZoomIn,
} from "lucide-react";
import { WishlistButton } from "@/components/wishlist-button";
import {
  formatAvailabilityLabel,
  formatCategoryLabel,
  formatColorLabel,
  formatGenderLabel,
  getCopy,
  withLocale,
  type Locale,
} from "@/lib/i18n";
import type { PublicProduct, PublicRelatedProduct } from "@/lib/public-product";
import { formatPrice } from "@/lib/format-price";
import { containDialogFocus } from "@/lib/dialog-focus";
import { useClientLocale } from "@/lib/use-client-locale";

function price(amount: string, currency: string, locale: Locale) {
  return formatPrice(amount, currency, locale);
}

function detailHref(productId: string, returnTo: string, locale: Locale) {
  return withLocale(
    `/out/${encodeURIComponent(productId)}?returnTo=${encodeURIComponent(returnTo)}`,
    locale,
  );
}

function ProductSummary({ locale, product }: { locale: Locale; product: PublicProduct }) {
  const t = getCopy(locale).productDetail;
  const storeLabel = product.storeLabel?.[locale] ?? t.storeFallback;

  return (
    <header className="product-detail-intro">
      <p className="product-detail-category">{formatCategoryLabel(product.category, locale)}</p>
      <div className="product-detail-title-row">
        <h1>{product.title}</h1>
        <WishlistButton locale={locale} label={product.title} productId={product.id} />
      </div>
      <Link
        className="product-detail-store"
        href={withLocale(`/search?store=${product.publicStoreId}`, locale)}
      >
        <Store aria-hidden="true" size={16} />
        {storeLabel}
      </Link>
      <div className="product-detail-price">
        <strong>{price(product.priceEur, product.currency, locale)}</strong>
      {Number(product.oldPriceEur) > Number(product.priceEur) ? (
          <del>{price(product.oldPriceEur, product.currency, locale)}</del>
        ) : null}
      </div>
      {product.availability && <p className={`availability availability-${product.availability}`}>
        {formatAvailabilityLabel(product.availability, locale)}
      </p>}
    </header>
  );
}

export function ProductDetailView({
  product,
  related,
  returnTo,
}: {
  product: PublicProduct;
  related: PublicRelatedProduct[];
  returnTo: string;
}) {
  const locale = useClientLocale();
  const t = getCopy(locale).productDetail;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [zoomFailed, setZoomFailed] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const categoryLabel = formatCategoryLabel(product.category, locale);
  const storeLabel = product.storeLabel?.[locale] ?? t.storeFallback;
  const returnHref = withLocale(returnTo, locale);
  const imageGallery = product.imageGallery.length > 0 ? product.imageGallery : [];
  const selectedImage = imageGallery[activeImageIndex];
  const productAlt = `${product.title}, ${categoryLabel}, ${storeLabel}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !zoom || dialog.open) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [zoom]);

  function openGalleryImage(imageIndex: number) {
    const image = imageGallery[imageIndex];
    if (!image) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    setZoomedIn(false);
    setZoomFailed(false);
    setOrigin({ x: 50, y: 50 });
    setActiveImageIndex(imageIndex);
    setZoom({ src: image, alt: `${product.title}, image ${imageIndex + 1}` });
  }

  function closeGallery() {
    dialogRef.current?.close();
  }

  function handleDialogClose() {
    setZoom(null);
    setZoomedIn(false);
    restoreFocusRef.current?.focus();
    restoreFocusRef.current = null;
  }

  return (
    <div className="route-shell product-detail-page">
      <nav className="product-breadcrumbs" aria-label={t.breadcrumbAria}>
        <Link href={returnHref}>
          <ArrowLeft aria-hidden="true" size={16} />
          {t.search}
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={withLocale(`/search?category=${product.category}`, locale)}>
          {categoryLabel}
        </Link>
      </nav>

      <div className="product-detail-layout">
        <section className="product-gallery" aria-label={t.galleryAria}>
          <div className="product-gallery-main">
            {selectedImage ? (
              <button
                type="button"
                className="product-detail-media product-zoom-trigger"
                onClick={() => openGalleryImage(activeImageIndex)}
                aria-label={t.enlargeImage}
              >
                <ProductImage alt={`${product.title}, image ${activeImageIndex + 1}`} eager unavailableLabel={getCopy(locale).frontend.imageUnavailable} sizes="(max-width: 43.75em) 50vw, (max-width: 63.9375em) 25vw, (min-width: 2560px) 724px, 29vw" src={selectedImage} />
                <span className="product-zoom-badge" aria-hidden="true"><ZoomIn size={18} /></span>
              </button>
            ) : (
              <div className="product-detail-media" role="img" aria-label={productAlt}>
                <ProductImage src={null} alt={productAlt} unavailableLabel={getCopy(locale).frontend.imageUnavailable} sizes="(max-width: 43.75em) 50vw, (max-width: 63.9375em) 25vw, (min-width: 2560px) 724px, 29vw" />
              </div>
            )}
            <p className="product-gallery-caption">{t.productView}</p>
          </div>

          {imageGallery.length > 1 ? (
            <div className="product-gallery-thumbs" role="tablist" aria-label={t.productView}>
              {imageGallery.map((image, index) => (
                <button
                  key={image}
                  className={`product-gallery-thumb${index === activeImageIndex ? " is-active" : ""}`}
                  type="button"
                  role="tab"
                  aria-label={`${t.productView} ${index + 1}`}
                  aria-selected={index === activeImageIndex}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <ProductImage alt={`${product.title}, image ${index + 1}`} unavailableLabel={getCopy(locale).frontend.imageUnavailable} sizes="72px" src={image} eager={index === 0} />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <article className="product-detail-card">
          <ProductSummary locale={locale} product={product} />

          {product.sizeOptions.length > 0 && <section className="product-size-section">
            <div>
              <h2>{t.sizesTitle}</h2>
              <Ruler aria-hidden="true" size={18} />
            </div>
            <ul aria-label={t.sizesAria}>
              {product.sizeOptions.map((size) => <li key={size}>{size}</li>)}
            </ul>
          </section>}

          <dl className="product-detail-facts">
            {product.color && <div>
              <dt><Palette aria-hidden="true" size={17} />{t.colour}</dt>
              <dd>{formatColorLabel(product.color, locale)}</dd>
            </div>}
            {product.gender && <div>
              <dt><UsersRound aria-hidden="true" size={17} />{t.forLabel}</dt>
              <dd>{formatGenderLabel(product.gender, locale)}</dd>
            </div>}
            <div>
              <dt><Info aria-hidden="true" size={17} />{t.category}</dt>
              <dd>{categoryLabel}</dd>
            </div>
          </dl>

          <div className="product-detail-actions">
            <Link className="button secondary" href={withLocale(`/ai-fitting-room?product=${product.id}`, locale)}>
              <Rotate3D aria-hidden="true" size={18} />
              {t.preview3d}
            </Link>
            <Link className="button secondary" href={returnHref}>
              {t.backToSearch}
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </article>
      </div>

      {related.length > 0 ? (
        <section className="related-products" aria-label={t.relatedAria}>
          <h2>{t.relatedTitle}</h2>
          <div className="product-grid">
            {related.map((item) => {
              const itemHref = detailHref(item.id, returnTo, locale);
              const itemStore = item.storeLabel?.[locale] ?? t.storeFallback;
              const itemCategory = formatCategoryLabel(item.category, locale);
              const itemAlt = `${item.title}, ${itemCategory}, ${itemStore}`;

              return (
                <article className="product-tile" key={item.id}>
                  <div className="product-media-wrap">
                    <Link className={`product-media${item.imagePath ? " has-image" : ""}`} href={itemHref} aria-label={itemAlt}>
                      {item.imagePath ? (
                        <ProductImage alt={itemAlt} unavailableLabel={getCopy(locale).frontend.imageUnavailable} sizes="(max-width: 43.75em) 50vw, (max-width: 63.9375em) 34vw, (min-width: 2560px) 640px, 25vw" src={item.imagePath} />
                      ) : (
                        <span className="media-category">{itemCategory}</span>
                      )}
                    </Link>
                    <WishlistButton locale={locale} label={item.title} productId={item.id} />
                  </div>
                  <div className="product-body">
                    <p className="product-kicker">{itemCategory}</p>
                    <h3 className="product-title"><Link href={itemHref}>{item.title}</Link></h3>
                    <div className="product-price-row">
                      <span className="price"><data value={item.priceEur}>{price(item.priceEur, item.currency, locale)}</data></span>
                      {Number(item.oldPriceEur) > Number(item.priceEur) ? <span className="old-price"><del>{price(item.oldPriceEur, item.currency, locale)}</del></span> : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <dialog
        aria-label={t.dialogAria}
        className="lightbox"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeGallery();
        }}
        onClose={handleDialogClose}
        onKeyDown={containDialogFocus}
        ref={dialogRef}
      >
        <button type="button" className="lightbox-close" onClick={closeGallery} aria-label={t.close}>
          <X aria-hidden="true" size={24} />
        </button>
        {zoomFailed ? <p className="empty-state" role="status">{getCopy(locale).frontend.imageUnavailable}</p> : zoom ? (
          <button
            aria-label={zoomedIn ? t.zoomOutHint : t.zoomInHint}
            className="lightbox-image-button"
            onClick={() => setZoomedIn((value) => !value)}
            onMouseMove={(event) => {
              if (!zoomedIn) return;
              const rect = event.currentTarget.getBoundingClientRect();
              setOrigin({
                x: ((event.clientX - rect.left) / rect.width) * 100,
                y: ((event.clientY - rect.top) / rect.height) * 100,
              });
            }}
            type="button"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={`lightbox-image${zoomedIn ? " is-zoomed" : ""}`}
              src={zoom.src}
              alt={zoom.alt}
              draggable={false}
              onError={() => setZoomFailed(true)}
              style={zoomedIn ? { transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
            />
          </button>
        ) : null}
        <p className="lightbox-hint" aria-hidden="true">{zoomedIn ? t.zoomOutHint : t.zoomInHint}</p>
      </dialog>
    </div>
  );
}
