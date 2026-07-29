"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressRing } from "@/components/home/progress-ring";
import { cn } from "@/lib/utils";
import { TONE_CLASSES, getLifeArea } from "@/lib/life-areas";
import { useActivities } from "@/lib/activities-context";
import { useDayEntry } from "@/lib/day-entry-context";
import { useSettings } from "@/lib/settings-context";
import { VerseOfTheDayCard } from "@/components/versiculos/verse-of-the-day-card";
import { HealthSummaryCard } from "@/components/saude/health-summary-card";
import { ExerciseSummaryCard } from "@/components/exercicios/exercise-summary-card";
import { useExercises } from "@/lib/exercises-context";

const MOOD_OPTIONS = [
  { value: 1, emoji: "😢", label: "Muito mal" },
  { value: 2, emoji: "🙁", label: "Não estou bem" },
  { value: 3, emoji: "😐", label: "Neutra" },
  { value: 4, emoji: "🙂", label: "Bem" },
  { value: 5, emoji: "😀", label: "Muito bem" },
] as const;

const ENERGY_OPTIONS = [
  { value: 1, label: "Muito baixa" },
  { value: 2, label: "Baixa" },
  { value: 3, label: "Média" },
  { value: 4, label: "Alta" },
  { value: 5, label: "Muito alta" },
] as const;

