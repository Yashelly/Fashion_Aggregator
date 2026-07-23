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
            <div className="header-left">
              <Link className="menu-link" href="/stores">
                MENU
              </Link>
              <nav className="department-nav" aria-label="Departments">
                <Link href="/search?gender=woman">WOMAN</Link>
                <Link href="/search?gender=man">MAN</Link>
                <Link href="/search?gender=kids">KIDS</Link>
                <Link href="/search?query=beauty">BEAUTY</Link>
              </nav>
            </div>
            <Link className="brand" href="/">
              VIBEWEAR
            </Link>
            <nav className="nav" aria-label="Main navigation">
              <Link href="/search">SEARCH</Link>
              <Link href="/stores">STORES</Link>
              <Link href="/data-sources">DATA</Link>
              <Link href="/contact">CONTACT</Link>
            </nav>
          </header>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}

