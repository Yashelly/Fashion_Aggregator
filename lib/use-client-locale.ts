"use client";

import { useEffect, useState } from "react";
import { getLocale, type Locale } from "@/lib/i18n";

export function useClientLocale(): Locale {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLocale(getLocale({ lang: params.get("lang") ?? undefined }));
  }, []);

  return locale;
}
