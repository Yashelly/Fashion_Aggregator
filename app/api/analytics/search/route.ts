import { NextResponse } from "next/server";
import {
  captureAnalyticsEvent,
  isPostHogConfigured,
  logAnalyticsOutcome,
  normalizeAnonymousId,
} from "@/lib/analytics";
import {
  isSupabaseAnalyticsEnabled,
  saveSearchEvent,
} from "@/lib/analytics-storage";
import { isSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 16_384;
const FILTER_KEYS = [
  "availability",
  "category",
  "color",
  "gender",
  "sale",
  "status",
  "store",
] as const;

type SearchEventBody = {
  anonymousId?: unknown;
  filters?: unknown;
  query?: unknown;
  resultCount?: unknown;
  sort?: unknown;
  sourcePage?: unknown;
};

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const text = value.trim().slice(0, maxLength);
  return text || null;
}

function cleanFilters(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const input = value as Record<string, unknown>;
  const filters: Record<string, boolean | string> = {};

  FILTER_KEYS.forEach((key) => {
    const filterValue = input[key];
    if (typeof filterValue === "boolean") {
      filters[key] = filterValue;
      return;
    }

    const text = cleanText(filterValue, 100);
    if (text) filters[key] = text;
  });

  return filters;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  let body: SearchEventBody;
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }
    body = JSON.parse(rawBody) as SearchEventBody;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Invalid body");
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const resultCount =
    typeof body.resultCount === "number" &&
    Number.isInteger(body.resultCount) &&
    body.resultCount >= 0
      ? body.resultCount
      : null;

  if (resultCount === null) {
    return NextResponse.json({ error: "Invalid result count" }, { status: 400 });
  }

  // No configured sink → a genuine no-op: persist nothing and issue no identifier
  // cookie. (Consent-based gating is a deferred follow-up; today "enabled" means a
  // provider is configured.) This makes the documented "disabled" state literal.
  if (!isPostHogConfigured() && !isSupabaseAnalyticsEnabled()) {
    return NextResponse.json(
      { analytics: "disabled", searchEventId: null },
      { status: 202 },
    );
  }

  const anonymousId = normalizeAnonymousId(body.anonymousId);
  const query = cleanText(body.query, 200);
  const filters = cleanFilters(body.filters);
  const sort = cleanText(body.sort, 50);
  const sourcePage = cleanText(body.sourcePage, 120) || "/search";
  const referrerUrl = cleanText(request.headers.get("referer"), 500);
  const userAgent = cleanText(request.headers.get("user-agent"), 500);

  const [searchResult, posthogStatus] = await Promise.all([
    saveSearchEvent({
      anonymousUserId: anonymousId,
      filters,
      normalizedQuery: query?.toLocaleLowerCase("lt") || null,
      queryText: query,
      referrerUrl,
      resultCount,
      sortKey: sort,
      sourcePage,
      userAgent,
    }),
    captureAnalyticsEvent("search_performed", anonymousId, {
      filter_count: Object.keys(filters).length,
      has_query: Boolean(query),
      result_count: resultCount,
      sort_key: sort,
      source_page: sourcePage,
    }),
  ]);

  const searchEventId = searchResult.id;

  logAnalyticsOutcome("search_performed", {
    supabase: searchResult.status,
    posthog: posthogStatus,
  });

  const response = NextResponse.json(
    {
      analytics: posthogStatus,
      searchEventId,
    },
    {
      status: 202,
    },
  );

  response.cookies.set("vw_anonymous_id", anonymousId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (searchEventId) {
    response.cookies.set("vw_search_event_id", searchEventId, {
      httpOnly: true,
      maxAge: 60 * 30,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
