"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useExercises } from "@/lib/exercises-context";
import { type Workout, plannedScore } from "@/types/exercise";
import { cn } from "@/lib/utils";

const MOOD_OPTIONS = [
  { value: 1, emoji: "😢" },
  { value: 2, emoji: "🙁" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "😀" },
] as const;

export function StartWorkoutSheet({
  workout,
  onOpenChange,
}: {
  workout: Workout | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { startSession } = useExercises();
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);

  return (
    <Sheet open={workout !== null} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        {workout && (
          <>
            <SheetHeader>
              <SheetTitle>{workout.name}</SheetTitle>
              <SheetDescription>
                {workout.exercises.length} exercícios · {plannedScore(workout)}{" "}
                pontos possíveis
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-4 px-4">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Como está seu humor?
                </p>
                <div className="flex justify-between gap-1">
                  {MOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMood(opt.value)}
                      className={cn(
                        "flex flex-1 items-center justify-center rounded-lg py-2 text-xl transition-colors",
                        mood === opt.value ? "bg-secondary" : "hover:bg-muted"
                      )}
                    >
                      {opt.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Como está sua energia?
                </p>
                <div className="flex justify-between gap-1">
                  {MOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setEnergy(opt.value)}
                      className={cn(
                        "flex flex-1 items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors",
                        energy === opt.value ? "bg-secondary" : "hover:bg-muted"
                      )}
                    >
                      {opt.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <SheetFooter>
              <Button
                disabled={mood === null || energy === null}
                onClick={() => {
                  startSession(workout, mood, energy);
                  onOpenChange(false);
                }}
              >
                Começar treino
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
