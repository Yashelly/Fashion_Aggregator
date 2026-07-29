import { getSupabaseServerClient } from "@/lib/supabase-server";

const STORAGE_TIMEOUT_MS = 1_000;

type SearchEventInput = {
  anonymousUserId: string;
  filters: Record<string, boolean | number | string>;
  normalizedQuery: string | null;
  queryText: string | null;
  referrerUrl: string | null;
  resultCount: number;
  sortKey: string | null;
  sourcePage: string;
  userAgent: string | null;
};

type PreviewClickInput = {
  anonymousUserId: string;
  clickId: string;
  destinationUrl: string;
  pageUrl: string;
  productId: string;
  referrerUrl: string | null;
  searchEventId: string | null;
  sourcePage: string;
  userAgent: string | null;
};

function reportStorageFailure(operation: string, timedOut: boolean) {
  console.warn(
    `[analytics-storage] ${operation} failed${timedOut ? " (timeout)" : ""}`,
  );
}

export async function saveSearchEvent(input: SearchEventInput) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    STORAGE_TIMEOUT_MS,
  );

  try {
    const { data, error } = await supabase
      .from("search_events")
      .insert({
        anonymous_user_id: input.anonymousUserId,
        filters: input.filters,
        normalized_query: input.normalizedQuery,
        query_text: input.queryText,
        referrer_url: input.referrerUrl,
        result_count: input.resultCount,
        sort_key: input.sortKey,
        source_page: input.sourcePage,
        user_agent: input.userAgent,
      })
      .select("id")
      .abortSignal(controller.signal)
      .single();

    if (error) {
      reportStorageFailure("search-event persistence", false);
      return null;
    }

    return data.id as string;
  } catch (error) {
    reportStorageFailure(
      "search-event persistence",
      error instanceof Error && error.name === "AbortError",
    );
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function saveBlockedPreviewClick(input: PreviewClickInput) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    STORAGE_TIMEOUT_MS,
  );

  try {
    const { error } = await supabase
      .from("outbound_clicks")
      .insert({
        affiliate_subid: `fa_${input.clickId.replaceAll("-", "").slice(0, 12)}`,
        anonymous_user_id: input.anonymousUserId,
        destination_url: input.destinationUrl,
        error_message: `Synthetic preview product ${input.productId}; merchant redirect disabled`,
        id: input.clickId,
        page_url: input.pageUrl,
        redirect_status: "blocked",
        referrer_url: input.referrerUrl,
        search_event_id: input.searchEventId,
        source_page: input.sourcePage,
        store_id: null,
        user_agent: input.userAgent,
      })
      .abortSignal(controller.signal);

    if (error) {
      reportStorageFailure("preview-click persistence", false);
      return false;
    }

    return true;
  } catch (error) {
    reportStorageFailure(
      "preview-click persistence",
      error instanceof Error && error.name === "AbortError",
    );
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
