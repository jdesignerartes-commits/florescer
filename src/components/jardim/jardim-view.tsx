"use client";

import { SAMPLE_HISTORY } from "@/lib/sample-history";
import {
  GARDEN_STAGES,
  getGardenProgress,
  getCurrentStreak,
  getTotalGrowthDays,
} from "@/lib/garden";
import { cn } from "@/lib/utils";

export function JardimView() {
  const totalGrowthDays = getTotalGrowthDays(SAMPLE_HISTORY);
  const streak = getCurrentStreak(SAMPLE_HISTORY);
  const { current, next, daysToNext } = getGardenProgress(totalGrowthDays);
  const last14 = SAMPLE_HISTORY.slice(-14);

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
          Jardim da Constância
        </h1>
        <p className="relative mt-1 text-sm text-muted-foreground">
          Cada dia de cuidado faz sua planta crescer.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 rounded-2xl bg-card py-10 shadow-sm ring-1 ring-foreground/[0.06]">
        <span className="text-7xl">{current.emoji}</span>
        <p className="font-heading text-xl font-medium text-foreground">
          {current.label}
        </p>
        <p className="text-sm tabular-nums text-muted-foreground">
          {totalGrowthDays} {totalGrowthDays === 1 ? "dia" : "dias"} de crescimento
        </p>
        {next && (
          <p className="mt-1 text-xs text-muted-foreground">
            Faltam {daysToNext} dias pra virar {next.label.toLowerCase()} {next.emoji}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-foreground/[0.06]">
          <p className="text-2xl font-medium tabular-nums text-terracota">{streak}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {streak === 1 ? "dia seguido" : "dias seguidos"}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-foreground/[0.06]">
          <p className="text-2xl font-medium tabular-nums text-terracota">
            {totalGrowthDays}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">dias de crescimento</p>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/[0.06]">
        <p className="mb-3 text-sm font-medium text-foreground">Últimos 14 dias</p>
        <div className="flex flex-wrap gap-2">
          {last14.map((day) => (
            <span
              key={day.date}
              title={day.date}
              className={cn(
                "size-5 rounded-full",
                day.grew ? "bg-oliva" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Estágios
        </p>
        <div className="flex flex-col gap-1.5 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-foreground/[0.06]">
          {GARDEN_STAGES.map((stage) => (
            <div
              key={stage.key}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-1.5",
                stage.key === current.key && "bg-secondary/60"
              )}
            >
              <span className="text-xl">{stage.emoji}</span>
              <span className="flex-1 text-sm text-foreground">{stage.label}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {stage.min} {stage.min === 1 ? "dia" : "dias"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Um dia difícil nunca faz a planta murchar — ela só deixa de crescer
        naquele dia. Sem culpa, sem pressão.
      </p>
    </div>
  );
}
