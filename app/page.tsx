import { CinematicHero } from "@/components/cinematic-hero";
import { getLocale, type SearchParamsInput } from "@/lib/i18n";

type HomePageProps = { searchParams: Promise<SearchParamsInput> };

export default async function HomePage({ searchParams }: HomePageProps) {
  return <CinematicHero locale={getLocale(await searchParams)} />;
}
