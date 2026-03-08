"use client";

import { useState, useEffect, useCallback } from "react";
import { JLPTLevel } from "@/lib/types";
import { jlptKanji } from "@/lib/kanji-data";

interface StudyHistory {
  kanji: string[];
  grammar: string[];
}

// Approximate grammar point counts per JLPT level
const GRAMMAR_COUNTS: Record<JLPTLevel, number> = {
  n5: 45,
  n4: 65,
  n3: 95,
  n2: 175,
  n1: 220,
};

function storageKey(level: JLPTLevel) {
  return `kurodo-history-${level}`;
}

export function useHistory(level: JLPTLevel) {
  const [history, setHistory] = useState<StudyHistory>({ kanji: [], grammar: [] });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey(level));
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        setHistory({ kanji: [], grammar: [] });
      }
    } catch {
      setHistory({ kanji: [], grammar: [] });
    }
  }, [level]);

  const record = useCallback(
    (kanji: string, grammar: string) => {
      setHistory((prev) => {
        const next: StudyHistory = {
          kanji: [...new Set([...prev.kanji, kanji])],
          grammar: [...new Set([...prev.grammar, grammar])],
        };
        localStorage.setItem(storageKey(level), JSON.stringify(next));
        return next;
      });
    },
    [level],
  );

  const reset = useCallback(() => {
    const empty: StudyHistory = { kanji: [], grammar: [] };
    setHistory(empty);
    localStorage.setItem(storageKey(level), JSON.stringify(empty));
  }, [level]);

  const totalKanji = (jlptKanji[level] || []).length;
  const totalGrammar = GRAMMAR_COUNTS[level];
  const kanjiCovered = history.kanji.length;
  const grammarCovered = history.grammar.length;
  const kanjiComplete = totalKanji > 0 && kanjiCovered >= totalKanji;
  const grammarComplete = grammarCovered >= totalGrammar;
  const levelComplete = kanjiComplete && grammarComplete;

  return {
    history,
    record,
    reset,
    progress: { kanjiCovered, totalKanji, grammarCovered, totalGrammar },
    levelComplete,
  };
}
