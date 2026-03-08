"use client";

import { useState, useRef } from "react";
import { Language, SpeakingExercise } from "@/lib/types";
import { ui } from "@/lib/languages";

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

function normalize(text: string): string {
  return text
    .replace(/[\s、。！？「」・\u3000]/g, "")
    .toLowerCase();
}

function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.length === 0 || nb.length === 0) return 0;

  // Simple character match ratio
  let matches = 0;
  const longer = na.length >= nb.length ? na : nb;
  const shorter = na.length < nb.length ? na : nb;

  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }

  return matches / longer.length;
}

function scoreLabel(score: number): { text: string; color: string } {
  if (score >= 0.9) return { text: "Excellent!", color: "text-green-400" };
  if (score >= 0.7) return { text: "Good!", color: "text-green-400" };
  if (score >= 0.5) return { text: "OK", color: "text-kurodo-gold" };
  return { text: "Try again", color: "text-red-400" };
}

function getJapaneseVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.startsWith("ja") && v.localService) ||
    voices.find((v) => v.lang.startsWith("ja"))
  );
}

function SpeakingCard({
  japanese,
  reading,
  meaning,
  lang,
  index,
}: {
  japanese: string;
  reading: string;
  meaning: string;
  lang: Language;
  index: number;
}) {
  const t = ui[lang];
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<{ transcript: string; score: number } | null>(null);
  const [showReading, setShowReading] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);

  function createRecognition() {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    return recognition;
  }

  interface SpeechRecognitionInstance {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    onresult: ((e: SpeechRecognitionEvent) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
  }

  function listenToModel() {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(japanese);
    utt.lang = "ja-JP";
    const voice = getJapaneseVoice();
    if (voice) utt.voice = voice;
    utt.rate = 0.75;
    window.speechSynthesis.speak(utt);
  }

  function startListening() {
    setResult(null);
    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    setIsListening(true);

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      const score = similarity(transcript, japanese);
      setResult({ transcript, score });
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  const hasSpeechRecognition =
    typeof window !== "undefined" &&
    (
      !!(window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      !!(window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );

  return (
    <div className="px-5 py-5 rounded-xl bg-kurodo-card border border-white/5 space-y-4">
      {/* Sentence to read */}
      <div>
        <p className="text-xs text-kurodo-muted mb-1">#{index + 1}</p>
        <p className="text-white text-base font-medium leading-relaxed">{japanese}</p>
        {showReading && (
          <p className="text-kurodo-muted text-sm mt-1">{reading}</p>
        )}
        <p className="text-white/50 text-sm mt-1">{meaning}</p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {/* Listen button */}
        <button
          onClick={listenToModel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-kurodo-deep/50 border border-white/10 hover:border-kurodo-gold/40 text-kurodo-muted hover:text-kurodo-gold transition-all duration-200 text-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          {t.listenFirst}
        </button>

        {/* Furigana toggle */}
        <button
          onClick={() => setShowReading(!showReading)}
          className={`px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
            showReading
              ? "bg-kurodo-red text-white"
              : "bg-kurodo-deep/50 border border-white/10 text-kurodo-muted hover:text-white"
          }`}
        >
          あ
        </button>

        {/* Mic button */}
        {hasSpeechRecognition ? (
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              isListening
                ? "bg-kurodo-red/20 border border-kurodo-red/40 text-kurodo-red animate-pulse"
                : "text-white"
            }`}
            style={
              isListening
                ? undefined
                : { background: "linear-gradient(135deg, #C41E3A, #8B0000)" }
            }
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            {isListening ? t.listening_status : result ? t.tryAgainSpeaking : t.tapToSpeak}
          </button>
        ) : (
          <p className="flex-1 text-kurodo-muted text-xs text-center py-2.5">
            {t.speechNotSupported}
          </p>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="px-4 py-3 rounded-lg bg-kurodo-deep/50 border border-white/5 animate-fade-in space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold ${scoreLabel(result.score).color}`}>
              {scoreLabel(result.score).text}
            </span>
            <span className={`text-lg font-bold ${scoreLabel(result.score).color}`}>
              {Math.round(result.score * 100)}%
            </span>
          </div>
          <div>
            <p className="text-xs text-kurodo-muted mb-0.5">{t.yourTranslation.replace(/japonais|Japanese|Japanisch|giapponese|japonés|japonês/i, "")}</p>
            <p className="text-white/80 text-sm">{result.transcript || "—"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function SpeakingSection({
  speaking,
  lang,
}: {
  speaking: SpeakingExercise;
  lang: Language;
}) {
  const t = ui[lang];

  return (
    <div className="animate-fade-in space-y-5">
      <h2 className="text-lg font-bold text-kurodo-gold flex items-center gap-2">
        <span className="text-kurodo-red">話</span> {t.speaking}
      </h2>

      <div className="space-y-3">
        {speaking.prompts.map((prompt, i) => (
          <SpeakingCard
            key={i}
            japanese={prompt.japanese}
            reading={prompt.reading}
            meaning={prompt.meaning}
            lang={lang}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
