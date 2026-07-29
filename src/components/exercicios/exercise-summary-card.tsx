"use client";

import { useState } from "react";
import { Dumbbell, Clock, Play } from "lucide-react";
import { StartWorkoutSheet } from "@/components/exercicios/start-workout-sheet";
import { useExercises } from "@/lib/exercises-context";
import { plannedScore, type Workout } from "@/types/exercise";

function estimatedMinutes(workout: Workout) {
  const seconds = workout.exercises.reduce((sum, we) => {
    const work = we.durationSeconds ?? (we.repetitions ?? 10) * 3;
    const rest = we.restSeconds ?? 0;
    return sum + (work + rest) * (we.sets ?? 1);
  }, 0);
  return Math.max(1, Math.round(seconds / 60));
}

export function ExerciseSummaryCard() {
  const { workouts, activeSession } = useExercises();
  const [starting, setStarting] = useState<Workout | null>(null);

  if (activeSession || workouts.length === 0) return null;

  const today = new Date().getDay();
  const workout =
    workouts.find((w) => w.scheduledDays.includes(today)) ?? workouts[0];

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3.5 shadow-sm ring-1 ring-foreground/[0.06]">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-oliva/15 text-oliva">
        <Dumbbell className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Exercícios
        </p>
        <p className="mt-0.5 text-sm text-foreground">{workout.name}</p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{workout.exercises.length} exercícios</span>
          <span className="inline-flex items-center gap-0.5">
            <Clock className="size-3" />
            {estimatedMinutes(workout)} min
          </span>
          <span>{plannedScore(workout)} pontos</span>
        </p>
      </div>
      <button
        onClick={() => setStarting(workout)}
        aria-label="Começar treino"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
      >
        <Play className="size-4" />
      </button>

      <StartWorkoutSheet workout={starting} onOpenChange={() => setStarting(null)} />
    </div>
  );
}
