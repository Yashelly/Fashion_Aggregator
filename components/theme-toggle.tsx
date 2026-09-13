"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { getCopy, type Locale } from "@/lib/i18n";

/** Theme remains an explicit, browser-local preference, outside the shopping toolbar. */
export function ThemeToggle({ locale }: { locale: Locale }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const sync = () => setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  const t = getCopy(locale).frontend;
  const label = theme === "dark" ? t.lightMode : t.darkMode;
  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    setTheme(next);
    try { localStorage.setItem("weft-theme", next); } catch { /* Applies for this page when storage is blocked. */ }
  }
  return <button className="theme-toggle" type="button" onClick={toggle}>
    {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}<span>{label}</span>
  </button>;
}
