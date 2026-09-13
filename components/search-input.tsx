"use client";

import { ArrowRight, Search, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { getCopy, type Locale } from "@/lib/i18n";

export function SearchInput({ locale, value = "", compact = false }: { locale: Locale; value?: string; compact?: boolean }) {
  const t = getCopy(locale).frontend;
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(value);
  const [committedValue, setCommittedValue] = useState(value);
  if (committedValue !== value) {
    setCommittedValue(value);
    // History/filter navigation updates an untouched field. An older response
    // must not erase text the shopper is already editing for the next search.
    if (query === committedValue) setQuery(value);
  }
  return <div className="search-input-group">
    <label htmlFor={id} className="search-label sr-only">{t.searchLabel}</label>
    <div className="search-input-row">
      <Search size={18} strokeWidth={1.4} aria-hidden="true" className="search-icon" />
      <input ref={input} id={id} name="query" type="search" autoComplete="off" maxLength={500}
        placeholder={compact ? t.shortSearchPlaceholder : t.searchPlaceholder} value={query} onChange={(event) => setQuery(event.target.value)} />
      {query && <button className="query-clear" type="button" aria-label={t.clearSearch}
        onClick={() => { setQuery(""); input.current?.focus(); }}><X aria-hidden="true" size={18} /></button>}
      <button className="search-submit" type="submit" aria-label={t.search}><span className="search-idle">{compact ? <ArrowRight size={18} strokeWidth={1.4} aria-hidden="true" /> : t.search}</span><span className="search-busy" role="status">{t.pending}</span></button>
    </div>
  </div>;
}
