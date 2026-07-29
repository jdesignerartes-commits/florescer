import { type DayHistoryEntry } from "@/lib/sample-history";

export interface GardenStageInfo {
  key: string;
  emoji: string;
  label: string;
  min: number;
}

export const GARDEN_STAGES: GardenStageInfo[] = [
  { key: "semente", emoji: "🌰", label: "Semente", min: 0 },
  { key: "broto", emoji: "🌱", label: "Broto", min: 7 },
  { key: "muda", emoji: "🪴", label: "Muda", min: 30 },
  { key: "planta", emoji: "🌿", label: "Planta", min: 90 },
  { key: "arvore", emoji: "🌳", label: "Árvore", min: 180 },
  { key: "jardim_completo", emoji: "🌸", label: "Jardim completo", min: 365 },
];

export function getGardenProgress(totalGrowthDays: number) {
  let current = GARDEN_STAGES[0];
  let next: GardenStageInfo | null = null;
  for (let i = 0; i < GARDEN_STAGES.length; i++) {
    if (totalGrowthDays >= GARDEN_STAGES[i].min) {
      current = GARDEN_STAGES[i];
      next = GARDEN_STAGES[i + 1] ?? null;
    }
  }
  return {
    current,
    next,
    daysToNext: next ? next.min - totalGrowthDays : 0,
  };
}

export function getCurrentStreak(history: DayHistoryEntry[]): number {
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].grew) streak++;
    else break;
  }
  return streak;
}

export function getTotalGrowthDays(history: DayHistoryEntry[]): number {
  return history.filter((d) => d.grew).length;
}
