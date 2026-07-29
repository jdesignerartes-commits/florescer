"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Plus, Check } from "lucide-react";
import { RestTimer } from "@/components/exercicios/rest-timer";
import { SessionSummarySheet } from "@/components/exercicios/session-summary-sheet";
import { useExercises } from "@/lib/exercises-context";
import { getExercise, SAFETY_NOTICE } from "@/types/exercise";
import { isExerciseComplete, completeSet } from "@/lib/workout-scoring";
import { cn } from "@/lib/utils";

export function SessionRunner() {
  const { activeSession, activeWorkout, completeSetFor, addRepFor, abandonSession } =
    useExercises();
  const [index, setIndex] = useState(0);
  const [restingFor, setRestingFor] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  if (!activeSession || !activeWorkout) return null;

  const total = activeWorkout.exercises.length;
  const we = activeWorkout.exercises[index];
  const exercise = getExercise(we.exerciseId);
  const progress = activeSession.progress.find(
    (p) => p.workoutExerciseId === we.id
  )!;
  const complete = isExerciseComplete(we, progress);
  const isDurationBased = !we.repetitions && !!we.durationSeconds;

  function goTo(i: number) {
    setRestingFor(null);
    setIndex(Math.max(0, Math.min(total - 1, i)));
  }

  function handleCompleteSet() {
    // completeSetFor commits to context async, então pra decidir se mostra o
    // descanso calculamos o próximo estado aqui também (mesma função pura),
    // em vez de olhar o `progress` de antes da atualização.
    const nextProgress = completeSet(we, progress);
    completeSetFor(we.id);
    if (we.restSeconds && we.restSeconds > 0 && !isExerciseComplete(we, nextProgress)) {
      setRestingFor(we.id);
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 px-5 py-6 md:py-10">
      <div className="flex items-center justify-between">
        <button
          onClick={abandonSession}
          className="flex items-center gap-1 text-sm text-muted-foreground"
        >
          <X className="size-4" />
          Sair
        </button>
        <p className="text-xs tabular-nums text-muted-foreground">
          Exercício {index + 1} de {total}
        </p>
      </div>

      <div className="flex gap-1.5">
        {activeWorkout.exercises.map((e, i) => {
          const p = activeSession.progress.find((x) => x.workoutExerciseId === e.id)!;
          return (
            <span
              key={e.id}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                isExerciseComplete(e, p)
                  ? "bg-oliva"
                  : i === index
                    ? "bg-primary"
                    : "bg-muted"
              )}
            />
          );
        })}
      </div>

      {restingFor === we.id ? (
        <RestTimer seconds={we.restSeconds ?? 30} onDone={() => setRestingFor(null)} />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-6 text-center shadow-sm ring-1 ring-foreground/[0.06]">
          <span className="flex size-16 items-center justify-center rounded-full bg-oliva/15 text-3xl">
            🧘🏽‍♀️
          </span>
          <h2 className="font-heading text-xl font-medium text-foreground">
            {exercise?.name}
          </h2>
          {we.sideMode !== "nenhum" && (
            <p className="text-xs text-muted-foreground">
              {we.sideMode === "ambos" ? "Alterne os lados" : `Lado ${we.sideMode}`}
            </p>
          )}
          <p className="text-sm text-muted-foreground">{exercise?.instructions}</p>

          <div className="mt-2 w-full rounded-xl bg-muted p-4">
            <p className="text-lg font-medium text-foreground">
              {we.sets ?? 1} série{(we.sets ?? 1) > 1 ? "s" : ""} de{" "}
              {isDurationBased ? `${we.durationSeconds}s` : `${we.repetitions} repetições`}
            </p>
            <p className="mt-1 text-sm tabular-nums text-muted-foreground">
              Série {Math.min(progress.completedSets + 1, we.sets ?? 1)} de {we.sets ?? 1}
              {!isDurationBased &&
                ` · ${progress.completedRepetitions} de ${
                  (we.sets ?? 1) * (we.repetitions ?? 0)
                } repetições`}
            </p>
          </div>

          <div className="flex w-full gap-2">
            {!isDurationBased && !complete && (
              <button
                onClick={() => addRepFor(we.id)}
                className="flex-1 rounded-lg bg-muted py-2.5 text-sm font-medium text-foreground"
              >
                <Plus className="mr-1 inline size-4" />
                1 repetição
              </button>
            )}
            <button
              onClick={handleCompleteSet}
              disabled={complete}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {complete ? (
                <>
                  <Check className="mr-1 inline size-4" />
                  Concluído
                </>
              ) : (
                "Concluir série"
              )}
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">{SAFETY_NOTICE}</p>

      <div className="flex gap-2">
        <button
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-muted py-2.5 text-sm text-foreground disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
          Voltar
        </button>
        {index < total - 1 ? (
          <button
            onClick={() => goTo(index + 1)}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-muted py-2.5 text-sm text-foreground"
          >
            Próximo
            <ChevronRight className="size-4" />
          </button>
        ) : (
          <button
            onClick={() => setSummaryOpen(true)}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground"
          >
            Finalizar treino
          </button>
        )}
      </div>
      {index < total - 1 && (
        <button
          onClick={() => setSummaryOpen(true)}
          className="text-center text-xs text-muted-foreground underline"
        >
          Finalizar treino agora
        </button>
      )}

      <SessionSummarySheet
        session={activeSession}
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
      />
    </div>
  );
}
