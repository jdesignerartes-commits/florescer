"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useExercises } from "@/lib/exercises-context";
import {
  EXERCISE_LIBRARY,
  getExercise,
  type Workout,
  type WorkoutExercise,
  type ScoreMode,
} from "@/types/exercise";
import { WEEKDAY_LABELS } from "@/types/activity";
import { cn } from "@/lib/utils";

function emptyWorkout(): Workout {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    scheduledDays: [],
    active: true,
    exercises: [],
  };
}

export function WorkoutForm({
  open,
  onOpenChange,
  workout,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: Workout | null;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent key={workout?.id ?? "new"} className="flex flex-col overflow-y-auto">
        <FormBody
          initial={workout ?? emptyWorkout()}
          isEditing={workout !== null}
          onDone={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

function FormBody({
  initial,
  isEditing,
  onDone,
}: {
  initial: Workout;
  isEditing: boolean;
  onDone: () => void;
}) {
  const { addWorkout, updateWorkout } = useExercises();
  const [form, setForm] = useState<Workout>(initial);
  const [pickerOpen, setPickerOpen] = useState(false);

  function update<K extends keyof Workout>(key: K, value: Workout[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDay(day: number) {
    setForm((prev) => ({
      ...prev,
      scheduledDays: prev.scheduledDays.includes(day)
        ? prev.scheduledDays.filter((d) => d !== day)
        : [...prev.scheduledDays, day].sort(),
    }));
  }

  function addExercise(exerciseId: string) {
    const we: WorkoutExercise = {
      id: crypto.randomUUID(),
      exerciseId,
      orderIndex: form.exercises.length,
      sets: 3,
      repetitions: 12,
      durationSeconds: null,
      restSeconds: 30,
      sideMode: "nenhum",
      score: 10,
      scoreMode: "integral",
      notes: "",
    };
    setForm((prev) => ({ ...prev, exercises: [...prev.exercises, we] }));
    setPickerOpen(false);
  }

  function updateExercise(id: string, patch: Partial<WorkoutExercise>) {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }

  function removeExercise(id: string) {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((e) => e.id !== id),
    }));
  }

  function moveExercise(id: string, dir: -1 | 1) {
    setForm((prev) => {
      const list = [...prev.exercises];
      const i = list.findIndex((e) => e.id === id);
      const j = i + dir;
      if (j < 0 || j >= list.length) return prev;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...prev, exercises: list };
    });
  }

  const canSave = form.name.trim().length > 0 && form.exercises.length > 0;

  function handleSave() {
    if (isEditing) updateWorkout(form);
    else addWorkout(form);
    onDone();
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{isEditing ? "Editar treino" : "Novo treino"}</SheetTitle>
        <SheetDescription>Monte sua sequência de exercícios.</SheetDescription>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="w-name">Nome do treino</Label>
          <Input
            id="w-name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Ex: Pernas, Corpo inteiro..."
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="w-desc">Descrição</Label>
          <Textarea
            id="w-desc"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={2}
            placeholder="Opcional"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Dias da semana</Label>
          <div className="flex gap-1">
            {WEEKDAY_LABELS.map((label, day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  form.scheduledDays.includes(day)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label>Exercícios</Label>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
            >
              <Plus className="size-3.5" />
              Adicionar
            </button>
          </div>

          {form.exercises.length === 0 ? (
            <p className="rounded-lg bg-muted px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhum exercício ainda — adicione pelo menos um.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {form.exercises.map((we, i) => {
                const exercise = getExercise(we.exerciseId);
                const isDuration = !we.repetitions;
                return (
                  <div
                    key={we.id}
                    className="flex flex-col gap-2 rounded-xl bg-muted p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {exercise?.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveExercise(we.id, -1)}
                          disabled={i === 0}
                          className="flex size-6 items-center justify-center rounded-full text-muted-foreground disabled:opacity-30"
                        >
                          <ChevronUp className="size-3.5" />
                        </button>
                        <button
                          onClick={() => moveExercise(we.id, 1)}
                          disabled={i === form.exercises.length - 1}
                          className="flex size-6 items-center justify-center rounded-full text-muted-foreground disabled:opacity-30"
                        >
                          <ChevronDown className="size-3.5" />
                        </button>
                        <button
                          onClick={() => removeExercise(we.id)}
                          className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <label className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
                        Séries
                        <input
                          type="number"
                          min={1}
                          value={we.sets ?? ""}
                          onChange={(e) =>
                            updateExercise(we.id, { sets: Number(e.target.value) || 1 })
                          }
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                        />
                      </label>
                      <label className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
                        {isDuration ? "Segundos" : "Repetições"}
                        <input
                          type="number"
                          min={0}
                          value={
                            isDuration ? (we.durationSeconds ?? "") : (we.repetitions ?? "")
                          }
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            if (isDuration) updateExercise(we.id, { durationSeconds: val });
                            else updateExercise(we.id, { repetitions: val });
                          }}
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                        />
                      </label>
                      <label className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
                        Descanso (s)
                        <input
                          type="number"
                          min={0}
                          value={we.restSeconds ?? ""}
                          onChange={(e) =>
                            updateExercise(we.id, {
                              restSeconds: Number(e.target.value) || 0,
                            })
                          }
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateExercise(we.id, {
                            durationSeconds: isDuration ? null : we.durationSeconds,
                            repetitions: isDuration ? we.repetitions || 12 : null,
                          })
                        }
                        className="rounded-full bg-background px-2 py-1 text-[11px] text-muted-foreground"
                      >
                        {isDuration ? "Usar repetições" : "Usar duração"}
                      </button>
                      <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        Pontos
                        <input
                          type="number"
                          min={1}
                          value={we.score}
                          onChange={(e) =>
                            updateExercise(we.id, { score: Number(e.target.value) || 1 })
                          }
                          className="w-14 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          updateExercise(we.id, {
                            scoreMode:
                              we.scoreMode === "integral"
                                ? ("proporcional" as ScoreMode)
                                : ("integral" as ScoreMode),
                          })
                        }
                        className="ml-auto rounded-full bg-background px-2 py-1 text-[11px] text-muted-foreground"
                      >
                        {we.scoreMode === "integral" ? "Integral" : "Proporcional"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SheetFooter className="flex-row">
        <SheetClose
          className="flex-1"
          render={<Button variant="outline" className="w-full" />}
        >
          Cancelar
        </SheetClose>
        <Button className="flex-1" disabled={!canSave} onClick={handleSave}>
          Salvar
        </Button>
      </SheetFooter>

      {pickerOpen && (
        <div className="absolute inset-0 z-10 flex flex-col bg-popover">
          <div className="flex items-center justify-between border-b border-border p-4">
            <p className="font-heading text-base font-medium text-foreground">
              Escolher exercício
            </p>
            <button onClick={() => setPickerOpen(false)}>
              <X className="size-5 text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-2">
              {EXERCISE_LIBRARY.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => addExercise(ex.id)}
                  className="rounded-xl bg-muted p-3 text-left text-sm text-foreground hover:bg-secondary"
                >
                  {ex.name}
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {ex.muscleGroup}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
