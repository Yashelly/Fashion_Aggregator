import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Syne } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { CookieConsent } from "@/components/cookie-consent";
import { LocaleProvider } from "@/components/locale-provider";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/i18n";
import "./globals.css";

const syne = Syne({ subsets: ["latin", "latin-ext"], variable: "--font-wordmark", display: "swap" });

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
    { media: "(prefers-color-scheme: dark)", color: "#161616" },
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
    <html data-theme="light" lang={initialLocale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={syne.variable}>
        <LocaleProvider initialLocale={initialLocale}>
          <div className="shell">
            <SiteHeader />
            <main className="main" id="main-content" tabIndex={-1}>{children}</main>
            <SiteFooter />
          </div>
          <CookieConsent />
        </LocaleProvider>
      </body>
    </html>
  );
}
