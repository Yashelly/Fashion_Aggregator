"use client";

import { useEffect } from "react";
import {
  consumeSearchContinuityPayload,
  createSearchContinuityPayload,
  saveSearchContinuityPayload,
} from "@/lib/search-continuity";
import { sanitizeSearchReturnTo } from "@/lib/public-product";

function isOrdinaryNavigation(event: MouseEvent, anchor: HTMLAnchorElement) {
  return !event.defaultPrevented
    && event.button === 0
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
    && !event.altKey
    && (!anchor.target || anchor.target === "_self");
}

function getCommittedSearchHref() {
  return document.querySelector<HTMLAnchorElement>("a[data-search-continuity][data-search-href]")
    ?.dataset.searchHref ?? "/search";
}

export function SearchContinuityController() {
  useEffect(() => {
    if (window.location.pathname !== "/search") return;

    function capturePosition(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[data-search-continuity]");
      if (!anchor || !isOrdinaryNavigation(event, anchor)) return;
      const productId = anchor.dataset.productId;
      const searchHref = anchor.dataset.searchHref;
      if (!productId || !searchHref || !anchor.id) return;

      const payload = createSearchContinuityPayload({
        searchHref,
        productId,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        focusTarget: anchor.id,
      });
      if (!payload || payload.searchHref !== sanitizeSearchReturnTo(getCommittedSearchHref())) return;

      // The returnTo query remains sufficient when browser storage is unavailable.
      saveSearchContinuityPayload(() => window.sessionStorage, payload);
    }

    document.addEventListener("click", capturePosition, true);

    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;
    const payload = consumeSearchContinuityPayload(() => window.sessionStorage, getCommittedSearchHref());
    if (payload) {
      const restore = () => {
        if (cancelled) return;
        const target = document.getElementById(payload.focusTarget);
        if (!(target instanceof HTMLElement)) return;
        window.scrollTo({ left: payload.scrollX, top: payload.scrollY, behavior: "auto" });
        target.focus({ preventScroll: true });
      };

      void document.fonts.ready.catch(() => undefined).then(() => {
        firstFrame = window.requestAnimationFrame(() => {
          secondFrame = window.requestAnimationFrame(restore);
        });
      });
    }

    return () => {
      cancelled = true;
      document.removeEventListener("click", capturePosition, true);
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  return null;
}
