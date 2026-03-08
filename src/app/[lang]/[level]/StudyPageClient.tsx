"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Language, JLPTLevel } from "@/lib/types";
import { ui } from "@/lib/languages";
import { useGenerate } from "@/hooks/useGenerate";
import { useProfile } from "@/hooks/useProfile";
import { useHistory } from "@/hooks/useHistory";
import { KanjiSection } from "@/components/KanjiSection";
import { GrammarSection } from "@/components/GrammarSection";
import { ExerciseSection } from "@/components/ExerciseSection";
import { ProfileModal } from "@/components/ProfileModal";
import { KanjiGrid } from "@/components/KanjiGrid";
import { ReadingSection } from "@/components/ReadingSection";

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
  const { history, record: recordHistory, reset: resetHistory, progress, levelComplete } = useHistory(level);
  const getHistory = useCallback(() => history, [history]);
  const { data, loading, error, generate } = useGenerate(lang, level, apiKey, getHistory);
  const [activeSection, setActiveSection] = useState<
    "kanji" | "grammar" | "exercises" | "reading" | null
  >(null);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"session" | "dictionary">(
    "session",
  );

  useEffect(() => {
    saveProfile({ lang, level, apiKey });
  }, [lang, level]);

  // Record kanji and grammar after each generation
  useEffect(() => {
    if (data) {
      recordHistory(data.kanji.kanji, data.grammar.title);
    }
  }, [data]);

  const nextLevelMap: Record<JLPTLevel, JLPTLevel | null> = {
    n5: "n4", n4: "n3", n3: "n2", n2: "n1", n1: null,
  };
  const nextLevel = nextLevelMap[level];

  function handleStartOver() {
    resetHistory();
  }

  function handleNextLevel() {
    if (nextLevel) {
      saveProfile({ lang, level: nextLevel, apiKey });
      router.push(`/${lang}/${nextLevel}`);
    }
  }

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
          {/* Progress bars */}
          {(progress.kanjiCovered > 0 || progress.grammarCovered > 0) && (
            <div className="mb-6 space-y-2">
              <div>
                <div className="flex justify-between text-xs text-kurodo-muted mb-1">
                  <span>{t.kanjiProgress}</span>
                  <span>{progress.kanjiCovered}/{progress.totalKanji}</span>
                </div>
                <div className="h-2 rounded-full bg-kurodo-deep/50 border border-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-kurodo-red transition-all duration-500"
                    style={{ width: `${progress.totalKanji > 0 ? Math.min((progress.kanjiCovered / progress.totalKanji) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-kurodo-muted mb-1">
                  <span>{t.grammarProgress}</span>
                  <span>{progress.grammarCovered}/{progress.totalGrammar}</span>
                </div>
                <div className="h-2 rounded-full bg-kurodo-deep/50 border border-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-kurodo-gold transition-all duration-500"
                    style={{ width: `${Math.min((progress.grammarCovered / progress.totalGrammar) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Level complete banner */}
          {levelComplete && (
            <div className="mb-6 px-5 py-4 rounded-xl bg-green-500/10 border border-green-500/20 animate-fade-in">
              <p className="text-green-400 font-medium text-sm mb-3">
                {t.levelComplete}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleStartOver}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-kurodo-card border border-white/10 text-white/80 hover:border-kurodo-red/40 transition-all duration-200"
                >
                  {t.startOver}
                </button>
                {nextLevel && (
                  <button
                    onClick={handleNextLevel}
                    className="flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200"
                    style={{ background: "linear-gradient(135deg, #C41E3A, #8B0000)" }}
                  >
                    {t.nextLevel} ({nextLevel.toUpperCase()})
                  </button>
                )}
              </div>
            </div>
          )}

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
                    label: t.writing,
                    icon: "書",
                  },
                  {
                    key: "reading" as const,
                    label: t.reading,
                    icon: "読",
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
                      {section.key === "reading" && (
                        <ReadingSection
                          reading={data.reading}
                          lang={lang}
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
