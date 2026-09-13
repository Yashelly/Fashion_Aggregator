"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { getCopy, type Locale } from "@/lib/i18n";
import { readSavedItems, subscribeSavedItems, toggleSavedItem } from "@/lib/saved-items";

/**
 * A browser-local saved-item control shared by cards, details and collection.
 */
export function WishlistButton({
  productId,
  label,
  locale,
}: {
  productId: string;
  label: string;
  locale: Locale;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readSavedItems().ids.includes(productId));
    sync();
    return subscribeSavedItems(sync);
  }, [productId]);

  const toggle = () => {
    setSaved(toggleSavedItem(productId).ids.includes(productId));
  };

  const t = getCopy(locale).frontend;
  const action = saved ? t.removeSaved : t.saveItem;

  return (
    <button
      aria-label={`${action}: ${label}`}
      aria-pressed={saved}
      className={`wishlist-button${saved ? " is-saved" : ""}`}
      onClick={toggle}
      title={action}
      type="button"
    >
      <Heart aria-hidden="true" size={18} />
    </button>
  );
}
