"use client";

import { GrammarOfTheDay } from "@/lib/types";
import { Language } from "@/lib/types";
import { ui } from "@/lib/languages";

export function GrammarSection({
  grammar,
  lang,
}: {
  grammar: GrammarOfTheDay;
  lang: Language;
}) {
  const t = ui[lang];

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold text-kurodo-gold mb-4 flex items-center gap-2">
        <span className="text-kurodo-red">文</span> {t.grammarOfTheDay}
      </h2>

      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">{grammar.title}</h3>
        <div className="px-4 py-3 rounded-lg bg-kurodo-red/10 border border-kurodo-red/20 mb-3">
          <span className="text-sm text-kurodo-muted">{t.structure}:</span>
          <p className="text-kurodo-red font-medium mt-1">
            {grammar.structure}
          </p>
        </div>
        <p className="text-white/80 leading-relaxed">{grammar.explanation}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-kurodo-muted uppercase tracking-wider mb-3">
          {t.examples}
        </h3>
        <div className="space-y-3">
          {grammar.examples.map((ex, i) => (
            <div
              key={i}
              className="px-4 py-3 rounded-lg bg-kurodo-deep/50 border border-white/5"
            >
              <p className="text-white font-medium">{ex.japanese}</p>
              <p className="text-kurodo-muted text-sm mt-1">{ex.reading}</p>
              <p className="text-white/70 text-sm mt-1">{ex.translation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
