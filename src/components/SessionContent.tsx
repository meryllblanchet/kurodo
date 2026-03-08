"use client";

import { useState } from "react";
import { Language, JLPTLevel, GeneratedContent, SectionKey } from "@/lib/types";
import { ui } from "@/lib/languages";
import { KanjiSection } from "@/components/KanjiSection";
import { GrammarSection } from "@/components/GrammarSection";
import { ExerciseSection } from "@/components/ExerciseSection";
import { ReadingSection } from "@/components/ReadingSection";
import { ListeningSection } from "@/components/ListeningSection";
import { SpeakingSection } from "@/components/SpeakingSection";

const ALL_SECTION_META = [
  { key: "kanji" as const, labelKey: "kanjiOfTheDay" as const, icon: "漢" },
  { key: "grammar" as const, labelKey: "grammarOfTheDay" as const, icon: "文" },
  { key: "exercises" as const, labelKey: "writing" as const, icon: "書" },
  { key: "reading" as const, labelKey: "reading" as const, icon: "読" },
  { key: "listening" as const, labelKey: "listening" as const, icon: "聴" },
  { key: "speaking" as const, labelKey: "speaking" as const, icon: "話" },
];

export function SessionContent({
  data,
  lang,
  level,
  apiKey,
  sections,
}: {
  data: GeneratedContent;
  lang: Language;
  level: JLPTLevel;
  apiKey: string;
  sections: SectionKey[];
}) {
  const t = ui[lang];
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);

  const visibleSections = ALL_SECTION_META.filter((s) => {
    if (!sections.includes(s.key)) return false;
    const d = s.key === "kanji" ? data.kanji
      : s.key === "grammar" ? data.grammar
      : s.key === "exercises" ? data.exercises
      : s.key === "reading" ? data.reading
      : s.key === "listening" ? data.listening
      : s.key === "speaking" ? data.speaking
      : null;
    return !!d;
  });

  return (
    <div className="space-y-3 animate-fade-in">
      {visibleSections.map((section) => (
        <div key={section.key}>
          <button
            onClick={() =>
              setActiveSection(
                activeSection === section.key ? null : section.key,
              )
            }
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-kurodo-card border border-white/5 hover:border-kurodo-red/30 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-kurodo-red text-xl">{section.icon}</span>
              <span className="text-white font-medium">{t[section.labelKey]}</span>
            </div>
            <span
              className={`text-kurodo-muted transition-transform duration-200 ${activeSection === section.key ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>

          {activeSection === section.key && (
            <div className="mt-3 px-1 pb-2">
              {section.key === "kanji" && data.kanji && (
                <KanjiSection kanji={data.kanji} lang={lang} />
              )}
              {section.key === "grammar" && data.grammar && (
                <GrammarSection grammar={data.grammar} lang={lang} />
              )}
              {section.key === "exercises" && data.exercises && (
                <ExerciseSection
                  exercises={data.exercises}
                  lang={lang}
                  level={level}
                  apiKey={apiKey}
                />
              )}
              {section.key === "reading" && data.reading && (
                <ReadingSection reading={data.reading} lang={lang} />
              )}
              {section.key === "listening" && data.listening && (
                <ListeningSection listening={data.listening} lang={lang} />
              )}
              {section.key === "speaking" && data.speaking && (
                <SpeakingSection speaking={data.speaking} lang={lang} />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
