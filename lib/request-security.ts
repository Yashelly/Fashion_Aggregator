import "server-only";

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const requestUrl = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim() ||
    request.headers.get("host") ||
    requestUrl.host;
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
