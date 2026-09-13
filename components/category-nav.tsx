import Link from "next/link";
import { formatCategoryLabel, getCopy, type Locale } from "@/lib/i18n";
import { searchHref, type SearchValues } from "@/lib/search-params";

/** Category shortcuts use the same public URL state as the filter form. */
export function CategoryNav({ locale, params = {} }: { locale: Locale; params?: SearchValues }) {
  const t = getCopy(locale).frontend;
  const base = { ...params, lang: locale === "lt" ? "lt" : undefined, page: undefined };
  const links = ["outerwear", "knitwear", "jeans", "bottoms", "dresses", "shoes", "bags"].map((category) => ({
    label: formatCategoryLabel(category, locale),
    href: searchHref(base, { category }),
    active: params.category === category,
  }));
  return <nav className="category-nav" aria-label={t.categoryNav}>
    {links.map(({ label, href, active }) => <Link key={label} href={href} aria-current={active ? "page" : undefined}>{label}</Link>)}
  </nav>;
}
