"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { languages } from "@/lib/languages";
import { useProfile } from "@/hooks/useProfile";

export default function Home() {
  const router = useRouter();
  const { profile, loaded, saveProfile } = useProfile();

  useEffect(() => {
    if (loaded && profile) {
      router.replace(`/${profile.lang}/${profile.level}`);
    }
  }, [loaded, profile, router]);

  // Show nothing while checking localStorage to avoid flash
  if (!loaded || profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-kurodo-red text-4xl font-bold animate-pulse-slow">
          黒道
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight mb-2">
          <span className="text-kurodo-red">黒</span>
          <span className="text-kurodo-gold">道</span>
        </h1>
        <p className="text-3xl font-light tracking-widest text-white/90 mb-1">
          KURODO
        </p>
        <p className="text-kurodo-muted text-sm">
          Your path to Japanese mastery
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {languages.map((lang) => (
          <Link
            key={lang.code}
            href={`/${lang.code}`}
            className="flex items-center gap-4 w-full px-5 py-4 rounded-xl bg-kurodo-card border border-white/5 hover:border-kurodo-red/40 transition-all duration-200 hover:bg-kurodo-ink group"
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="text-lg font-medium text-white/90 group-hover:text-white transition-colors">
              {lang.nativeName}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
