"use client";

import { History, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProductImage } from "@/components/product-image";
import { WishlistButton } from "@/components/wishlist-button";
import { formatPrice } from "@/lib/format-price";
import { getCopy, type Locale, withLocale } from "@/lib/i18n";
import type { PublicProduct } from "@/lib/public-product";
import { readRecentSearches, type RecentSearch } from "@/lib/recent-searches";
import { readSavedItems, subscribeSavedItems, type SavedItemsSnapshot } from "@/lib/saved-items";

const emptySavedItems: SavedItemsSnapshot = { ids: [], storageAvailable: true };

export function AccountDashboard({ locale, products }: { locale: Locale; products: PublicProduct[] }) {
  const t = getCopy(locale).frontend;
  const [savedItems, setSavedItems] = useState<SavedItemsSnapshot>(emptySavedItems);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const sync = () => setSavedItems(readSavedItems());
    sync();
    setRecentSearches(readRecentSearches());
    return subscribeSavedItems(sync);
  }, []);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const savedProducts = savedItems.ids
    .map((id) => productById.get(id))
    .filter((product): product is PublicProduct => Boolean(product));

  return (
    <div className="account-layout">
      <div className="account-content">
        <p className="account-privacy">
          <LockKeyhole aria-hidden="true" size={16} />
          {t.localCollectionNote}
        </p>
        {!savedItems.storageAvailable ? (
          <p className="account-storage-note" role="status">{t.storageUnavailable}</p>
        ) : null}

        <section aria-labelledby="saved-items-title" className="account-card">
          <div className="account-section-heading">
            <div>
              <h2 id="saved-items-title">{t.saved}</h2>
              <p>{t.savedLead}</p>
            </div>
            <span aria-label={t.count(savedProducts.length)}>{savedProducts.length}</span>
          </div>

          {savedProducts.length ? (
            <ul className="saved-product-list">
              {savedProducts.map((product) => {
                const href = withLocale(`/out/${encodeURIComponent(product.id)}`, locale);
                return (
                  <li className="saved-product" key={product.id}>
                    <Link className="saved-product-image" href={href}>
                      <ProductImage
                        alt={product.title}
                        sizes="(max-width: 35em) 5.5rem, 10.5rem"
                        src={product.imageAvailable ? product.imagePath : null}
                        unavailableLabel={t.imageUnavailable}
                      />
                    </Link>
                    <div className="saved-product-copy">
                      <p>{product.storeLabel?.[locale] ?? t.storeFallback}</p>
                      <h3><Link href={href}>{product.title}</Link></h3>
                      <strong>{formatPrice(product.priceEur, product.currency, locale)}</strong>
                    </div>
                    <WishlistButton locale={locale} label={product.title} productId={product.id} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="account-empty">
              <h3>{t.noSaved}</h3>
              <p>{t.noSavedLead}</p>
              <Link className="button" href={withLocale("/search", locale)}>{t.browseAll}</Link>
            </div>
          )}
        </section>

        <section aria-labelledby="recent-searches-title" className="account-card">
          <div className="account-section-heading">
            <div>
              <History aria-hidden="true" size={20} />
              <h2 id="recent-searches-title">{t.recentSearches}</h2>
            </div>
          </div>
          {recentSearches.length ? (
            <ul className="recent-search-list">
              {recentSearches.slice(0, 8).map((entry) => (
                <li key={`${entry.query}-${entry.at}`}>
                  <Link href={withLocale(`/search?query=${encodeURIComponent(entry.query)}`, locale)}>
                    {entry.query}
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="account-muted">{t.noRecent}</p>}
        </section>
      </div>
      <style>{accountStyles}</style>
    </div>
  );
}

const accountStyles = `
.account-layout{max-width:57.5rem}.account-card h2,.account-card h3{margin:0}.account-card h2{font-family:var(--font-display)}.account-privacy{display:flex;gap:0.5625rem;align-items:flex-start;font-size:0.8125rem;color:var(--color-ink-muted);margin:0 0 0.5rem}
.account-content{display:grid;gap:1.125rem}.account-card{border:1px solid var(--color-line);background:var(--color-surface);padding:clamp(1.25rem,3vw,1.875rem)}.account-storage-note{margin:0;border:1px solid var(--color-line);padding:0.75rem 0.875rem;background:var(--color-canvas);font-size:0.8125rem}
.account-section-heading{display:flex;justify-content:space-between;gap:1.25rem;align-items:flex-start;margin-bottom:1.375rem}.account-section-heading>div{display:flex;align-items:center;gap:0.625rem;flex-wrap:wrap}.account-section-heading p{flex-basis:100%;margin:0;color:var(--color-ink-muted);font-size:0.8125rem}.account-section-heading>span{display:grid;place-items:center;min-width:2.125rem;height:2.125rem;border:1px solid var(--color-line);font-variant-numeric:tabular-nums}
.saved-product-list,.recent-search-list{list-style:none;margin:0;padding:0}.saved-product-list{display:grid}.saved-product{display:grid;grid-template-columns:7rem minmax(0,1fr) 2.75rem;gap:1.125rem;align-items:center;border-top:1px solid var(--color-line);padding:1rem 0}.saved-product:first-child{border-top:0;padding-top:0}.saved-product-image{position:relative;display:block;aspect-ratio:4/5;background:var(--color-canvas);overflow:hidden}.saved-product-image img{object-fit:contain}.saved-product-copy p{margin:0 0 0.3125rem;color:var(--color-ink-muted);font-size:0.75rem}.saved-product-copy h3{font-size:1.0625rem;line-height:1.3}.saved-product-copy h3 a{color:inherit;text-decoration:none}.saved-product-copy h3 a:hover{text-decoration:underline}.saved-product-copy strong{display:block;margin-top:0.625rem;font-size:0.875rem}.saved-product>.wishlist-button{align-self:start}
.account-empty{border-top:1px solid var(--color-line);padding-top:1.5rem}.account-empty h3{font-family:var(--font-display);font-size:1.5rem}.account-empty p,.account-muted{color:var(--color-ink-muted)}.account-empty .button{display:inline-flex;margin-top:0.625rem}.recent-search-list{display:flex;flex-wrap:wrap;gap:0.5rem}.recent-search-list a{display:inline-flex;min-height:2.5rem;align-items:center;border:1px solid var(--color-line);padding:0.4375rem 0.75rem;color:var(--color-ink);text-decoration:none}.recent-search-list a:hover{border-color:var(--color-ink)}
@media(max-width:35em){.saved-product{grid-template-columns:5.5rem minmax(0,1fr) 2.75rem;gap:0.75rem}.account-card{padding:1.125rem}}
`;
