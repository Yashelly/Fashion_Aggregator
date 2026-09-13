import type { Locale } from "@/lib/i18n";

export function formatPrice(amount: string | number, currency: string, locale: Locale) {
  const number = typeof amount === "string" && !amount.trim() ? NaN : Number(amount);
  if (!Number.isFinite(number) || number < 0) return "—";
  try { return new Intl.NumberFormat(locale === "lt" ? "lt-LT" : "en-IE", { style: "currency", currency }).format(number); }
  catch { return `${number.toFixed(2)} ${currency}`; }
}
