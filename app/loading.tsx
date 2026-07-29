import { cookies } from "next/headers";
import { RouteLoadingFallback } from "@/components/loading-mascot";

export default async function Loading() {
  const locale = (await cookies()).get("vibewear-locale")?.value === "lt" ? "lt" : "en";
  return <RouteLoadingFallback label={locale === "lt" ? "Kraunama…" : "Loading…"} />;
}
