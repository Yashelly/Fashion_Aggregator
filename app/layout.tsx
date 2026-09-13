import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { LocaleProvider } from "@/components/locale-provider";
import type { Locale } from "@/lib/i18n";
import { IBM_Plex_Sans, Syne } from "next/font/google";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { CookieConsent } from "@/components/cookie-consent";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const syne = Syne({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap" });
const plex = IBM_Plex_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "Weft — Fashion discovery",
  description: "Discover fashion by item, mood, colour, price, and category.",
};

// Tint the mobile browser chrome to the theme canvas so it matches the page
// instead of defaulting to white. The site theme is attribute-driven rather
// than prefers-color-scheme, so these media entries are a best-effort match.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#161412" },
  ],
};

const themeScript = `
  (() => {
    let savedTheme = null;
    try { savedTheme = localStorage.getItem("weft-theme"); } catch {}
    const theme = savedTheme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  })();
`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const localeCookie = (await cookies()).get("weft-locale")?.value;
  const initialLocale: Locale = localeCookie === "lt" ? "lt" : "en";
  return (
    <html data-theme="light" data-visual-variant="a" lang={initialLocale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${syne.variable} ${plex.variable}`}>
        <LocaleProvider initialLocale={initialLocale}>
        <div className="shell">
          <Suspense fallback={<div className="header-skeleton" aria-hidden="true" />}><SiteHeader /></Suspense>
          <main className="main" id="main-content">{children}</main>
          <Suspense fallback={null}><SiteFooter /></Suspense>
        </div>
        <Suspense fallback={null}><CookieConsent /></Suspense>
        </LocaleProvider>
      </body>
    </html>
  );
}
