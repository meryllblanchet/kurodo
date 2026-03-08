"use client";

import { useState } from "react";
import { Language, JLPTLevel } from "@/lib/types";
import { ui, languages, jlptLevels } from "@/lib/languages";

export function ProfileModal({
  lang,
  level,
  apiKey,
  onSave,
  onClose,
}: {
  lang: Language;
  level: JLPTLevel;
  apiKey: string;
  onSave: (lang: Language, level: JLPTLevel, apiKey: string) => void;
  onClose: () => void;
}) {
  const [selectedLang, setSelectedLang] = useState<Language>(lang);
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>(level);
  const [selectedApiKey, setSelectedApiKey] = useState(apiKey);

  const t = ui[selectedLang];

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
            <span className="text-kurodo-red">設</span>
            <span>{t.profile}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-kurodo-muted hover:text-white transition-colors text-xl"
          >
            &times;
          </button>
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

        {/* API Key */}
        <div className="mb-6">
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

        {/* Save */}
        <button
          onClick={() => onSave(selectedLang, selectedLevel, selectedApiKey)}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #C41E3A, #8B0000)",
          }}
        >
          {t.save}
        </button>
      </div>
    </div>
  );
}
