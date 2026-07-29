import { type NextRequest, NextResponse } from "next/server";
import { getMockProducts } from "@/lib/mock-products";

const LOCALE_COOKIE = "vibewear-locale";

function syncLocaleCookie(response: NextResponse, lang: string | null) {
  if (lang !== "en" && lang !== "lt") return response;

  response.cookies.set(LOCALE_COOKIE, lang, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export function proxy(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang");

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
        `/__vibewear-missing-preview/${encodeURIComponent(productId || "invalid")}`;

      return syncLocaleCookie(
        NextResponse.rewrite(rewriteUrl, {
          request: { headers: requestHeaders },
        }),
        lang,
      );
    }
  }

  return syncLocaleCookie(
    NextResponse.next({
      request: { headers: requestHeaders },
    }),
    lang,
  );
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
