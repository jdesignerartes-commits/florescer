"use client";

import { SAMPLE_HISTORY } from "@/lib/sample-history";
import { cn } from "@/lib/utils";

const MOOD_EMOJI: Record<number, string> = {
  1: "😢",
  2: "🙁",
  3: "😐",
  4: "🙂",
  5: "😀",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export function HistoricoView() {
  const days = [...SAMPLE_HISTORY].reverse();

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
          Histórico
        </h1>
        <p className="relative mt-1 text-sm text-muted-foreground">
          Seus últimos {days.length} dias.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {days.map((day) => {
          const pct = Math.round((day.pointsEarned / day.pointsPossible) * 100);
          const label = dateFormatter.format(new Date(day.date + "T12:00:00"));
          return (
            <div
              key={day.date}
              className="flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/[0.06]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground capitalize">
                  {label}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {MOOD_EMOJI[day.moodStart]} → {MOOD_EMOJI[day.moodEnd]}
                  </span>
                  <span className="tabular-nums">
                    {day.pointsEarned}/{day.pointsPossible} pontos
                  </span>
                  {day.grew && <span title="Jardim cresceu">🌱</span>}
                </div>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full bg-primary transition-all"
                  )}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              {(day.gratitude || day.reflection) && (
                <div className="flex flex-col gap-1 pt-1 text-xs text-muted-foreground">
                  {day.gratitude && <p>🙏 {day.gratitude}</p>}
                  {day.reflection && <p>💭 {day.reflection}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
