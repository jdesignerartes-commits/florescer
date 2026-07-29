"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  ExerciseDetailSheet,
  LibrarySafetyBanner,
} from "@/components/exercicios/exercise-detail-sheet";
import { EXERCISE_LIBRARY, DIFFICULTY_LABELS, type Exercise } from "@/types/exercise";
import { ExerciseFigure } from "@/components/exercicios/exercise-figure";
import { cn } from "@/lib/utils";

const MUSCLE_GROUPS = Array.from(
  new Set(EXERCISE_LIBRARY.map((e) => e.muscleGroup))
).sort();

export function LibraryView() {
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("todos");
  const [selected, setSelected] = useState<Exercise | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISE_LIBRARY.filter((e) => {
      if (groupFilter !== "todos" && e.muscleGroup !== groupFilter) return false;
      if (!q) return true;
      return e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q);
    });
  }, [query, groupFilter]);

  return (
    <div className="flex flex-col gap-4">
      <LibrarySafetyBanner />

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar exercício..."
          className="w-full rounded-lg border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setGroupFilter("todos")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            groupFilter === "todos"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          Todos
        </button>
        {MUSCLE_GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setGroupFilter(g)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              groupFilter === g
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {filtered.map((exercise) => (
          <button
            key={exercise.id}
            onClick={() => setSelected(exercise)}
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-3 text-center shadow-sm ring-1 ring-foreground/[0.06] transition-shadow hover:shadow-md"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-oliva/15 p-1.5">
              <ExerciseFigure exerciseId={exercise.id} className="h-full" />
            </span>
            <span className="text-xs font-medium text-foreground">
              {exercise.name}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {DIFFICULTY_LABELS[exercise.difficulty]}
            </span>
          </button>
        ))}
      </div>

      <ExerciseDetailSheet
        exercise={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
