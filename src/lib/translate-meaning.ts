import { Language } from "./types";
import { kanjiTranslations } from "./kanji-translations";

export function translateMeaning(meaning: string, lang: Language): string {
  if (lang === "en") return meaning;
  return kanjiTranslations[meaning]?.[lang] || meaning;
}

export function translateMeanings(meanings: string[], lang: Language): string[] {
  if (lang === "en") return meanings;
  return meanings.map((m) => translateMeaning(m, lang));
}
