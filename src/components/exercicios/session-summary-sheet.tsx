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
import { Textarea } from "@/components/ui/textarea";
import { useExercises } from "@/lib/exercises-context";
import {
  EFFORT_LABELS,
  DISCOMFORT_LABELS,
  type PerceivedEffort,
  type Discomfort,
  type WorkoutSession,
} from "@/types/exercise";
import { cn } from "@/lib/utils";

const MOOD_OPTIONS = [
  { value: 1, emoji: "😢" },
  { value: 2, emoji: "🙁" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "😀" },
] as const;

export function SessionSummarySheet({
  session,
  open,
  onOpenChange,
}: {
  session: WorkoutSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { finishSession } = useExercises();
  const [effort, setEffort] = useState<PerceivedEffort | null>(null);
  const [discomfort, setDiscomfort] = useState<Discomfort>("nenhum");
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [energyAfter, setEnergyAfter] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const hasDiscomfort = discomfort !== "nenhum";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85svh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Como foi o treino?</SheetTitle>
          <SheetDescription>
            {session.earnedScore} de {session.plannedScore} pontos conquistados.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4 pb-4">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Nível de esforço</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(EFFORT_LABELS) as PerceivedEffort[]).map((e) => (
                <button
                  key={e}
                  onClick={() => setEffort(e)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs transition-colors",
                    effort === e
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {EFFORT_LABELS[e]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              Sentiu algum desconforto?
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(DISCOMFORT_LABELS) as Discomfort[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDiscomfort(d)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs transition-colors",
                    discomfort === d
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {DISCOMFORT_LABELS[d]}
                </button>
              ))}
            </div>
            {hasDiscomfort && (
              <p className="mt-2 text-xs text-destructive">
                Interrompa a atividade e, se o desconforto persistir ou for
                intenso, procure avaliação profissional.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Humor depois</p>
              <div className="flex justify-between gap-0.5">
                {MOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMoodAfter(opt.value)}
                    className={cn(
                      "flex flex-1 items-center justify-center rounded-lg py-1.5 text-lg transition-colors",
                      moodAfter === opt.value ? "bg-secondary" : "hover:bg-muted"
                    )}
                  >
                    {opt.emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Energia depois</p>
              <div className="flex justify-between gap-0.5">
                {MOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setEnergyAfter(opt.value)}
                    className={cn(
                      "flex flex-1 items-center justify-center rounded-lg py-1.5 text-sm font-medium transition-colors",
                      energyAfter === opt.value ? "bg-secondary" : "hover:bg-muted"
                    )}
                  >
                    {opt.value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações (opcional)"
              rows={2}
            />
          </div>
        </div>

        <SheetFooter>
          <Button
            onClick={() =>
              finishSession({
                perceivedEffort: effort,
                discomfort,
                moodAfter,
                energyAfter,
                notes,
              })
            }
          >
            Concluir
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
