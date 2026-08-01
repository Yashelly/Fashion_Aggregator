import type { Metadata } from "next";
import { AccountDashboard } from "@/components/account-dashboard";
import { getLocale, type SearchParamsInput } from "@/lib/i18n";

type AccountPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export const metadata: Metadata = {
  title: "Account — Weft",
  description: "Your Weft preferences, sizes, saved items, and settings.",
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const locale = getLocale(await searchParams);

  return (
    <div className="route-shell">
      <header className="route-heading">
        <div>
          <h1>{locale === "lt" ? "Mano paskyra" : "My account"}</h1>
          <p className="lead">
            {locale === "lt"
              ? "Jūsų stilius, dydžiai ir paieškos nustatymai vienoje vietoje."
              : "Your style, sizes, and discovery preferences in one place."}
          </p>
        </div>
      </header>
      <AccountDashboard locale={locale} />
    </div>
  );
}
