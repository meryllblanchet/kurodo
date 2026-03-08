"use client";

import { useState } from "react";
import { GeneratedContent, Language, JLPTLevel } from "@/lib/types";
import { generateStudySession } from "@/lib/claude-client";
import { StudyHistory } from "@/lib/prompts";

export function useGenerate(
  lang: Language,
  level: JLPTLevel,
  apiKey: string,
  getHistory?: () => StudyHistory,
) {
  const [data, setData] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const content = await generateStudySession(apiKey, lang, level, getHistory?.());
      setData(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, generate };
}
