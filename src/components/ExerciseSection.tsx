"use client";

import { useState } from "react";
import {
  Exercises,
  Language,
  JLPTLevel,
  MCQQuestion as MCQQuestionType,
  TranslationParagraph,
  CorrectionFeedback,
  ExerciseResult,
  SRSItemType,
} from "@/lib/types";
import { ui } from "@/lib/languages";
import { correctTranslation } from "@/lib/claude-client";

function MCQQuestion({
  question,
  choices,
  correctIndex,
  lang,
  onAnswer,
}: {
  question: string;
  choices: [string, string, string, string];
  correctIndex: number;
  lang: Language;
  onAnswer?: (correct: boolean) => void;
}) {
  const t = ui[lang];
  const [selected, setSelected] = useState<number | null>(null);

  function handleSelect(i: number) {
    if (selected !== null) return;
    setSelected(i);
    onAnswer?.(i === correctIndex);
  }

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
              onClick={() => handleSelect(i)}
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

function TranslationExercise({
  exercise,
  lang,
  level,
  apiKey,
  onResult,
}: {
  exercise: TranslationParagraph;
  lang: Language;
  level: JLPTLevel;
  apiKey: string;
  onResult?: (score: number) => void;
}) {
  const t = ui[lang];
  const [userText, setUserText] = useState("");
  const [feedback, setFeedback] = useState<CorrectionFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCorrect() {
    if (!userText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const result = await correctTranslation(apiKey, lang, level, exercise.prompt, userText);
      setFeedback(result);
      onResult?.(result.overallScore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 py-4 rounded-lg bg-kurodo-deep/50 border border-white/5">
      <p className="text-white font-medium mb-2">{exercise.prompt}</p>
      <p className="text-kurodo-muted text-xs mb-4">{t.writeTranslation}</p>

      <textarea
        value={userText}
        onChange={(e) => setUserText(e.target.value)}
        placeholder={t.yourTranslation}
        rows={5}
        className="w-full bg-kurodo-card border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-kurodo-red/50 resize-none"
      />

      <button
        onClick={handleCorrect}
        disabled={loading || !userText.trim()}
        className="mt-3 w-full py-3 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-40"
        style={{
          background: loading
            ? "linear-gradient(135deg, #1A1A2E, #16162A)"
            : "linear-gradient(135deg, #C41E3A, #8B0000)",
        }}
      >
        {loading ? t.correcting : t.correctMe}
      </button>

      {error && (
        <p className="mt-2 text-red-400 text-xs">{error}</p>
      )}

      {feedback && (
        <div className="mt-4 space-y-3 animate-fade-in">
          {/* Score */}
          <div className="flex items-center gap-3">
            <span className="text-kurodo-muted text-sm">{t.score}:</span>
            <span
              className={`text-lg font-bold ${
                feedback.overallScore >= 8
                  ? "text-green-400"
                  : feedback.overallScore >= 5
                    ? "text-kurodo-gold"
                    : "text-red-400"
              }`}
            >
              {feedback.overallScore}/10
            </span>
          </div>

          {/* Feedback */}
          <p className="text-white/80 text-sm leading-relaxed">
            {feedback.feedback}
          </p>

          {/* Corrected version */}
          <div className="px-3 py-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <p className="text-xs text-green-400/60 mb-1">
              {t.correctedVersion}
            </p>
            <p className="text-green-400 text-sm">{feedback.correctedText}</p>
          </div>

          {/* Detail corrections */}
          {feedback.details.length > 0 && (
            <div>
              <p className="text-xs text-kurodo-muted uppercase tracking-wider mb-2">
                {t.corrections}
              </p>
              <div className="space-y-2">
                {feedback.details.map((d, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-lg bg-kurodo-card border border-white/5 text-sm"
                  >
                    <div className="flex gap-2 items-start">
                      <span className="text-red-400 line-through">
                        {d.original}
                      </span>
                      <span className="text-white/30">→</span>
                      <span className="text-green-400">{d.correction}</span>
                    </div>
                    <p className="text-kurodo-muted text-xs mt-1">
                      {d.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MCQExerciseList({
  questions,
  lang,
  label,
  exerciseType,
  onExerciseResult,
}: {
  questions: MCQQuestionType[];
  lang: Language;
  label: string;
  exerciseType: SRSItemType;
  onExerciseResult?: (result: ExerciseResult) => void;
}) {
  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <div key={i}>
          <p className="text-xs text-kurodo-muted mb-1">
            {label} {i + 1}
          </p>
          <MCQQuestion
            question={q.question}
            choices={q.choices}
            correctIndex={q.correctIndex}
            lang={lang}
            onAnswer={(correct) =>
              onExerciseResult?.({
                itemId: `${exerciseType}:${q.question}`,
                type: exerciseType,
                correct,
                label: q.question,
              })
            }
          />
        </div>
      ))}
    </div>
  );
}

const tabKeys = [
  "fillInTheBlank",
  "jpToLang",
  "langToJp",
  "kanjiMeaning",
] as const;

const tabSRSTypes: Record<(typeof tabKeys)[number], SRSItemType> = {
  fillInTheBlank: "grammar",
  jpToLang: "vocabulary",
  langToJp: "grammar",
  kanjiMeaning: "kanji",
};

export function ExerciseSection({
  exercises,
  lang,
  level,
  apiKey,
  onExerciseResult,
}: {
  exercises: Exercises;
  lang: Language;
  level: JLPTLevel;
  apiKey: string;
  onExerciseResult?: (result: ExerciseResult) => void;
}) {
  const t = ui[lang];
  const [activeTab, setActiveTab] = useState(0);

  const tabLabels = [t.fillInBlank, t.jpToLang, t.langToJp, t.kanjiMeaning];
  const currentKey = tabKeys[activeTab];

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold text-kurodo-gold mb-4 flex items-center gap-2">
        <span className="text-kurodo-red">練</span> {t.exercises}
      </h2>

      <div className="flex gap-1 mb-4 overflow-x-auto pb-2 -mx-1 px-1">
        {tabLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              i === activeTab
                ? "bg-kurodo-red text-white"
                : "bg-kurodo-card text-kurodo-muted hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        {currentKey === "langToJp" ? (
          <TranslationExercise
            key={`langToJp-${exercises.langToJp.prompt}`}
            exercise={exercises.langToJp}
            lang={lang}
            level={level}
            apiKey={apiKey}
            onResult={(score) =>
              onExerciseResult?.({
                itemId: `grammar:${exercises.langToJp.prompt.slice(0, 60)}`,
                type: "grammar",
                correct: score >= 7,
                label: exercises.langToJp.prompt.slice(0, 40),
              })
            }
          />
        ) : (
          <MCQExerciseList
            key={currentKey}
            questions={exercises[currentKey]}
            lang={lang}
            label={t.exercise}
            exerciseType={tabSRSTypes[currentKey]}
            onExerciseResult={onExerciseResult}
          />
        )}
      </div>
    </div>
  );
}
