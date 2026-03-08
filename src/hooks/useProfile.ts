"use client";

import { useState, useEffect } from "react";
import { Language, JLPTLevel, SectionKey, ALL_SECTIONS } from "@/lib/types";

const STORAGE_KEY = "kurodo-profile";

export interface Profile {
  lang: Language;
  level: JLPTLevel;
  apiKey: string;
  sections: SectionKey[];
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrate old profiles without sections
        if (!parsed.sections) parsed.sections = [...ALL_SECTIONS];
        setProfile(parsed);
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  function saveProfile(p: Profile) {
    setProfile(p);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }

  function clearProfile() {
    setProfile(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return { profile, loaded, saveProfile, clearProfile };
}
