"use client";

import { useState } from "react";
import { Language, JLPTLevel, KanjiVocab } from "@/lib/types";
import { KanjiEntry } from "@/lib/kanji-data";
import { ui } from "@/lib/languages";
import { translateMeanings } from "@/lib/translate-meaning";
import { loadKanjiVocabulary } from "@/lib/claude-client";

export function KanjiDetailModal({
  entry,
  lang,
  level,
  apiKey,
  onClose,
}: {
  entry: KanjiEntry;
  lang: Language;
  level: JLPTLevel;
  apiKey: string;
  onClose: () => void;
}) {
  const t = ui[lang];
  const [vocab, setVocab] = useState<KanjiVocab[] | null>(null);
  const [vocabLoading, setVocabLoading] = useState(false);
  const [vocabError, setVocabError] = useState<string | null>(null);

  async function loadVocabulary() {
    setVocabLoading(true);
    setVocabError(null);

    try {
      const vocabulary = await loadKanjiVocabulary(apiKey, lang, level, entry.k);
      setVocab(vocabulary);
    } catch (err) {
      setVocabError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setVocabLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-2xl bg-kurodo-ink border border-white/10 p-6 animate-fade-in max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-kurodo-muted hover:text-white transition-colors text-xl"
        >
          &times;
        </button>

        {/* Kanji large display */}
        <div className="text-center mb-6">
          <div className="text-8xl font-bold text-white mb-2">{entry.k}</div>
        </div>

        {/* Readings */}
        <div className="flex justify-center gap-6 text-sm mb-3">
          <div>
            <span className="text-kurodo-muted">{t.onyomi}:</span>{" "}
            <span className="text-kurodo-red font-medium">
              {entry.on.join(", ") || "—"}
            </span>
          </div>
          <div>
            <span className="text-kurodo-muted">{t.kunyomi}:</span>{" "}
            <span className="text-kurodo-gold font-medium">
              {entry.kun.join(", ") || "—"}
            </span>
          </div>
        </div>

        {/* Meaning */}
        <div className="text-center mb-2">
          <span className="text-kurodo-muted text-sm">{t.meaning}:</span>{" "}
          <span className="text-white/90">{translateMeanings(entry.m, lang).join(", ")}</span>
        </div>

        {/* Stroke count */}
        <div className="text-center mb-5">
          <span className="text-kurodo-muted text-sm">{t.strokes}:</span>{" "}
          <span className="text-white/70">{entry.s}</span>
        </div>

        {/* Vocabulary section */}
        <div>
          {!vocab && !vocabLoading && (
            <button
              onClick={loadVocabulary}
              className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #C41E3A, #8B0000)",
              }}
            >
              {t.loadVocabulary}
            </button>
          )}

          {vocabLoading && (
            <div className="text-center py-4">
              <span className="text-kurodo-red animate-pulse-slow text-sm">
                {t.loading}
              </span>
            </div>
          )}

          {vocabError && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {t.error}
              <p className="text-red-400/60 text-xs mt-1">{vocabError}</p>
            </div>
          )}

          {vocab && (
            <div className="animate-fade-in">
              <h3 className="text-sm font-semibold text-kurodo-muted uppercase tracking-wider mb-3">
                {t.vocabulary}
              </h3>
              <div className="space-y-2">
                {vocab.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-baseline justify-between px-4 py-3 rounded-lg bg-kurodo-deep/50 border border-white/5"
                  >
                    <div>
                      <span className="text-white font-medium text-lg">
                        {v.word}
                      </span>
                      <span className="text-kurodo-muted ml-2 text-sm">
                        {v.reading}
                      </span>
                    </div>
                    <span className="text-white/70 text-sm ml-2 text-right">
                      {v.meaning}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
