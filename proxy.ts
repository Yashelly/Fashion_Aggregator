import { type NextRequest, NextResponse } from "next/server";
import { getMockProducts } from "@/lib/mock-products";

const LOCALE_COOKIE = "weft-locale";

function isSpeculativePrefetch(request: NextRequest) {
  const purpose = request.headers.get("purpose")?.toLowerCase() ?? "";
  const secPurpose = request.headers.get("sec-purpose")?.toLowerCase() ?? "";
  return request.headers.get("next-router-prefetch") === "1"
    || purpose.includes("prefetch")
    || secPurpose.includes("prefetch");
}

function isHtmlDocumentNavigation(request: NextRequest) {
  const accept = request.headers.get("accept")?.toLowerCase() ?? "";
  const isFlight = request.headers.get("rsc") === "1"
    || accept.includes("text/x-component")
    || request.nextUrl.searchParams.has("_rsc");
  if (isFlight) return false;

  return request.headers.get("sec-fetch-dest") === "document"
    || accept.includes("text/html");
}

function syncLocaleCookie(
  response: NextResponse,
  lang: string | null,
  persistPreference: boolean,
) {
  if (!persistPreference || (lang !== "en" && lang !== "lt")) return response;

  response.cookies.set(LOCALE_COOKIE, lang, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export function proxy(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang");
  const persistPreference = isHtmlDocumentNavigation(request)
    && !isSpeculativePrefetch(request);

  if (
    lang !== "en" &&
    lang !== "lt" &&
    request.cookies.get(LOCALE_COOKIE)?.value === "lt"
  ) {
    const localizedUrl = request.nextUrl.clone();
    localizedUrl.searchParams.set("lang", "lt");
    return NextResponse.redirect(localizedUrl);
  }

  if (lang === "en" || lang === "lt") {
    request.cookies.set(LOCALE_COOKIE, lang);
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("cookie", request.cookies.toString());

  const outMatch = request.nextUrl.pathname.match(/^\/out\/([^/]+)$/);
  if (outMatch) {
    let productId = "";
    try {
      productId = decodeURIComponent(outMatch[1]);
    } catch {
      productId = "";
    }

    const productExists = getMockProducts().some(
      (product) => product.mock_product_id === productId,
    );
    if (!productExists) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname =
        `/__weft-missing-preview/${encodeURIComponent(productId || "invalid")}`;

      return syncLocaleCookie(
        NextResponse.rewrite(rewriteUrl, {
          request: { headers: requestHeaders },
        }),
        lang,
        persistPreference,
      );
    }
  }

  return syncLocaleCookie(
    NextResponse.next({
      request: { headers: requestHeaders },
    }),
    lang,
    persistPreference,
  );
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
