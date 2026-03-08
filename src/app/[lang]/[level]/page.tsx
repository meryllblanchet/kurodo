import { Language, JLPTLevel } from "@/lib/types";
import { StudyPageClient } from "./StudyPageClient";

const validLanguages = ["en", "fr", "de", "it", "es", "pt"];
const validLevels = ["n5", "n4", "n3", "n2", "n1"];

export function generateStaticParams() {
  return validLanguages.flatMap((lang) =>
    validLevels.map((level) => ({ lang, level })),
  );
}

export default async function StudyPage({
  params,
}: {
  params: Promise<{ lang: string; level: string }>;
}) {
  const { lang: langParam, level: levelParam } = await params;
  const lang = (
    validLanguages.includes(langParam) ? langParam : "en"
  ) as Language;
  const level = (
    validLevels.includes(levelParam) ? levelParam : "n5"
  ) as JLPTLevel;

  return <StudyPageClient lang={lang} level={level} />;
}
