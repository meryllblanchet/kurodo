"use client";

import { useState } from "react";
import { Language, ReadingPassage } from "@/lib/types";
import { ui } from "@/lib/languages";

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
  reading,
  lang,
}: {
  reading: ReadingPassage;
  lang: Language;
}) {
  const t = ui[lang];
  const [showFurigana, setShowFurigana] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <div className="animate-fade-in space-y-5">
      {/* Title */}
      <h2 className="text-lg font-bold text-kurodo-gold flex items-center gap-2">
        <span className="text-kurodo-red">読</span> {reading.title}
      </h2>

      {/* Passage text */}
      <div className="px-5 py-5 rounded-xl bg-kurodo-card border border-white/5">
        <p className="text-white leading-relaxed text-base whitespace-pre-line">
          {showFurigana ? reading.passageReading : reading.passage}
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
            {reading.translation}
          </p>
        </div>
      )}

      {/* Vocabulary */}
      <div>
        <h3 className="text-sm font-semibold text-kurodo-muted uppercase tracking-wider mb-3">
          {t.keyVocabulary}
        </h3>
        <div className="space-y-2">
          {reading.vocabulary.map((v, i) => (
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
          {reading.questions.map((q, i) => (
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
  );
}
