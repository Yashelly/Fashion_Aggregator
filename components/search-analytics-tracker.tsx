"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const FILTER_KEYS = ["availability", "category", "color", "gender", "sale", "status", "store"] as const;

function getAnonymousId() {
  const key = "weft-anonymous-id";
  const created =
    globalThis.crypto?.randomUUID?.() ??
    `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  try {
    const current = window.localStorage.getItem(key);
    if (current) return current;
    window.localStorage.setItem(key, created);
  } catch {
    // Privacy-restricted storage falls back to an ephemeral identifier.
  }

  return created;
}

export function SearchAnalyticsTracker({ resultCount }: { resultCount: number }) {
  const params = useSearchParams();
  const signature = params.toString();

  useEffect(() => {
    const filters = Object.fromEntries(
      FILTER_KEYS.flatMap((key) => {
        const value = params.get(key);
        return value ? [[key, value]] : [];
      }),
    );

    const timer = window.setTimeout(() => {
      void fetch("/api/analytics/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymousId: getAnonymousId(),
          query: params.get("query"),
          filters,
          sort: params.get("sort"),
          resultCount,
          sourcePage: "/search",
        }),
        keepalive: true,
      }).catch(() => {
        // Analytics is non-blocking; discovery remains functional if tracking is unavailable.
      });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [params, resultCount, signature]);

  return null;
}
