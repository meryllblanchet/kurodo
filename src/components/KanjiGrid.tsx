"use client";

import { useState, useMemo } from "react";
import { Language, JLPTLevel } from "@/lib/types";
import { ui } from "@/lib/languages";
import { jlptKanji, KanjiEntry } from "@/lib/kanji-data";
import { translateMeanings } from "@/lib/translate-meaning";
import { KanjiDetailModal } from "./KanjiDetailModal";

export function KanjiGrid({
  lang,
  level,
  apiKey,
}: {
  lang: Language;
  level: JLPTLevel;
  apiKey: string;
}) {
  const t = ui[lang];
  const [selectedEntry, setSelectedEntry] = useState<KanjiEntry | null>(null);
  const [search, setSearch] = useState("");

  const kanjiList = jlptKanji[level] || [];

  const filtered = useMemo(() => {
    if (!search.trim()) return kanjiList;
    const q = search.trim().toLowerCase();
    return kanjiList.filter(
      (entry) =>
        entry.k === q ||
        entry.on.some((r) => r.includes(q)) ||
        entry.kun.some((r) => r.includes(q)) ||
        entry.m.some((m) => m.toLowerCase().includes(q)) ||
        translateMeanings(entry.m, lang).some((m) => m.toLowerCase().includes(q)),
    );
  }, [kanjiList, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-kurodo-gold flex items-center gap-2">
          <span className="text-kurodo-red">字</span> {t.kanjiList}
        </h2>
        <span className="text-kurodo-muted text-sm">
          {filtered.length} {t.kanji}
        </span>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t.searchKanji}
        className="w-full mb-4 px-4 py-3 rounded-xl bg-kurodo-card border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-kurodo-red/50"
      />

      <div className="grid grid-cols-6 gap-2">
        {filtered.map((entry) => (
          <button
            key={entry.k}
            onClick={() => setSelectedEntry(entry)}
            className="aspect-square flex items-center justify-center rounded-lg bg-kurodo-card border border-white/5 text-white text-xl font-medium hover:border-kurodo-red/40 hover:bg-kurodo-ink transition-all duration-200 active:scale-95"
          >
            {entry.k}
          </button>
        ))}
      </div>

      {filtered.length === 0 && search.trim() && (
        <p className="text-kurodo-muted text-sm text-center mt-6">
          {t.noResults}
        </p>
      )}

      {selectedEntry && (
        <KanjiDetailModal
          entry={selectedEntry}
          lang={lang}
          level={level}
          apiKey={apiKey}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
}
