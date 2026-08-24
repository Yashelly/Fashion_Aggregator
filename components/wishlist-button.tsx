"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "weft-wishlist";

function readWishlist(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * A save-to-wishlist heart. Purely a client-side UI state persisted to
 * localStorage (`weft-wishlist`) — there is no cart, checkout, or account
 * behind it, in line with the synthetic-demo boundary. Rendered as a client
 * island inside the otherwise-server product cards.
 */
export function WishlistButton({
  productId,
  label,
  locale,
}: {
  productId: string;
  label: string;
  locale: "en" | "lt";
}) {
  // Start unsaved on the server and first paint; reconcile from localStorage
  // after mount so the markup matches and there is no hydration mismatch.
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readWishlist().includes(productId));
  }, [productId]);

  const toggle = () => {
    const current = readWishlist();
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The in-session toggle still reflects the click even if storage fails.
    }
    setSaved(next.includes(productId));
  };

  const action = saved
    ? locale === "lt" ? "Pašalinti iš pageidavimų" : "Remove from wishlist"
    : locale === "lt" ? "Įrašyti į pageidavimus" : "Save to wishlist";

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
