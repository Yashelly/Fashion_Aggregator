import type { Metadata } from "next";
import { IBM_Plex_Sans, Syne } from "next/font/google";
import { Suspense } from "react";
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
    try { savedTheme = localStorage.getItem("vibewear-theme"); } catch {}
    const theme = savedTheme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const cookieMatch = document.cookie.match(/(?:^|; )vibewear-locale=([^;]+)/);
    document.documentElement.lang = cookieMatch && decodeURIComponent(cookieMatch[1]) === "lt" ? "lt" : "en";
  })();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-theme="light" data-visual-variant="a" lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${syne.variable} ${plex.variable}`}>
        <div className="shell">
          <Suspense fallback={<div className="header-skeleton" aria-hidden="true" />}><SiteHeader /></Suspense>
          <main className="main" id="main-content">{children}</main>
          <Suspense fallback={null}><SiteFooter /></Suspense>
        </div>
      </body>
    </html>
  );
}
