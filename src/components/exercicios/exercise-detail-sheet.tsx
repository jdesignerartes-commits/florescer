"use client";

import { Wind, TriangleAlert, AlertOctagon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { type Exercise, DIFFICULTY_LABELS } from "@/types/exercise";

export function ExerciseDetailSheet({
  exercise,
  open,
  onOpenChange,
}: {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto">
        {exercise && (
          <>
            <SheetHeader>
              <SheetTitle>{exercise.name}</SheetTitle>
              <SheetDescription>{exercise.objective}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-6">
              <div className="flex aspect-video items-center justify-center rounded-2xl bg-muted text-5xl">
                🧘🏽‍♀️
              </div>

              <div className="flex flex-wrap gap-1.5 text-xs">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
                  {exercise.muscleGroup}
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
                  {DIFFICULTY_LABELS[exercise.difficulty]}
                </span>
                {exercise.equipment && (
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
                    {exercise.equipment}
                  </span>
                )}
              </div>

              <div>
                <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Execução
                </p>
                <p className="text-sm text-foreground">{exercise.instructions}</p>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5">
                <Wind className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-sm text-foreground">{exercise.breathingInstructions}</p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Erros comuns
                </p>
                <p className="text-sm text-foreground">{exercise.commonMistakes}</p>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-destructive">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                <p className="text-sm">{exercise.precautions}</p>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function LibrarySafetyBanner() {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl bg-secondary/60 px-4 py-3 text-sm text-foreground">
      <AlertOctagon className="mt-0.5 size-4 shrink-0" />
      <p>
        Esse conteúdo não substitui fisioterapeuta ou educador físico. Não
        recomendamos exercícios pra limitações que você não nos contou.
      </p>
    </div>
  );
}
