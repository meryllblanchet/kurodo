"use client";

import { useState, useEffect, useCallback } from "react";
import { JLPTLevel } from "@/lib/types";

interface StudyHistory {
  kanji: string[];
  grammar: string[];
}

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

  return { history, record };
}
