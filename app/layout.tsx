import type { Metadata } from "next";
import { cookies } from "next/headers";
import { IBM_Plex_Sans, Syne } from "next/font/google";
import { Suspense } from "react";
import { LoadingMascotProvider } from "@/components/loading-mascot";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const syne = Syne({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap" });
const plex = IBM_Plex_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "VIBEWEAR — Fashion discovery",
  description: "Discover fashion by item, mood, colour, price, and category.",
};

const themeScript = `
  (() => {
    let savedTheme = null;
    let savedVariant = null;
    try { savedTheme = localStorage.getItem("vibewear-theme"); } catch {}
    try { savedVariant = localStorage.getItem("vibewear-visual-variant"); } catch {}
    const theme = savedTheme === "dark" ? "dark" : "light";
    const variant = savedVariant === "b" ? "b" : "a";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.documentElement.dataset.visualVariant = variant;
  })();
`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = (await cookies()).get("vibewear-locale")?.value === "lt" ? "lt" : "en";
  return (
    <html data-theme="light" data-visual-variant="a" lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${syne.variable} ${plex.variable}`}>
        <div className="shell">
          <Suspense fallback={<div className="header-skeleton" aria-hidden="true" />}><SiteHeader /></Suspense>
          <LoadingMascotProvider locale={locale}>
            <main className="main" id="main-content">{children}</main>
          </LoadingMascotProvider>
          <Suspense fallback={null}><SiteFooter /></Suspense>
        </div>
      </body>
    </html>
  );
}
