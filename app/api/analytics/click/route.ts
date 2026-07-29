import { type NextRequest, NextResponse, after } from "next/server";
import {
  captureAnalyticsEvent,
  normalizeAnonymousId,
} from "@/lib/analytics";
import { saveBlockedPreviewClick } from "@/lib/analytics-storage";
import { getMockProducts } from "@/lib/mock-products";
import { isSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 2_048;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const text = value.trim().slice(0, maxLength);
  return text || null;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }
    body = JSON.parse(rawBody) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Invalid body");
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const productId = cleanText(body.productId, 64);
  const product = getMockProducts().find(
    (candidate) => candidate.mock_product_id === productId,
  );
  if (!product) {
    return NextResponse.json({ error: "Unknown item" }, { status: 404 });
  }

  const clickId = crypto.randomUUID();
  const anonymousId = normalizeAnonymousId(
    request.cookies.get("vw_anonymous_id")?.value,
  );
  const searchEventCookie =
    request.cookies.get("vw_search_event_id")?.value || null;
  const searchEventId =
    searchEventCookie && UUID_PATTERN.test(searchEventCookie)
      ? searchEventCookie
      : null;
  const sourcePage = cleanText(body.placement, 120) || "product_grid";
  const referrerUrl = cleanText(request.headers.get("referer"), 500);
  const userAgent = cleanText(request.headers.get("user-agent"), 500);

  after(async () => {
    const [, analyticsStatus] = await Promise.all([
      saveBlockedPreviewClick({
        anonymousUserId: anonymousId,
        clickId,
        destinationUrl: `/out/${encodeURIComponent(product.mock_product_id)}`,
        pageUrl: `/out/${encodeURIComponent(product.mock_product_id)}`,
        productId: product.mock_product_id,
        referrerUrl,
        searchEventId,
        sourcePage,
        userAgent,
      }),
      captureAnalyticsEvent("outbound_click_intent", anonymousId, {
        click_id: clickId,
        placement: sourcePage,
        preview_mode: true,
        product_id: product.mock_product_id,
        source_status: product.source_status,
        synthetic_source: product.store_slug,
      }),
    ]);

    if (analyticsStatus === "failed") {
      console.warn("[analytics] outbound-click capture failed");
    }
  });

  return NextResponse.json({ analytics: "scheduled" }, { status: 202 });
}