const INTENTION_SUGGESTIONS = [
  "Hoje quero manter a calma.",
  "Hoje quero cuidar de mim.",
  "Hoje quero terminar o que comecei.",
  "Hoje quero descansar sem culpa.",
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function HomeDashboard() {
  const {
    todaysActivities,
    todayCompleted,
    toggleToday,
    status: activitiesStatus,
  } = useActivities();
  const { todayEarnedScore: exercisePoints } = useExercises();
  const { name, dailyGoalPoints } = useSettings();
  const { mood, energy, intention, checkedIn, checkIn, editCheckIn } = useDayEntry();
  const [draftMood, setDraftMood] = useState<number | null>(null);
  const [draftEnergy, setDraftEnergy] = useState<number | null>(null);
  const [draftIntention, setDraftIntention] = useState("");

  const effectiveMood = checkedIn ? mood : draftMood;
  const effectiveEnergy = checkedIn ? energy : draftEnergy;

  function startEditing() {
    setDraftMood(mood);
    setDraftEnergy(energy);
    setDraftIntention(intention);
    editCheckIn();
  }

  const routinePoints = useMemo(
    () =>
      todaysActivities
        .filter((a) => todayCompleted.has(a.id))
        .reduce((sum, a) => sum + a.points, 0),
    [todaysActivities, todayCompleted]
  );
  const pointsEarned = routinePoints + exercisePoints;
  const allCompleted =
    todaysActivities.length > 0 &&
    todaysActivities.every((a) => todayCompleted.has(a.id));
  const progressPct = Math.min(
    100,
    Math.round((pointsEarned / dailyGoalPoints) * 100)
  );

  const message = useMemo(() => {
    if (allCompleted) return "Hoje você cuidou de você. Continue assim.";
    if (effectiveEnergy !== null && effectiveEnergy <= 2) return "Escolha apenas o essencial.";
    if (effectiveEnergy !== null && effectiveEnergy >= 4)
      return "Aproveite este momento para realizar sua prioridade.";
    if (effectiveMood !== null && effectiveMood <= 2)
      return "Hoje talvez você só precise dar o próximo passo.";
    if (todaysActivities.length > 0 && todaysActivities.length <= 3)
      return "Todo avanço importa.";
    return null;
  }, [allCompleted, effectiveEnergy, effectiveMood, todaysActivities.length]);

  const selectedMood = MOOD_OPTIONS.find((m) => m.value === effectiveMood);
  const selectedEnergy = ENERGY_OPTIONS.find((e) => e.value === effectiveEnergy);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 px-5 py-6 md:py-10">
      <div className="relative overflow-hidden rounded-2xl px-1 py-2">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-terracota/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-12 top-4 size-32 rounded-full bg-oliva/20 blur-3xl"
        />
        <h1 className="relative font-heading text-3xl font-medium text-foreground">
          {getGreeting()}, {name} 🌿
        </h1>
        {!checkedIn && (
          <p className="relative mt-1 text-sm text-muted-foreground">
            Como você está hoje?
          </p>
        )}
      </div>

      <VerseOfTheDayCard />
      <HealthSummaryCard />
      <ExerciseSummaryCard />

      {checkedIn ? (
        <button
          onClick={startEditing}
          className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 text-left text-sm text-muted-foreground shadow-sm ring-1 ring-foreground/[0.06] transition-shadow hover:shadow-md"
        >
          {selectedMood && <span>{selectedMood.emoji}</span>}
          {selectedEnergy && (
            <span className="flex items-center gap-0.5">
              <Zap className="size-3.5" /> {selectedEnergy.label}
            </span>
          )}
          {intention && <span className="truncate italic">&ldquo;{intention}&rdquo;</span>}
          <span className="ml-auto shrink-0 text-xs underline">editar</span>
        </button>
      ) : (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex flex-col gap-5">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">😊 Humor</p>
              <div className="flex justify-between gap-1">
                {MOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDraftMood(opt.value)}
                    aria-pressed={draftMood === opt.value}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xl transition-colors",
                      draftMood === opt.value ? "bg-secondary" : "hover:bg-muted"
                    )}
                    title={opt.label}
                  >
                    <span>{opt.emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">⚡ Energia</p>
              <div className="flex justify-between gap-1">
                {ENERGY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDraftEnergy(opt.value)}
                    aria-pressed={draftEnergy === opt.value}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-lg py-2 transition-colors",
                      draftEnergy === opt.value ? "bg-secondary" : "hover:bg-muted"
                    )}
                    title={opt.label}
                  >
                    <Zap
                      className="size-4"
                      style={{ opacity: 0.35 + opt.value * 0.13 }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">🌤 Intenção do dia</p>
              <input
                value={draftIntention}
                onChange={(e) => setDraftIntention(e.target.value)}
                placeholder="Hoje quero..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {INTENTION_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setDraftIntention(s)}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => draftMood !== null && draftEnergy !== null && checkIn(draftMood, draftEnergy, draftIntention)}
              disabled={draftMood === null || draftEnergy === null}
              className="rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
            >
              Continuar
            </button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col items-center gap-2 rounded-2xl bg-card px-5 py-6 shadow-sm ring-1 ring-foreground/[0.06]">
        <p className="text-sm font-medium text-foreground">Hoje</p>
        <ProgressRing value={pointsEarned} max={dailyGoalPoints}>
          <div className="flex flex-col items-center">
            <span className="font-heading text-3xl font-medium text-foreground">
              {pointsEarned}
            </span>
            <span className="text-xs text-muted-foreground">
              de {dailyGoalPoints} pontos
            </span>
          </div>
        </ProgressRing>
        <p className="text-sm tabular-nums text-muted-foreground">
          {progressPct}% da meta
        </p>
        {exercisePoints > 0 && (
          <p className="text-xs tabular-nums text-muted-foreground">
            Rotina: {routinePoints} pontos · Exercícios: {exercisePoints} pontos
          </p>
        )}
      </div>

      {message && (
        <div className="relative overflow-hidden rounded-2xl bg-marinho px-5 py-4 text-branco-quente">
          <span aria-hidden className="absolute -right-3 -top-3 text-5xl opacity-15">
            🌿
          </span>
          <p className="relative text-sm leading-snug">{message}</p>
        </div>
      )}

      {activitiesStatus === "loading" ? null : todaysActivities.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-marinho px-5 py-8 text-center text-branco-quente">
          <span aria-hidden className="text-4xl">
            🌿
          </span>
          <p className="mt-2 text-sm">
            Nada agendado pra hoje. Aproveite pra descansar, ou visite{" "}
            <Link href="/rotina" className="underline">
              Minha Rotina
            </Link>{" "}
            pra adicionar um hábito.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {todaysActivities.map((activity) => {
            const area = getLifeArea(activity.lifeAreaSlug);
            const completed = todayCompleted.has(activity.id);
            return (
              <label
                key={activity.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl bg-card px-3.5 py-3 shadow-sm ring-1 ring-foreground/[0.06] transition-all hover:shadow-md",
                  completed && "opacity-70"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    TONE_CLASSES[area.tone]
                  )}
                >
                  <area.icon className="size-4" />
                </span>
                <span
                  className={cn(
                    "flex-1 text-sm text-foreground",
                    completed && "text-muted-foreground line-through"
                  )}
                >
                  {activity.name}
                </span>
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  +{activity.points}
                </span>
                <Checkbox
                  checked={completed}
                  onCheckedChange={() => toggleToday(activity.id)}
                />
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
