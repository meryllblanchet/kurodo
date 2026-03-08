"use client";

import { useState } from "react";
import { Language, JLPTLevel, SectionKey, ALL_SECTIONS } from "@/lib/types";
import { ui, languages, jlptLevels } from "@/lib/languages";

const SECTION_META: { key: SectionKey; icon: string; labelKey: "kanjiOfTheDay" | "grammarOfTheDay" | "writing" | "reading" | "listening" | "speaking" }[] = [
  { key: "kanji", icon: "漢", labelKey: "kanjiOfTheDay" },
  { key: "grammar", icon: "文", labelKey: "grammarOfTheDay" },
  { key: "exercises", icon: "書", labelKey: "writing" },
  { key: "reading", icon: "読", labelKey: "reading" },
  { key: "listening", icon: "聴", labelKey: "listening" },
  { key: "speaking", icon: "話", labelKey: "speaking" },
];

export function ProfileModal({
  lang,
  level,
  apiKey,
  sections,
  onSave,
  onClose,
  isOnboarding,
}: {
  lang: Language;
  level: JLPTLevel;
  apiKey: string;
  sections: SectionKey[];
  onSave: (lang: Language, level: JLPTLevel, apiKey: string, sections: SectionKey[]) => void;
  onClose?: () => void;
  isOnboarding?: boolean;
}) {
  const [selectedLang, setSelectedLang] = useState<Language>(lang);
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>(level);
  const [selectedApiKey, setSelectedApiKey] = useState(apiKey);
  const [selectedSections, setSelectedSections] = useState<SectionKey[]>(sections);

  const t = ui[selectedLang];

  function toggleSection(key: SectionKey) {
    setSelectedSections((prev) =>
      prev.includes(key)
        ? prev.filter((s) => s !== key)
        : [...prev, key],
    );
  }

  const canSave = selectedApiKey.trim().length > 0 && selectedSections.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-2xl bg-kurodo-ink border border-white/10 p-6 animate-fade-in max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {isOnboarding ? (
              <>
                <span className="text-kurodo-red">黒</span>
                <span className="text-kurodo-gold">道</span>
              </>
            ) : (
              <>
                <span className="text-kurodo-red">設</span>
                <span>{t.profile}</span>
              </>
            )}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-kurodo-muted hover:text-white transition-colors text-xl"
            >
              &times;
            </button>
          )}
        </div>

        {isOnboarding && (
          <p className="text-kurodo-muted text-sm mb-6">
            {t.welcomeSubtitle}
          </p>
        )}

        {/* API Key */}
        <div className="mb-5">
          <p className="text-kurodo-muted text-xs uppercase tracking-wider mb-2">
            {t.apiKey}
          </p>
          <input
            type="password"
            value={selectedApiKey}
            onChange={(e) => setSelectedApiKey(e.target.value)}
            placeholder={t.apiKeyPlaceholder}
            className="w-full px-4 py-3 rounded-xl bg-kurodo-card border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-kurodo-red/50 font-mono"
          />
        </div>

        {/* Language */}
        <div className="mb-5">
          <p className="text-kurodo-muted text-xs uppercase tracking-wider mb-2">
            {t.language}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setSelectedLang(l.code)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedLang === l.code
                    ? "bg-kurodo-red text-white"
                    : "bg-kurodo-card border border-white/5 text-white/70 hover:border-kurodo-red/30"
                }`}
              >
                <span className="mr-1">{l.flag}</span> {l.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Level */}
        <div className="mb-5">
          <p className="text-kurodo-muted text-xs uppercase tracking-wider mb-2">
            {t.jlptLevel}
          </p>
          <div className="flex gap-2">
            {jlptLevels.map((jlpt) => (
              <button
                key={jlpt.level}
                onClick={() => setSelectedLevel(jlpt.level)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  selectedLevel === jlpt.level
                    ? "bg-kurodo-red text-white"
                    : "bg-kurodo-card border border-white/5 text-white/70 hover:border-kurodo-red/30"
                }`}
              >
                {jlpt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="mb-6">
          <p className="text-kurodo-muted text-xs uppercase tracking-wider mb-2">
            {t.sections}
          </p>
          <div className="space-y-2">
            {SECTION_META.map((sec) => {
              const active = selectedSections.includes(sec.key);
              return (
                <button
                  key={sec.key}
                  onClick={() => toggleSection(sec.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-kurodo-card border border-kurodo-red/40 text-white"
                      : "bg-kurodo-card border border-white/5 text-white/30"
                  }`}
                >
                  <span className={`text-lg ${active ? "text-kurodo-red" : "text-white/20"}`}>
                    {sec.icon}
                  </span>
                  <span className="flex-1 text-left">{t[sec.labelKey]}</span>
                  <span
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                      active
                        ? "bg-kurodo-red border-kurodo-red text-white"
                        : "border-white/20"
                    }`}
                  >
                    {active && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={() => canSave && onSave(selectedLang, selectedLevel, selectedApiKey, selectedSections)}
          disabled={!canSave}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, #C41E3A, #8B0000)",
          }}
        >
          {isOnboarding ? t.getStarted : t.save}
        </button>
      </div>
    </div>
  );
}
