import Link from "next/link";
import { redirect } from "next/navigation";
import { Language } from "@/lib/types";
import { ui, jlptLevels } from "@/lib/languages";

const validLanguages = ["en", "fr", "de", "it", "es", "pt"];

export function generateStaticParams() {
  return validLanguages.map((lang) => ({ lang }));
}

export default async function LevelSelect({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!validLanguages.includes(lang)) redirect("/");

  const t = ui[lang as Language];
  const l = lang as Language;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <Link
        href="/"
        className="self-start text-kurodo-muted hover:text-white transition-colors text-sm mb-8"
      >
        ← {t.back}
      </Link>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          <span className="text-kurodo-red">黒</span>
          <span className="text-kurodo-gold">道</span>
        </h1>
        <p className="text-kurodo-muted text-sm">{t.selectLevel}</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {jlptLevels.map((jlpt) => (
          <Link
            key={jlpt.level}
            href={`/${lang}/${jlpt.level}`}
            className="flex items-center justify-between w-full px-5 py-5 rounded-xl bg-kurodo-card border border-white/5 hover:border-kurodo-red/40 transition-all duration-200 hover:bg-kurodo-ink group"
          >
            <div>
              <span className="text-xl font-bold text-kurodo-red">
                {jlpt.label}
              </span>
              <span className="ml-3 text-white/70 group-hover:text-white/90 transition-colors">
                {jlpt.description[l]}
              </span>
            </div>
            <span className="text-white/30 group-hover:text-kurodo-red transition-colors">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
