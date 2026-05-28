import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fashion Aggregator",
  description:
    "Visual fashion discovery MVP built around approved affiliate product feeds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="site-header">
            <Link className="brand" href="/">
              Fashion Aggregator
            </Link>
            <nav className="nav" aria-label="Main navigation">
              <Link href="/search">Search</Link>
              <Link href="/stores">Stores</Link>
              <Link href="/how-it-works">How it works</Link>
              <Link href="/data-sources">Data sources</Link>
              <Link href="/contact">Contact</Link>
            </nav>
          </header>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}

