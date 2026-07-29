import "server-only";

const DEFAULT_POSTHOG_HOST = "https://eu.i.posthog.com";
const CAPTURE_TIMEOUT_MS = 1_000;

export type AnalyticsCaptureStatus = "disabled" | "failed" | "sent";

type AnalyticsEvent = "outbound_click_intent" | "search_performed";

type AnalyticsProperties = Record<
  string,
  boolean | number | string | null | undefined
>;

function getPostHogConfig() {
  const apiKey = process.env.POSTHOG_PROJECT_API_KEY?.trim();

  if (!apiKey) return null;

  const host = process.env.POSTHOG_HOST?.trim() || DEFAULT_POSTHOG_HOST;

  try {
    return {
      apiKey,
      captureUrl: new URL("/capture/", host).toString(),
    };
  } catch {
    return null;
  }
}

export function createAnonymousId() {
  return `anon_${crypto.randomUUID()}`;
}

export function normalizeAnonymousId(value: unknown) {
  if (typeof value !== "string") return createAnonymousId();

  const normalized = value.trim().slice(0, 128);
  return /^[a-zA-Z0-9._:-]+$/.test(normalized)
    ? normalized
    : createAnonymousId();
}

export async function captureAnalyticsEvent(
  event: AnalyticsEvent,
  distinctId: string,
  properties: AnalyticsProperties,
): Promise<AnalyticsCaptureStatus> {
  const config = getPostHogConfig();

  if (!config) return "disabled";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAPTURE_TIMEOUT_MS);

  try {
    const response = await fetch(config.captureUrl, {
      body: JSON.stringify({
        api_key: config.apiKey,
        event,
        properties: {
          ...properties,
          distinct_id: distinctId,
          $process_person_profile: false,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: controller.signal,
    });

    return response.ok ? "sent" : "failed";
  } catch {
    return "failed";
  } finally {
    clearTimeout(timeout);
  }
}
