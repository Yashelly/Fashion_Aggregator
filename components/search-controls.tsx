"use client";

import { Check, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useId, useRef, useState, useTransition, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SearchForm } from "@/components/search-form";
import { OptionPicker } from "@/components/option-picker";
import { containDialogFocus } from "@/lib/dialog-focus";
import { formatAvailabilityLabel, getCopy, type Locale } from "@/lib/i18n";
import { clearFilterValues, FILTER_KEYS, searchHref, validPriceRange, type SearchValues } from "@/lib/search-params";
import { useLocaleContext } from "@/lib/use-client-locale";

type Option = { value: string; label: string };
type Density = 3 | 4 | 5;
type Props = {
  locale: Locale; params: SearchValues; categories: Option[]; colors: Option[]; departments: Option[]; sizes: Option[];
  stores: Option[]; count: number; title: string; children: ReactNode;
};

const densityStorageKey = "weft-catalog-columns";
// Match the relative CSS breakpoints, including a user's default font size.
const compactQuery = "(max-width: 56.25em)";
const phoneQuery = "(max-width: 43.75em)";
let volatileDensity: Density = 4;
const isDensity = (value: unknown): value is Density => value === 3 || value === 4 || value === 5;

export function SearchControls({ params, categories, colors, departments, sizes, stores, count, title, children }: Props) {
  const { locale: clientLocale, getNavigationLocale } = useLocaleContext();
  const currentCopy = getCopy(clientLocale);
  const t = currentCopy.frontend, old = currentCopy.search, storeHeading = currentCopy.header.nav.stores;
  const router = useRouter(), dialog = useRef<HTMLDialogElement>(null), catalogBody = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null), previousOverflow = useRef(""), isOpen = useRef(false);
  const id = useId();
  const [draft, setDraft] = useState(params), [error, setError] = useState(false), [pending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false), [filtersVisible, setFiltersVisible] = useState(true), [compact, setCompact] = useState(false);
  const [enhancedFilters, setEnhancedFilters] = useState(false);
  const [preferredDensity, setPreferredDensity] = useState<Density>(4), [actualDensity, setActualDensity] = useState(4), [maximumDensity, setMaximumDensity] = useState(5);
  const filterCount = FILTER_KEYS.filter((key) => Boolean(params[key])).length;
  const dirty = FILTER_KEYS.some((key) => (draft[key] ?? "") !== (params[key] ?? ""));

  useEffect(() => {
    let stored: Density | undefined;
    try { const value = Number(window.localStorage.getItem(densityStorageKey)); if (isDensity(value)) stored = value; } catch { /* in-memory fallback */ }
    const initial = stored ?? volatileDensity;
    volatileDensity = initial;
    setPreferredDensity(initial);
  }, []);

  // Native disclosure/GET is the baseline, including browsers without dialog support.
  useEffect(() => { setEnhancedFilters(typeof dialog.current?.showModal === "function"); }, []);

  useEffect(() => {
    const element = catalogBody.current;
    if (!element) return;
    const calculate = () => {
      const isCompact = window.matchMedia(compactQuery).matches;
      setCompact(isCompact);
      if (window.matchMedia(phoneQuery).matches) { setMaximumDensity(3); return setActualDensity(2); }
      if (isCompact) { setMaximumDensity(3); return setActualDensity(3); }
      // Keep the same readable text-to-tile proportion when the UI scales up.
      const minimumTile = 12.625 * parseFloat(getComputedStyle(document.documentElement).fontSize);
      const maximum = Math.max(3, Math.min(5, Math.floor((element.clientWidth + 2) / (minimumTile + 2))));
      setMaximumDensity(maximum);
      setActualDensity(Math.min(preferredDensity, maximum));
    };
    calculate();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(calculate);
    observer?.observe(element);
    window.addEventListener("resize", calculate);
    return () => { observer?.disconnect(); window.removeEventListener("resize", calculate); };
  }, [preferredDensity, filtersVisible]);

  useEffect(() => () => { if (isOpen.current) document.body.style.overflow = previousOverflow.current; }, []);

  const withLocaleIntent = (values: SearchValues) => ({ ...values, lang: getNavigationLocale(), page: undefined });
  const setValue = (name: string, value: string) => setDraft((current) => ({ ...current, [name]: value || undefined }));
  const resetDraft = () => { setDraft(clearFilterValues(draft)); setError(false); };
  const cancelDraft = () => { setDraft({ ...params, lang: clientLocale === "lt" ? "lt" : undefined }); setError(false); };

  function openDialog(event: React.MouseEvent<HTMLElement>) {
    if (!dialog.current) return;
    dialog.current.showModal();
    event.preventDefault();
    trigger.current = event.currentTarget;
    setDraft({ ...params, lang: clientLocale === "lt" ? "lt" : undefined });
    setError(false); setModalOpen(true);
    previousOverflow.current = document.body.style.overflow;
    isOpen.current = true; document.body.style.overflow = "hidden";
  }

  function toggleFilters(event: React.MouseEvent<HTMLElement>) {
    if (window.matchMedia(compactQuery).matches) { openDialog(event); return; }
    event.preventDefault(); setFiltersVisible((visible) => !visible);
  }
  const closeDialog = () => dialog.current?.close?.();
  function closed() {
    document.body.style.overflow = previousOverflow.current; isOpen.current = false; setModalOpen(false);
    setDraft({ ...params, lang: clientLocale === "lt" ? "lt" : undefined });
    trigger.current?.focus(); setError(false);
  }

  function choiceField(name: string, label: string, options: Option[], all: string) {
    return <fieldset className="filter-choices"><legend className="sr-only">{label}</legend>
      {[{ value: "", label: all }, ...options].map((option) => <label className="filter-choice" key={option.value}>
        <input className="sr-only" type="radio" name={name} value={option.value} checked={(draft[name] ?? "") === option.value}
          onChange={(event) => setValue(name, event.target.value)} />
        <span>{option.label}</span><Check aria-hidden="true" size={15} />
      </label>)}
    </fieldset>;
  }
  function multipleChoiceField(name: "color" | "size" | "store", label: string, options: Option[]) {
    const selected = new Set(draft[name]?.split(",").filter(Boolean));
    return <fieldset className="store-options"><legend className="sr-only">{label}</legend>{options.map((option) => <label key={option.value}>
      <input type="checkbox" name={name} value={option.value} checked={selected.has(option.value)} onChange={(event) => {
        const next = new Set(selected); if (event.target.checked) next.add(option.value); else next.delete(option.value);
        setValue(name, [...next].sort().join(",")); }} /><span>{option.label}</span></label>)}</fieldset>;
  }
  function filterGroup(label: string, content: ReactNode, open = false) {
    return <details className="filter-group" open={open || undefined}><summary>{label}</summary>
      <div className="filter-group-body">{content}</div></details>;
  }
  function fields(prefix: string) {
    return <div className="filter-groups">
      {filterGroup(t.currentPrice, <fieldset className="budget-fields"><legend className="sr-only">{t.budget}</legend><div className="price-fields">
        {["minPrice", "maxPrice"].map((name) => <label className="filter-field" key={name}><span>{name === "minPrice" ? t.priceFrom : t.priceTo}</span>
          <input id={`${prefix}-${name}`} name={name} inputMode="decimal" value={draft[name] ?? ""} aria-invalid={error || undefined}
            aria-describedby={error ? `${prefix}-error` : `${prefix}-hint`} maxLength={9}
            onChange={(event) => { setValue(name, event.target.value); setError(false); }} /></label>)}</div>
        <p className="field-hint" id={`${prefix}-hint`}>{t.priceHint}</p>{error && <p className="field-error" id={`${prefix}-error`} role="alert">{t.priceError}</p>}
      </fieldset>, true)}
      {filterGroup(t.category, choiceField("category", t.category, categories, old.options.allCategories))}
      {filterGroup(storeHeading, multipleChoiceField("store", storeHeading, stores))}
      {filterGroup(t.department, choiceField("department", t.department, departments, old.options.allDepartments))}
      {filterGroup(t.colour, multipleChoiceField("color", t.colour, colors))}
      {filterGroup(t.size, multipleChoiceField("size", t.size, sizes))}
      {filterGroup(t.status, choiceField("status", t.status, ["in_stock", "limited", "out_of_stock", "unknown"].map((value) =>
        ({ value, label: formatAvailabilityLabel(value, clientLocale) })), old.options.allItems))}
      {filterGroup(t.saleOnly, <label className="filter-choice"><input type="checkbox" name="sale" value="on" checked={draft.sale === "on"}
        onChange={(event) => setValue("sale", event.target.checked ? "on" : "")} /><span>{t.saleOnly}</span><Check aria-hidden="true" size={15} /></label>)}
    </div>;
  }

  function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validPriceRange(draft.minPrice, draft.maxPrice)) {
      setError(true); event.currentTarget.querySelector<HTMLInputElement>('[name="minPrice"]')?.focus(); return;
    }
    const href = searchHref(withLocaleIntent(draft));
    closeDialog(); startTransition(() => router.push(href, { scroll: false }));
  }
  function setDensity(value: number) {
    if (!isDensity(value)) return;
    volatileDensity = value; setPreferredDensity(value);
    try { window.localStorage.setItem(densityStorageKey, String(value)); } catch { /* in-memory fallback */ }
  }

  const hiddenValues = Object.entries(params).filter(([key, value]) => value && !FILTER_KEYS.includes(key as typeof FILTER_KEYS[number]) && key !== "page" && key !== "lang");
  const localeField = clientLocale === "lt" ? <input type="hidden" name="lang" value="lt" /> : null;
  const densityStyle = { "--catalog-columns": actualDensity } as CSSProperties;

  return <div className={`catalog-layout${filtersVisible ? "" : " filters-hidden"}`} data-density={actualDensity} aria-busy={pending || undefined}>
    <aside id={`${id}-panel`} className="filter-panel" aria-label={t.filters} hidden={!filtersVisible}>
      <div className="filter-panel-heading"><h2>{t.filters}</h2>{filterCount > 0 && <span>{filterCount}</span>}</div>
      <form action="/search" method="get" onSubmit={apply}>{hiddenValues.map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}{localeField}
        {fields(`${id}-panel`)}{dirty && <div className="filter-panel-actions"><button className="text-link" type="button" onClick={resetDraft}>{t.resetDraft}</button>
          <button className="button secondary" type="button" onClick={cancelDraft}>{t.cancel}</button><button className="button" type="submit">{t.applyFilters}</button></div>}
        <noscript><button className="button" type="submit">{t.applyFilters}</button></noscript></form>
    </aside>
    <div className="catalog-body" ref={catalogBody} style={densityStyle}>
      <div className="catalog-toolbar"><div className="catalog-title"><h1>{title}</h1><p role="status" aria-live="polite" aria-atomic="true">{pending ? t.pending : t.count(count)}</p></div>
        <div className="tool-actions"><button type="button" className="filter-toggle" hidden={!enhancedFilters} onClick={toggleFilters} aria-haspopup={compact ? "dialog" : undefined}
          aria-controls={compact ? `${id}-dialog` : `${id}-panel`} aria-expanded={compact ? modalOpen : filtersVisible}><SlidersHorizontal aria-hidden="true" size={15} />
          <span className="desktop-filter-label">{filtersVisible ? t.hideFilters : t.showFilters}</span><span className="mobile-filter-label">{t.filters}</span>
          {filterCount > 0 && <span className="filter-count">{filterCount}</span>}</button>
          <details className="filter-disclosure" hidden={enhancedFilters}><summary className="filter-fallback-toggle"><SlidersHorizontal aria-hidden="true" size={15} />
            <span>{t.filters}</span></summary>
          <form action="/search" method="get" className="filter-fallback">{hiddenValues.map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}{localeField}
            {fields(`${id}-fallback`)}<button className="button" type="submit">{t.applyFilters}</button></form></details>
          <OptionPicker className="density-view" label={t.view} showLabel value={String(actualDensity)}
            onChange={(value) => setDensity(Number(value))} options={[3, 4, 5].map((value) => ({ value: String(value), label: String(value),
              optionLabel: t.columns(value), disabled: value > maximumDensity }))} />
          <noscript><style>{".density-view { display: none; }"}</style></noscript>
          <SearchForm action="/search" className="sort-form">{Object.entries(params).map(([key, value]) => value && key !== "sort" && key !== "page" && key !== "lang" &&
            <input key={key} type="hidden" name={key} value={value} />)}{localeField}
            <OptionPicker label={t.sort} name="sort" value={params.sort ?? ""} options={[
              { value: "", label: params.query ? t.relevance : t.recommended },
              ...(params.query ? [{ value: "available", label: t.availableFirst }] : []),
              { value: "price-low", label: t.priceLow }, { value: "price-high", label: t.priceHigh }, { value: "sale", label: t.sale },
            ]} />
          </SearchForm></div></div>
      {children}
    </div>
    <dialog id={`${id}-dialog`} ref={dialog} className="filter-dialog" aria-labelledby={`${id}-title`} onClose={closed} onKeyDown={containDialogFocus}
      onClick={(event) => { if (event.currentTarget === event.target) closeDialog(); }}><form action="/search" method="get" onSubmit={apply}>
      {hiddenValues.map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}{localeField}
      <header className="filter-dialog-head"><h2 id={`${id}-title`}>{t.filters}</h2><button type="button" className="icon-button" onClick={closeDialog} aria-label={t.close}><X aria-hidden="true" size={20} /></button></header>
      <div className="filter-dialog-body">{fields(`${id}-dialog`)}</div><footer className="filter-dialog-actions"><button className="text-link" type="button" onClick={resetDraft}>{t.resetDraft}</button>
        <button className="button secondary" type="button" onClick={closeDialog}>{t.cancel}</button><button className="button" type="submit">{t.applyFilters}</button></footer>
    </form></dialog>
  </div>;
}
