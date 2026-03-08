"use client";

import { useState } from "react";
import { Language, SRSItem } from "@/lib/types";
import { ui } from "@/lib/languages";

const BOX_COLORS = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];
const BOX_LABELS = ["", "1", "2", "3", "4", "5"];

function timeAgo(timestamp: number, lang: Language): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function ProgressSection({
  lang,
  stats,
  dueItems,
}: {
  lang: Language;
  stats: { totalItems: number; dueNow: number; accuracy: number; byBox: number[] };
  dueItems: SRSItem[];
}) {
  const t = ui[lang];
  const [expandedBox, setExpandedBox] = useState<number | null>(null);

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold text-kurodo-gold mb-4 flex items-center gap-2">
        <span className="text-kurodo-red">復</span> {t.progress}
      </h2>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="px-3 py-4 rounded-xl bg-kurodo-card border border-white/5 text-center">
          <p className="text-2xl font-bold text-white">{stats.totalItems}</p>
          <p className="text-xs text-kurodo-muted mt-1">{t.totalTracked}</p>
        </div>
        <div className="px-3 py-4 rounded-xl bg-kurodo-card border border-white/5 text-center">
          <p className={`text-2xl font-bold ${stats.dueNow > 0 ? "text-kurodo-red" : "text-green-400"}`}>
            {stats.dueNow}
          </p>
          <p className="text-xs text-kurodo-muted mt-1">{t.dueForReview}</p>
        </div>
        <div className="px-3 py-4 rounded-xl bg-kurodo-card border border-white/5 text-center">
          <p className={`text-2xl font-bold ${
            stats.accuracy >= 70 ? "text-green-400" : stats.accuracy >= 40 ? "text-kurodo-gold" : "text-kurodo-red"
          }`}>
            {stats.accuracy}%
          </p>
          <p className="text-xs text-kurodo-muted mt-1">{t.accuracy}</p>
        </div>
      </div>

      {/* Leitner boxes */}
      <div className="mb-6">
        <p className="text-kurodo-muted text-xs uppercase tracking-wider mb-3">
          Leitner Boxes
        </p>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((box) => {
            const count = stats.byBox[box] || 0;
            const maxCount = Math.max(...stats.byBox.slice(1), 1);
            const width = count > 0 ? Math.max((count / maxCount) * 100, 8) : 0;

            return (
              <button
                key={box}
                onClick={() => setExpandedBox(expandedBox === box ? null : box)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-kurodo-muted w-8">
                    {t.box} {BOX_LABELS[box]}
                  </span>
                  <div className="flex-1 h-7 rounded-lg bg-kurodo-deep/50 border border-white/5 overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-500"
                      style={{
                        width: `${width}%`,
                        backgroundColor: BOX_COLORS[box],
                        opacity: 0.7,
                      }}
                    />
                    {count > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                        {count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Due items */}
      <div>
        <p className="text-kurodo-muted text-xs uppercase tracking-wider mb-3">
          {t.dueForReview} ({dueItems.length})
        </p>

        {dueItems.length === 0 ? (
          <p className="text-kurodo-muted text-sm text-center py-6">
            {t.noDueItems}
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {dueItems.slice(0, 30).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-kurodo-deep/50 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: BOX_COLORS[item.box], opacity: 0.8 }}
                  >
                    {item.box}
                  </span>
                  <div>
                    <p className="text-white text-sm font-medium truncate max-w-48">
                      {item.label}
                    </p>
                    {item.sublabel && (
                      <p className="text-kurodo-muted text-xs truncate max-w-48">
                        {item.sublabel}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-kurodo-muted text-xs">
                  {timeAgo(item.lastReviewed, lang)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
