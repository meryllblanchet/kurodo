"use client";

import { useState, useRef } from "react";
import { Language, ListeningPassage } from "@/lib/types";
import { ui } from "@/lib/languages";

const SPEED_OPTIONS = [
  { key: "slow", rate: 0.3, pause: 1500 },
  { key: "normal", rate: 0.7, pause: 600 },
  { key: "fast", rate: 1.5, pause: 0 },
] as const;

type SpeedKey = (typeof SPEED_OPTIONS)[number]["key"];

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

function getJapaneseVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.startsWith("ja") && v.localService) ||
    voices.find((v) => v.lang.startsWith("ja"))
  );
}

export function ListeningSection({
  listening,
  lang,
}: {
  listening: ListeningPassage;
  lang: Language;
}) {
  const t = ui[lang];
  const [showTranscript, setShowTranscript] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [speed, setSpeed] = useState<SpeedKey>("normal");
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const speedLabels: Record<SpeedKey, string> = {
    slow: t.slow,
    normal: t.normal,
    fast: t.fast,
  };

  const cancelledRef = useRef(false);
  const pausedRef = useRef(false);
  const nextLineRef = useRef(0);

  function getSpeedConfig() {
    return SPEED_OPTIONS.find((s) => s.key === speedRef.current)!;
  }

  function speakOne(text: string, onEnd?: () => void) {
    const cfg = getSpeedConfig();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ja-JP";
    const voice = getJapaneseVoice();
    if (voice) utt.voice = voice;
    utt.rate = cfg.rate;
    utt.onend = () => {
      if (onEnd && !cancelledRef.current) {
        const delay = cfg.pause;
        if (delay > 0) {
          setTimeout(onEnd, delay);
        } else {
          onEnd();
        }
      }
    };
    utt.onerror = () => {
      setIsPlaying(false);
      setCurrentLine(-1);
    };
    window.speechSynthesis.speak(utt);
  }

  function speakFrom(index: number) {
    if (index >= listening.dialogue.length || cancelledRef.current) {
      setIsPlaying(false);
      setCurrentLine(-1);
      nextLineRef.current = 0;
      return;
    }

    setCurrentLine(index);
    nextLineRef.current = index + 1;
    speakOne(listening.dialogue[index].japanese, () => {
      speakFrom(index + 1);
    });
  }

  function pause() {
    cancelledRef.current = true;
    pausedRef.current = true;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }

  function play() {
    if (isPlaying) {
      pause();
      return;
    }

    cancelledRef.current = false;
    window.speechSynthesis.cancel();
    setIsPlaying(true);

    const resumeFrom = pausedRef.current ? nextLineRef.current : 0;
    pausedRef.current = false;

    speakFrom(resumeFrom);
  }

  function replayLine(index: number) {
    cancelledRef.current = false;
    pausedRef.current = false;
    window.speechSynthesis.cancel();
    setIsPlaying(true);
    setCurrentLine(index);
    nextLineRef.current = index + 1;
    speakOne(listening.dialogue[index].japanese, () => {
      setIsPlaying(false);
      setCurrentLine(-1);
    });
  }

  return (
    <div className="animate-fade-in space-y-5">
      {/* Title */}
      <h2 className="text-lg font-bold text-kurodo-gold flex items-center gap-2">
        <span className="text-kurodo-red">聴</span> {listening.title}
      </h2>

      {/* Situation */}
      <p className="text-kurodo-muted text-sm italic">{listening.situation}</p>

      {/* Speed selector */}
      <div className="flex items-center gap-1 rounded-xl bg-kurodo-card border border-white/5 p-1">
        {SPEED_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSpeed(opt.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              speed === opt.key
                ? "bg-kurodo-red text-white"
                : "text-kurodo-muted hover:text-white"
            }`}
          >
            {speedLabels[opt.key]}
          </button>
        ))}
      </div>

      {/* Play button */}
      <button
        onClick={play}
        className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 ${
          isPlaying
            ? "bg-kurodo-card border border-kurodo-red/40 text-kurodo-red"
            : "text-white"
        }`}
        style={
          isPlaying
            ? undefined
            : { background: "linear-gradient(135deg, #C41E3A, #8B0000)" }
        }
      >
        {isPlaying ? (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
            {t.pauseAudio}
          </>
        ) : (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            {t.playAudio}
          </>
        )}
      </button>

      {/* Transcript / Translation toggles */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
            showTranscript
              ? "bg-kurodo-red text-white"
              : "bg-kurodo-card border border-white/5 text-kurodo-muted hover:text-white"
          }`}
        >
          {showTranscript ? t.hideTranscript : t.showTranscript}
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

      {/* Dialogue transcript */}
      {showTranscript && (
        <div className="px-5 py-4 rounded-xl bg-kurodo-card border border-white/5 space-y-3 animate-fade-in">
          {listening.dialogue.map((line, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 transition-all duration-300 ${
                currentLine === i
                  ? "border-l-2 border-kurodo-red pl-3"
                  : "pl-4"
              }`}
            >
              <div className="flex-1">
                <span className="text-kurodo-gold text-xs font-medium">
                  {line.speaker}
                </span>
                <p className="text-white text-sm leading-relaxed">
                  {line.japanese}
                </p>
                <p className="text-kurodo-muted text-xs">{line.reading}</p>
              </div>
              <button
                onClick={() => replayLine(i)}
                className="mt-1 shrink-0 w-7 h-7 rounded-full bg-kurodo-deep/50 border border-white/10 hover:border-kurodo-red/40 flex items-center justify-center transition-all duration-200 text-kurodo-muted hover:text-white"
                title={t.replayLine}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Translation */}
      {showTranslation && (
        <div className="px-4 py-4 rounded-xl bg-kurodo-deep/50 border border-white/5 animate-fade-in">
          <p className="text-white/80 text-sm leading-relaxed">
            {listening.translation}
          </p>
        </div>
      )}

      {/* Vocabulary */}
      <div>
        <h3 className="text-sm font-semibold text-kurodo-muted uppercase tracking-wider mb-3">
          {t.keyVocabulary}
        </h3>
        <div className="space-y-2">
          {listening.vocabulary.map((v, i) => (
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
          {listening.questions.map((q, i) => (
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
