import { ProductGrid } from "@/components/product-grid";
import {
  formatAvailabilityLabel,
  formatCategoryLabel,
  formatColorLabel,
  formatGenderLabel,
  formatStoreName,
  getCopy,
  getLocale,
  normalizeParams,
  type SearchParamsInput,
  withLocale,
} from "@/lib/i18n";
import {
  filterProducts,
  getMockProducts,
  getStoreOptions,
  sortProducts,
} from "@/lib/mock-products";

type SearchPageProps = {
  searchParams: Promise<{
    lang?: string | string[];
    query?: string | string[];
    store?: string | string[];
    category?: string | string[];
    color?: string | string[];
    gender?: string | string[];
    sale?: string | string[];
    availability?: string | string[];
    status?: string | string[];
    sort?: string | string[];
  }>;
};

function unique(values: string[]) {
  return Array.from(new Set(values)).filter(Boolean).sort();
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = normalizeParams((await searchParams) as SearchParamsInput);
  const locale = getLocale(params);
  const t = getCopy(locale).search;
  const products = getMockProducts();
  const results = sortProducts(filterProducts(products, params), params.sort);
  const stores = getStoreOptions(products);
  const categories = unique(products.map((product) => product.category));
  const colors = unique(products.map((product) => product.color));
  const genders = unique(products.map((product) => product.gender));
  const statusValue = params.status ?? (params.sale === "on" ? "sale" : params.availability ?? "");
  const activeFilters = [
    params.query ? { label: `${t.active.search}: ${params.query}`, key: "query" } : null,
    params.gender
      ? { label: `${t.active.department}: ${formatGenderLabel(params.gender, locale)}`, key: "gender" }
      : null,
    params.store
      ? { label: `${t.active.store}: ${formatStoreName(params.store)}`, key: "store" }
      : null,
    params.category
      ? {
          label: `${t.active.category}: ${formatCategoryLabel(params.category, locale)}`,
          key: "category",
        }
      : null,
    params.color
      ? { label: `${t.active.color}: ${formatColorLabel(params.color, locale)}`, key: "color" }
      : null,
    statusValue
      ? {
          label:
            statusValue === "sale"
              ? formatAvailabilityLabel(statusValue, locale)
              : `${t.active.availability}: ${formatAvailabilityLabel(statusValue, locale)}`,
          key: "status",
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; key: string }>;

  function removeFilterUrl(key: string) {
    const nextParams = new URLSearchParams();
    const keysToRemove =
      key === "status" ? new Set(["status", "sale", "availability"]) : new Set([key]);

    Object.entries(params).forEach(([paramKey, value]) => {
      if (!keysToRemove.has(paramKey) && value) nextParams.set(paramKey, value);
    });

    const queryString = nextParams.toString();
    return queryString ? `/search?${queryString}` : "/search";
  }

  return (
    <div className="stack search-stack">
      <div className="search-heading">
        <h1 className="page-title">{t.title}</h1>
        <p className="lead">{t.lead}</p>
      </div>

      <form action="/search" className="search-controls">
        {locale === "lt" ? <input name="lang" type="hidden" value="lt" /> : null}
        <div className="filters">
          <label className="field">
            <span>{t.labels.search}</span>
            <input
              className="input"
              defaultValue={params.query ?? ""}
              name="query"
              placeholder={t.placeholders.search}
            />
          </label>
          <label className="field">
            <span>{t.labels.store}</span>
            <select className="select" defaultValue={params.store ?? ""} name="store">
              <option value="">{t.options.allStores}</option>
              {stores.map((store) => (
                <option key={store.value} value={store.value}>
                  {store.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t.labels.department}</span>
            <select className="select" defaultValue={params.gender ?? ""} name="gender">
              <option value="">{t.options.allDepartments}</option>
              {genders.map((gender) => (
                <option key={gender} value={gender}>
                  {formatGenderLabel(gender, locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t.labels.category}</span>
            <select
              className="select"
              defaultValue={params.category ?? ""}
              name="category"
            >
              <option value="">{t.options.allCategories}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {formatCategoryLabel(category, locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t.labels.color}</span>
            <select className="select" defaultValue={params.color ?? ""} name="color">
              <option value="">{t.options.allColors}</option>
              {colors.map((color) => (
                <option key={color} value={color}>
                  {formatColorLabel(color, locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t.labels.status}</span>
            <select className="select" defaultValue={statusValue} name="status">
              <option value="">{t.options.allItems}</option>
              <option value="in_stock">{formatAvailabilityLabel("in_stock", locale)}</option>
              <option value="limited">{formatAvailabilityLabel("limited", locale)}</option>
              <option value="sale">{formatAvailabilityLabel("sale", locale)}</option>
            </select>
          </label>
          <label className="field">
            <span>{t.labels.sort}</span>
            <select className="select" defaultValue={params.sort ?? ""} name="sort">
              <option value="">{t.options.availableFirst}</option>
              <option value="price-low">{t.options.priceLow}</option>
              <option value="price-high">{t.options.priceHigh}</option>
              <option value="sale">{t.options.bestSale}</option>
            </select>
          </label>
        </div>
        <div className="filter-actions">
          <button className="button" type="submit">
            {t.actions.showResults}
          </button>
          <a className="button secondary" href={withLocale("/search", locale)}>
            {t.actions.clearAll}
          </a>
        </div>
      </form>

      <div className="results-bar">
        <p>{t.resultsFound(results.length)}</p>
        {activeFilters.length > 0 ? (
          <div className="active-filters" aria-label={t.active.aria}>
            {activeFilters.map((filter) => (
              <a className="filter-pill" href={removeFilterUrl(filter.key)} key={filter.key}>
                {filter.label} <span aria-hidden="true">×</span>
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <ProductGrid locale={locale} products={results} />

      <section className="compliance-note" aria-label={t.sourceNoteAria}>
        <p>{t.sourceNote}</p>
      </section>
    </div>
  );
}
