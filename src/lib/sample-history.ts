// Dados fabricados pra dar vida a Jardim/Histórico/Humor/Estatísticas antes
// de existir histórico real de vários dias (isso só existe de verdade depois
// do login/Supabase religados — ver memória do projeto).

export interface DayHistoryEntry {
  date: string; // ISO yyyy-mm-dd
  pointsEarned: number;
  pointsPossible: number;
  moodStart: number;
  moodEnd: number;
  energyStart: number;
  energyEnd: number;
  gratitude: string;
  reflection: string;
  grew: boolean;
  areaPoints: Record<string, number>;
}

const GRATITUDE_SAMPLES = [
  "Um café tranquilo antes de todo mundo acordar.",
  "Uma ligação boa com minha família.",
  "Ter conseguido descansar um pouco à tarde.",
  "O sol batendo na janela de manhã.",
  "Ter terminado algo que estava adiando.",
  "Um momento de oração que trouxe paz.",
  "Uma caminhada gostosa lá fora.",
  "",
  "",
];

const REFLECTION_SAMPLES = [
  "Percebi que preciso desacelerar um pouco mais.",
  "Consegui manter a calma mesmo com o dia corrido.",
  "Aprendi que tudo bem não fazer tudo perfeito.",
  "Hoje foi mais sobre presença do que produtividade.",
  "",
  "",
];

const AREA_ROTATION = ["saude", "movimento", "casa", "espiritualidade", "estudos"];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function generateSampleHistory(days: number): DayHistoryEntry[] {
  const entries: DayHistoryEntry[] = [];
  const today = new Date();

  for (let i = days; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const seed = i * 17.31;

    const pointsPossible = 30 + Math.round(seededRandom(seed) * 20);
    // A maioria dos dias com boa parte concluída; alguns dias mais leves.
    const isLightDay = seededRandom(seed + 1) < 0.18;
    const completionRatio = isLightDay
      ? 0.2 + seededRandom(seed + 2) * 0.25
      : 0.55 + seededRandom(seed + 2) * 0.45;
    const pointsEarned = Math.round(pointsPossible * completionRatio);

    const moodStart = clamp(3 + Math.round((seededRandom(seed + 3) - 0.5) * 3), 1, 5);
    const moodEnd = clamp(moodStart + Math.round((seededRandom(seed + 4) - 0.3) * 2), 1, 5);
    const energyStart = clamp(3 + Math.round((seededRandom(seed + 5) - 0.5) * 3), 1, 5);
    const energyEnd = clamp(energyStart + Math.round((seededRandom(seed + 6) - 0.5) * 2), 1, 5);

    const areaPoints: Record<string, number> = {};
    let remaining = pointsEarned;
    const areaCount = 2 + Math.floor(seededRandom(seed + 7) * 3);
    for (let a = 0; a < areaCount && remaining > 0; a++) {
      const area = pick(AREA_ROTATION, seed + 8 + a);
      const share = a === areaCount - 1 ? remaining : Math.round(remaining * seededRandom(seed + 9 + a));
      areaPoints[area] = (areaPoints[area] ?? 0) + share;
      remaining -= share;
    }

    entries.push({
      date: date.toISOString().slice(0, 10),
      pointsEarned,
      pointsPossible,
      moodStart,
      moodEnd,
      energyStart,
      energyEnd,
      gratitude: pick(GRATITUDE_SAMPLES, seed + 20),
      reflection: pick(REFLECTION_SAMPLES, seed + 21),
      grew: completionRatio >= 0.5,
      areaPoints,
    });
  }

  return entries;
}

export const SAMPLE_HISTORY: DayHistoryEntry[] = generateSampleHistory(30);
