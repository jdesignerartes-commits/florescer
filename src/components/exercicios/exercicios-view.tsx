"use client";

import { useState } from "react";
import { Plus, Play, Pencil, Trash2, Check, X, Clock } from "lucide-react";
import { SessionRunner } from "@/components/exercicios/session-runner";
import { StartWorkoutSheet } from "@/components/exercicios/start-workout-sheet";
import { WorkoutForm } from "@/components/exercicios/workout-form";
import { LibraryView } from "@/components/exercicios/library-view";
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

export function ExerciciosView() {
  const { workouts, deleteWorkout, sessions, activeSession, todayEarnedScore } =
    useExercises();
  const [starting, setStarting] = useState<Workout | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Workout | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  if (activeSession) {
    return <SessionRunner />;
  }

  const completedSessions = sessions.filter((s) => s.status === "concluido");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-6 md:py-10">
      <div className="relative overflow-hidden rounded-2xl px-1 py-2">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-terracota/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-12 top-4 size-32 rounded-full bg-oliva/20 blur-3xl"
        />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-medium text-foreground">
              Meus Exercícios
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {todayEarnedScore > 0
                ? `${todayEarnedScore} pontos de exercício hoje`
                : "Seus treinos e sua biblioteca."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Meus treinos</p>
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground"
          >
            <Plus className="size-3.5" />
            Novo treino
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {workouts.map((workout) => {
            const confirming = confirmingId === workout.id;
            return (
              <div
                key={workout.id}
                className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/[0.06]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{workout.name}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{workout.exercises.length} exercícios</span>
                    <span className="inline-flex items-center gap-0.5">
                      <Clock className="size-3" />
                      {estimatedMinutes(workout)} min
                    </span>
                    <span>{plannedScore(workout)} pontos</span>
                  </p>
                </div>
                {confirming ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => {
                        deleteWorkout(workout.id);
                        setConfirmingId(null);
                      }}
                      className="flex size-7 items-center justify-center rounded-full bg-destructive/15 text-destructive"
                    >
                      <Check className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => {
                        setEditing(workout);
                        setFormOpen(true);
                      }}
                      aria-label="Editar"
                      className="flex size-8 items-center justify-center rounded-full text-muted-foreground/70 hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmingId(workout.id)}
                      aria-label="Excluir"
                      className="flex size-8 items-center justify-center rounded-full text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setStarting(workout)}
                      aria-label="Começar treino"
                      className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    >
                      <Play className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {completedSessions.length > 0 && (
        <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/[0.06]">
          <p className="mb-2 text-sm font-medium text-foreground">
            Últimos treinos concluídos
          </p>
          <div className="flex flex-col gap-1.5">
            {completedSessions.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span>{s.workoutName}</span>
                <span className="tabular-nums">
                  {s.earnedScore}/{s.plannedScore} pontos
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">Biblioteca de exercícios</p>
        <LibraryView />
      </div>

      <StartWorkoutSheet workout={starting} onOpenChange={() => setStarting(null)} />
      <WorkoutForm open={formOpen} onOpenChange={setFormOpen} workout={editing} />
    </div>
  );
}
