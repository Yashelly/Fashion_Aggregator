"use client";

import { useEffect } from "react";

export function ClickoutAnalyticsTracker({
  productId,
}: {
  productId: string;
}) {
  useEffect(() => {
    void fetch("/api/analytics/click", {
      body: JSON.stringify({
        placement: "product_grid",
        productId,
      }),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      method: "POST",
    }).catch(() => {
      // Telemetry never interrupts the onsite preview guard.
    });
  }, [productId]);

  return null;
}
