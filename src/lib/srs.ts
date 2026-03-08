import { SRSData, SRSItem, ExerciseResult } from "./types";

const DAY = 24 * 60 * 60 * 1000;

// Box 1 = always due, Box 2 = 1 day, Box 3 = 3 days, Box 4 = 7 days, Box 5 = 30 days
const BOX_INTERVALS = [0, 0, 1 * DAY, 3 * DAY, 7 * DAY, 30 * DAY];

export function createSRSData(): SRSData {
  return { version: 1, items: {} };
}

export function recordResult(data: SRSData, result: ExerciseResult): SRSData {
  const now = Date.now();
  const existing = data.items[result.itemId];

  let box: number;
  let totalReviews: number;
  let correctCount: number;

  if (existing) {
    totalReviews = existing.totalReviews + 1;
    correctCount = existing.correctCount + (result.correct ? 1 : 0);
    box = result.correct ? Math.min(existing.box + 1, 5) : 1;
  } else {
    totalReviews = 1;
    correctCount = result.correct ? 1 : 0;
    box = result.correct ? 2 : 1;
  }

  const item: SRSItem = {
    id: result.itemId,
    type: result.type,
    box,
    lastReviewed: now,
    nextReview: now + BOX_INTERVALS[box],
    totalReviews,
    correctCount,
    label: result.label,
    sublabel: result.sublabel ?? existing?.sublabel,
  };

  return {
    ...data,
    items: { ...data.items, [result.itemId]: item },
  };
}

export function getDueItems(data: SRSData, now: number = Date.now()): SRSItem[] {
  return Object.values(data.items)
    .filter((item) => now >= item.nextReview)
    .sort((a, b) => a.box - b.box || a.nextReview - b.nextReview);
}

export function getWeakItems(data: SRSData, limit: number = 10): SRSItem[] {
  return Object.values(data.items)
    .filter((item) => item.box <= 2)
    .sort((a, b) => a.box - b.box || a.lastReviewed - b.lastReviewed)
    .slice(0, limit);
}

export function getStats(data: SRSData): {
  totalItems: number;
  dueNow: number;
  accuracy: number;
  byBox: number[];
} {
  const items = Object.values(data.items);
  const now = Date.now();
  const totalReviews = items.reduce((s, i) => s + i.totalReviews, 0);
  const totalCorrect = items.reduce((s, i) => s + i.correctCount, 0);

  const byBox = [0, 0, 0, 0, 0, 0]; // index 0 unused
  for (const item of items) {
    byBox[item.box]++;
  }

  return {
    totalItems: items.length,
    dueNow: items.filter((i) => now >= i.nextReview).length,
    accuracy: totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0,
    byBox,
  };
}
