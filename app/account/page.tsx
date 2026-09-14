import { redirect } from "next/navigation";
import { getLocale, type SearchParamsInput, withLocale } from "@/lib/i18n";

type AccountPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const locale = getLocale(await searchParams);
  redirect(withLocale("/saved", locale));
}
