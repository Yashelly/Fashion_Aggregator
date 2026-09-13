"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n";

export type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Read at navigation time, before React has rerendered hidden form fields. */
  getNavigationLocale: () => Locale;
};

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocaleContext(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useClientLocale must be used within LocaleProvider");
  }
  return context;
}

export function useClientLocale(): Locale {
  return useLocaleContext().locale;
}
