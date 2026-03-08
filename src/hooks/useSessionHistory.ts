"use client";

import { useState, useEffect, useCallback } from "react";
import { GeneratedContent, JLPTLevel } from "@/lib/types";

const STORAGE_KEY_PREFIX = "kurodo-sessions-";
const MAX_SESSIONS = 50;

export interface SavedSession {
  id: string;
  timestamp: number;
  level: JLPTLevel;
  content: GeneratedContent;
}

function storageKey(level: JLPTLevel) {
  return `${STORAGE_KEY_PREFIX}${level}`;
}

export function useSessionHistory(level: JLPTLevel) {
  const [sessions, setSessions] = useState<SavedSession[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey(level));
      if (stored) setSessions(JSON.parse(stored));
      else setSessions([]);
    } catch {
      setSessions([]);
    }
  }, [level]);

  const save = useCallback(
    (content: GeneratedContent) => {
      const session: SavedSession = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        level,
        content,
      };
      const updated = [session, ...sessions].slice(0, MAX_SESSIONS);
      setSessions(updated);
      localStorage.setItem(storageKey(level), JSON.stringify(updated));
      return session;
    },
    [level, sessions],
  );

  const remove = useCallback(
    (id: string) => {
      const updated = sessions.filter((s) => s.id !== id);
      setSessions(updated);
      localStorage.setItem(storageKey(level), JSON.stringify(updated));
    },
    [level, sessions],
  );

  return { sessions, save, remove };
}
