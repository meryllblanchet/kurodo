"use client";

import { useState } from "react";
import { Language, JLPTLevel, ReadingPassage, MCQQuestion as MCQQuestionType } from "@/lib/types";
import { ui } from "@/lib/languages";
import { generateReadingPassage } from "@/lib/claude-client";

function MCQQuestion({
  question,
  choices,
  correctIndex,
  lang,
}: {
  question: string;
  choices: [string, string, string, string];
  correctIndex: number;
  lang: Language;
}) {
  const t = ui[lang];
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="px-4 py-4 rounded-lg bg-kurodo-deep/50 border border-white/5">
      <p className="text-white font-medium mb-3">{question}</p>
      <div className="grid grid-cols-1 gap-2">
        {choices.map((choice, i) => {
          let style =
            "px-4 py-3 rounded-lg border text-left transition-all duration-200 text-sm ";
          if (selected === null) {
            style +=
              "border-white/10 text-white/80 hover:border-kurodo-red/40 hover:bg-kurodo-ink active:bg-kurodo-ink";
          } else if (i === correctIndex) {
            style += "border-green-500/50 bg-green-500/10 text-green-400";
          } else if (i === selected) {
            style += "border-red-500/50 bg-red-500/10 text-red-400";
          } else {
            style += "border-white/5 text-white/30";
          }

          return (
            <button
              key={i}
              onClick={() => selected === null && setSelected(i)}
              className={style}
            >
              {choice}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <p
          className={`mt-2 text-sm font-medium ${selected === correctIndex ? "text-green-400" : "text-red-400"}`}
        >
          {selected === correctIndex ? t.correct : t.incorrect}
        </p>
      )}
    </div>
  );
}

export function ReadingSection({
  lang,
  level,
  apiKey,
}: {
  lang: Language;
  level: JLPTLevel;
  apiKey: string;
}) {
  const t = ui[lang];
  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFurigana, setShowFurigana] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setPassage(null);

    try {
      const result = await generateReadingPassage(apiKey, lang, level);
      setPassage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !apiKey}
        className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 mb-8 relative overflow-hidden disabled:opacity-70"
        style={{
          background: loading
            ? "linear-gradient(135deg, #1A1A2E, #16162A)"
            : "linear-gradient(135deg, #C41E3A, #8B0000)",
        }}
      >
        {loading ? (
          <span className="animate-pulse-slow">{t.generatingReading}</span>
        ) : (
          t.generateReading
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {t.error}
          <p className="text-red-400/60 text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Passage */}
      {passage && (
        <div className="space-y-6 animate-fade-in">
          {/* Title */}
          <h2 className="text-lg font-bold text-kurodo-gold flex items-center gap-2">
            <span className="text-kurodo-red">読</span> {passage.title}
          </h2>

          {/* Passage text */}
          <div className="px-5 py-5 rounded-xl bg-kurodo-card border border-white/5">
            <p className="text-white leading-relaxed text-base whitespace-pre-line">
              {showFurigana ? passage.passageReading : passage.passage}
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                showFurigana
                  ? "bg-kurodo-red text-white"
                  : "bg-kurodo-card border border-white/5 text-kurodo-muted hover:text-white"
              }`}
            >
              {showFurigana ? t.hideFurigana : t.showFurigana}
            </button>
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                showTranslation
                  ? "bg-kurodo-red text-white"
                  : "bg-kurodo-card border border-white/5 text-kurodo-muted hover:text-white"
              }`}
            >
              {showTranslation ? t.hideTranslation : t.showTranslation}
            </button>
          </div>

          {/* Translation */}
          {showTranslation && (
            <div className="px-4 py-4 rounded-xl bg-kurodo-deep/50 border border-white/5 animate-fade-in">
              <p className="text-white/80 text-sm leading-relaxed">
                {passage.translation}
              </p>
            </div>
          )}

          {/* Vocabulary */}
          <div>
            <h3 className="text-sm font-semibold text-kurodo-muted uppercase tracking-wider mb-3">
              {t.keyVocabulary}
            </h3>
            <div className="space-y-2">
              {passage.vocabulary.map((v, i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between px-4 py-3 rounded-lg bg-kurodo-deep/50 border border-white/5"
                >
                  <div>
                    <span className="text-white font-medium">{v.word}</span>
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

          {/* Comprehension questions */}
          <div>
            <h3 className="text-sm font-semibold text-kurodo-muted uppercase tracking-wider mb-3">
              {t.comprehension}
            </h3>
            <div className="space-y-3">
              {passage.questions.map((q, i) => (
                <MCQQuestion
                  key={i}
                  question={q.question}
                  choices={q.choices}
                  correctIndex={q.correctIndex}
                  lang={lang}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
