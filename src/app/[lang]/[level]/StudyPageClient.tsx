"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Language, JLPTLevel } from "@/lib/types";
import { ui } from "@/lib/languages";
import { useGenerate } from "@/hooks/useGenerate";
import { useProfile } from "@/hooks/useProfile";
import { KanjiSection } from "@/components/KanjiSection";
import { GrammarSection } from "@/components/GrammarSection";
import { ExerciseSection } from "@/components/ExerciseSection";
import { ProfileModal } from "@/components/ProfileModal";
import { KanjiGrid } from "@/components/KanjiGrid";

export function StudyPageClient({
  lang,
  level,
}: {
  lang: Language;
  level: JLPTLevel;
}) {
  const router = useRouter();
  const { profile, saveProfile } = useProfile();
  const apiKey = profile?.apiKey || "";
  const t = ui[lang];
  const { data, loading, error, generate } = useGenerate(lang, level, apiKey);
  const [activeSection, setActiveSection] = useState<
    "kanji" | "grammar" | "exercises" | null
  >(null);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"session" | "dictionary">(
    "session",
  );

  useEffect(() => {
    saveProfile({ lang, level, apiKey });
  }, [lang, level]);

  function handleProfileSave(newLang: Language, newLevel: JLPTLevel, newApiKey: string) {
    saveProfile({ lang: newLang, level: newLevel, apiKey: newApiKey });
    setShowProfile(false);
    if (newLang !== lang || newLevel !== level) {
      router.push(`/${newLang}/${newLevel}`);
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-kurodo-red">黒</span>
          <span className="text-kurodo-gold">道</span>
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-kurodo-red font-bold text-lg">
            {level.toUpperCase()}
          </span>
          <button
            onClick={() => setShowProfile(true)}
            className="w-9 h-9 rounded-full bg-kurodo-card border border-white/10 hover:border-kurodo-red/40 flex items-center justify-center transition-all duration-200 text-kurodo-muted hover:text-white"
            title={t.profile}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </div>

      {/* API Key Warning */}
      {!apiKey && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-kurodo-gold/10 border border-kurodo-gold/20 text-kurodo-gold text-sm">
          {t.apiKeyRequired}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("session")}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === "session"
              ? "bg-kurodo-red text-white"
              : "bg-kurodo-card border border-white/5 text-kurodo-muted hover:text-white"
          }`}
        >
          {t.studySession}
        </button>
        <button
          onClick={() => setActiveTab("dictionary")}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === "dictionary"
              ? "bg-kurodo-red text-white"
              : "bg-kurodo-card border border-white/5 text-kurodo-muted hover:text-white"
          }`}
        >
          {t.kanjiDictionary}
        </button>
      </div>

      {/* Study Session Tab */}
      {activeTab === "session" && (
        <div>
          {/* Generate Button */}
          <button
            onClick={generate}
            disabled={loading || !apiKey}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 mb-8 relative overflow-hidden disabled:opacity-70"
            style={{
              background: loading
                ? "linear-gradient(135deg, #1A1A2E, #16162A)"
                : "linear-gradient(135deg, #C41E3A, #8B0000)",
            }}
          >
            {loading ? (
              <span className="animate-pulse-slow">{t.generating}</span>
            ) : (
              t.generate
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {t.error}
              <p className="text-red-400/60 text-xs mt-1">{error}</p>
            </div>
          )}

          {/* Content */}
          {data && (
            <div className="space-y-3 animate-fade-in">
              {(
                [
                  {
                    key: "kanji" as const,
                    label: t.kanjiOfTheDay,
                    icon: "漢",
                  },
                  {
                    key: "grammar" as const,
                    label: t.grammarOfTheDay,
                    icon: "文",
                  },
                  {
                    key: "exercises" as const,
                    label: t.exercises,
                    icon: "練",
                  },
                ] as const
              ).map((section) => (
                <div key={section.key}>
                  <button
                    onClick={() =>
                      setActiveSection(
                        activeSection === section.key ? null : section.key,
                      )
                    }
                    className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-kurodo-card border border-white/5 hover:border-kurodo-red/30 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-kurodo-red text-xl">
                        {section.icon}
                      </span>
                      <span className="text-white font-medium">
                        {section.label}
                      </span>
                    </div>
                    <span
                      className={`text-kurodo-muted transition-transform duration-200 ${activeSection === section.key ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </button>

                  {activeSection === section.key && (
                    <div className="mt-3 px-1 pb-2">
                      {section.key === "kanji" && (
                        <KanjiSection kanji={data.kanji} lang={lang} />
                      )}
                      {section.key === "grammar" && (
                        <GrammarSection grammar={data.grammar} lang={lang} />
                      )}
                      {section.key === "exercises" && (
                        <ExerciseSection
                          exercises={data.exercises}
                          lang={lang}
                          level={level}
                          apiKey={apiKey}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Kanji Dictionary Tab */}
      {activeTab === "dictionary" && (
        <KanjiGrid lang={lang} level={level} apiKey={apiKey} />
      )}

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          lang={lang}
          level={level}
          apiKey={apiKey}
          onSave={handleProfileSave}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
