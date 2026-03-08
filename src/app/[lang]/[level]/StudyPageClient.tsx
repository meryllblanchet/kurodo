"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Language, JLPTLevel, SectionKey, ALL_SECTIONS, GeneratedContent } from "@/lib/types";
import { ui } from "@/lib/languages";
import { useGenerate } from "@/hooks/useGenerate";
import { useProfile } from "@/hooks/useProfile";
import { useHistory } from "@/hooks/useHistory";
import { useSessionHistory, SavedSession } from "@/hooks/useSessionHistory";
import { ProfileModal } from "@/components/ProfileModal";
import { KanjiGrid } from "@/components/KanjiGrid";
import { SessionContent } from "@/components/SessionContent";

function formatDate(ts: number, t: { today: string; yesterday: string }) {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return t.today;
  if (diffDays === 1) return t.yesterday;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function sessionSummary(content: GeneratedContent): string {
  const parts: string[] = [];
  if (content.kanji) parts.push(content.kanji.kanji);
  if (content.grammar) parts.push(content.grammar.title);
  if (content.reading) parts.push(content.reading.title);
  if (content.listening) parts.push(content.listening.title);
  return parts.join(" · ") || "—";
}

export function StudyPageClient({
  lang,
  level,
}: {
  lang: Language;
  level: JLPTLevel;
}) {
  const router = useRouter();
  const { profile, loaded, saveProfile } = useProfile();
  const apiKey = profile?.apiKey || "";
  const sections = profile?.sections || [...ALL_SECTIONS];
  const t = ui[lang];
  const { history, record: recordHistory, reset: resetHistory, progress, levelComplete } = useHistory(level);
  const { sessions, save: saveSession, remove: removeSession, clearAll: clearAllSessions } = useSessionHistory(level);
  const getHistory = useCallback(() => history, [history]);
  const getSections = useCallback(() => sections, [sections]);
  const { data, loading, error, generate } = useGenerate(lang, level, apiKey, getHistory, getSections);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"session" | "history" | "dictionary">("session");
  const [reviewSession, setReviewSession] = useState<SavedSession | null>(null);

  const showOnboarding = loaded && !apiKey;

  useEffect(() => {
    if (apiKey) {
      saveProfile({ lang, level, apiKey, sections });
    }
  }, [lang, level]);

  // Record history and save session after each generation
  useEffect(() => {
    if (data) {
      if (data.kanji) recordHistory(data.kanji.kanji, data.grammar?.title || "");
      else if (data.grammar) recordHistory("", data.grammar.title);
      saveSession(data);
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
      saveProfile({ lang, level: nextLevel, apiKey, sections });
      router.push(`/${lang}/${nextLevel}`);
    }
  }

  function handleProfileSave(newLang: Language, newLevel: JLPTLevel, newApiKey: string, newSections: SectionKey[]) {
    saveProfile({ lang: newLang, level: newLevel, apiKey: newApiKey, sections: newSections });
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <ProfileModal
          lang={lang}
          level={level}
          apiKey=""
          sections={[...ALL_SECTIONS]}
          onSave={handleProfileSave}
          isOnboarding
        />
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {(
          [
            { key: "session" as const, label: t.studySession },
            { key: "history" as const, label: t.history },
            { key: "dictionary" as const, label: t.kanjiDictionary },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key !== "history") setReviewSession(null);
            }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-kurodo-red text-white"
                : "bg-kurodo-card border border-white/5 text-kurodo-muted hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
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
            <SessionContent
              data={data}
              lang={lang}
              level={level}
              apiKey={apiKey}
              sections={sections}
            />
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div>
          {reviewSession ? (
            <div>
              {/* Back button and date */}
              <button
                onClick={() => setReviewSession(null)}
                className="text-kurodo-muted hover:text-white transition-colors text-sm mb-4 flex items-center gap-1"
              >
                <span>←</span> {t.back}
              </button>
              <p className="text-kurodo-muted text-xs mb-4">
                {new Date(reviewSession.timestamp).toLocaleString()}
              </p>
              <SessionContent
                data={reviewSession.content}
                lang={lang}
                level={level}
                apiKey={apiKey}
                sections={ALL_SECTIONS}
              />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-kurodo-muted text-sm text-center py-12">
              {t.noHistory}
            </p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 px-4 py-4 rounded-xl bg-kurodo-card border border-white/5 hover:border-kurodo-red/30 transition-all duration-200 cursor-pointer"
                  onClick={() => setReviewSession(session)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {sessionSummary(session.content)}
                    </p>
                    <p className="text-kurodo-muted text-xs mt-0.5">
                      {formatDate(session.timestamp, t)} · {new Date(session.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSession(session.id);
                    }}
                    className="shrink-0 text-kurodo-muted hover:text-red-400 transition-colors p-1"
                    title={t.deleteSession}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Clear all & reset */}
              <button
                onClick={() => {
                  if (window.confirm(t.clearAllConfirm)) {
                    clearAllSessions();
                    resetHistory();
                  }
                }}
                className="w-full mt-4 py-3 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 bg-red-500/5 border border-red-500/10 hover:border-red-500/20 transition-all duration-200"
              >
                {t.clearAllHistory}
              </button>
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
          sections={sections}
          onSave={handleProfileSave}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
