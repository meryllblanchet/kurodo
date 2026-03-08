"use client";

import { KanjiOfTheDay } from "@/lib/types";
import { Language } from "@/lib/types";
import { ui } from "@/lib/languages";

export function KanjiSection({
  kanji,
  lang,
}: {
  kanji: KanjiOfTheDay;
  lang: Language;
}) {
  const t = ui[lang];

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold text-kurodo-gold mb-4 flex items-center gap-2">
        <span className="text-kurodo-red">漢</span> {t.kanjiOfTheDay}
      </h2>

      <div className="text-center mb-6">
        <div className="text-8xl font-bold text-white mb-4">{kanji.kanji}</div>
        <div className="flex justify-center gap-6 text-sm">
          <div>
            <span className="text-kurodo-muted">{t.onyomi}:</span>{" "}
            <span className="text-kurodo-red font-medium">{kanji.onyomi}</span>
          </div>
          <div>
            <span className="text-kurodo-muted">{t.kunyomi}:</span>{" "}
            <span className="text-kurodo-gold font-medium">
              {kanji.kunyomi}
            </span>
          </div>
        </div>
        <div className="mt-2 text-white/80">
          <span className="text-kurodo-muted">{t.meaning}:</span>{" "}
          {kanji.meaning}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-kurodo-muted uppercase tracking-wider mb-3">
          {t.vocabulary}
        </h3>
        <div className="space-y-2">
          {kanji.vocabulary.map((vocab, i) => (
            <div
              key={i}
              className="flex items-baseline justify-between px-4 py-3 rounded-lg bg-kurodo-deep/50 border border-white/5"
            >
              <div>
                <span className="text-white font-medium text-lg">
                  {vocab.word}
                </span>
                <span className="text-kurodo-muted ml-2 text-sm">
                  {vocab.reading}
                </span>
              </div>
              <span className="text-white/70 text-sm">{vocab.meaning}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
