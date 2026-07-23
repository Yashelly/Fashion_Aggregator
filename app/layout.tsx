import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIBEWEAR | Fashion Discovery",
  description:
    "Discover fashion from selected stores by mood, item, brand, or occasion. Atrask madą iš atrinktų parduotuvių.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="shell">
          <Suspense fallback={null}>
            <SiteHeader />
          </Suspense>
          <main className="main" id="main-content">
            {children}
          </main>
          <Suspense fallback={null}>
            <SiteFooter />
          </Suspense>
        </div>
      </body>
    </html>
  );
}

