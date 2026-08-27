import "server-only";

/**
 * Same-origin guard for the public analytics POST endpoints.
 *
 * Threat closed here: the previous implementation trusted `X-Forwarded-Host` to
 * reconstruct the expected origin, so a caller who set `Origin: https://evil` and
 * a matching `X-Forwarded-Host` passed the check. A missing `Origin` was also
 * treated as same-origin. Both are fixed below.
 *
 * Hard guarantee requires `APP_CANONICAL_ORIGIN` (e.g. `https://weft.example`).
 * When set, the `Origin` header is compared strictly against it and no request
 * header can influence the expected value. Set this in any real deployment.
 *
 * Without it (local dev / CI), the expected origin is pinned to the request's
 * own `Host` header — never `X-Forwarded-Host` — which keeps same-origin fetches
 * working while removing the forwarded-host bypass. `X-Forwarded-Proto` is still
 * honored so a TLS-terminating proxy's scheme is respected.
 */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  // Browsers always send `Origin` on fetch/keepalive POSTs, so a missing Origin
  // is a non-browser caller. Reject rather than assume same-origin.
  if (!origin) return false;

  const canonical = process.env.APP_CANONICAL_ORIGIN?.trim();
  if (canonical) {
    try {
      return origin === new URL(canonical).origin;
    } catch {
      return false;
    }
  }

  const requestUrl = new URL(request.url);
  const host = request.headers.get("host") || requestUrl.host;
  const protocol =
    request.headers.get("x-forwarded-proto")?.split(",", 1)[0]?.trim() ||
    requestUrl.protocol.slice(0, -1);

  if (!host || (protocol !== "http" && protocol !== "https")) return false;

  try {
    return origin === new URL(`${protocol}://${host}`).origin;
  } catch {
    return false;
  }
}
