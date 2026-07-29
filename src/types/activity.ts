export type Recurrence = "nenhuma" | "diaria" | "semanal" | "mensal";
export type Priority = "baixa" | "media" | "alta";

export interface Activity {
  id: string;
  name: string;
  description: string;
  lifeAreaSlug: string;
  scheduledTime: string | null;
  durationMinutes: number | null;
  priority: Priority;
  points: number;
  recurrence: Recurrence;
  weekDays: number[];
  monthDay: number | null;
  notes: string;
  isRequired: boolean;
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  nenhuma: "Não repete",
  diaria: "Todos os dias",
  semanal: "Semanal",
  mensal: "Mensal",
};

export const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function isDueToday(activity: Activity, today: Date = new Date()): boolean {
  switch (activity.recurrence) {
    case "diaria":
      return true;
    case "semanal":
      return activity.weekDays.includes(today.getDay());
    case "mensal":
      return activity.monthDay === today.getDate();
    case "nenhuma":
      return false;
  }
}

export function recurrenceSummary(activity: Activity): string {
  if (activity.recurrence === "semanal" && activity.weekDays.length > 0) {
    return activity.weekDays
      .slice()
      .sort((a, b) => a - b)
      .map((d) => WEEKDAY_LABELS[d])
      .join(" · ");
  }
  if (activity.recurrence === "mensal" && activity.monthDay) {
    return `Dia ${activity.monthDay}`;
  }
  return RECURRENCE_LABELS[activity.recurrence];
}

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "agua",
    name: "Beber água",
    description: "",
    lifeAreaSlug: "saude",
    scheduledTime: null,
    durationMinutes: null,
    priority: "media",
    points: 5,
    recurrence: "diaria",
    weekDays: [],
    monthDay: null,
    notes: "",
    isRequired: false,
  },
  {
    id: "caminhada",
    name: "Caminhada",
    description: "",
    lifeAreaSlug: "movimento",
    scheduledTime: "07:00",
    durationMinutes: 30,
    priority: "media",
    points: 10,
    recurrence: "diaria",
    weekDays: [],
    monthDay: null,
    notes: "",
    isRequired: false,
  },
  {
    id: "ler",
    name: "Ler",
    description: "20 páginas",
    lifeAreaSlug: "estudos",
    scheduledTime: null,
    durationMinutes: 20,
    priority: "baixa",
    points: 10,
    recurrence: "diaria",
    weekDays: [],
    monthDay: null,
    notes: "",
    isRequired: false,
  },
  {
    id: "casa",
    name: "Organizar a casa",
    description: "",
    lifeAreaSlug: "casa",
    scheduledTime: null,
    durationMinutes: null,
    priority: "baixa",
    points: 5,
    recurrence: "diaria",
    weekDays: [],
    monthDay: null,
    notes: "",
    isRequired: false,
  },
  {
    id: "oracao",
    name: "Momento de oração",
    description: "",
    lifeAreaSlug: "espiritualidade",
    scheduledTime: "06:30",
    durationMinutes: 15,
    priority: "alta",
    points: 10,
    recurrence: "diaria",
    weekDays: [],
    monthDay: null,
    notes: "",
    isRequired: true,
  },
  {
    id: "roupas",
    name: "Lavar roupas",
    description: "",
    lifeAreaSlug: "casa",
    scheduledTime: null,
    durationMinutes: null,
    priority: "baixa",
    points: 5,
    recurrence: "semanal",
    weekDays: [1, 4],
    monthDay: null,
    notes: "",
    isRequired: false,
  },
];
