"use client";

import { useState, useEffect, useCallback } from "react";
import { JLPTLevel, SRSData, ExerciseResult } from "@/lib/types";
import * as srs from "@/lib/srs";

function storageKey(level: JLPTLevel) {
  return `kurodo-srs-${level}`;
}

export function useSRS(level: JLPTLevel) {
  const [data, setData] = useState<SRSData>(srs.createSRSData());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey(level));
      if (stored) {
        setData(JSON.parse(stored));
      } else {
        setData(srs.createSRSData());
      }
    } catch {
      setData(srs.createSRSData());
    }
    setLoaded(true);
  }, [level]);

  const persist = useCallback(
    (next: SRSData) => {
      setData(next);
      localStorage.setItem(storageKey(level), JSON.stringify(next));
    },
    [level],
  );

  const recordResult = useCallback(
    (result: ExerciseResult) => {
      setData((prev) => {
        const next = srs.recordResult(prev, result);
        localStorage.setItem(storageKey(level), JSON.stringify(next));
        return next;
      });
    },
    [level],
  );

  const getDueItems = useCallback(() => srs.getDueItems(data), [data]);
  const getWeakItems = useCallback((limit?: number) => srs.getWeakItems(data, limit), [data]);
  const getStats = useCallback(() => srs.getStats(data), [data]);

  const clearData = useCallback(() => {
    persist(srs.createSRSData());
  }, [persist]);

  return { data, loaded, recordResult, getDueItems, getWeakItems, getStats, clearData };
}
