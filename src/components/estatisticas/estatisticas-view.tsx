"use client";

import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { SAMPLE_HISTORY } from "@/lib/sample-history";
import { LIFE_AREAS } from "@/lib/life-areas";
import { getCurrentStreak, getTotalGrowthDays, getGardenProgress } from "@/lib/garden";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });

function productivity(days: typeof SAMPLE_HISTORY) {
  const earned = days.reduce((sum, d) => sum + d.pointsEarned, 0);
  const possible = days.reduce((sum, d) => sum + d.pointsPossible, 0);
  return possible > 0 ? Math.round((earned / possible) * 100) : 0;
}

export function EstatisticasView() {
  const last7 = SAMPLE_HISTORY.slice(-7);
  const last30 = SAMPLE_HISTORY;
  const streak = getCurrentStreak(SAMPLE_HISTORY);
  const totalGrowthDays = getTotalGrowthDays(SAMPLE_HISTORY);
  const { current } = getGardenProgress(totalGrowthDays);

  const areaTotals: Record<string, number> = {};
  for (const day of SAMPLE_HISTORY) {
    for (const [slug, pts] of Object.entries(day.areaPoints)) {
      areaTotals[slug] = (areaTotals[slug] ?? 0) + pts;
    }
  }
  const areaData = LIFE_AREAS.map((area) => ({
    name: area.name,
    pontos: areaTotals[area.slug] ?? 0,
  })).sort((a, b) => b.pontos - a.pontos);

  const topAreas = areaData.slice(0, 5);
  const leastAreas = [...areaData].reverse().slice(0, 3);

  const evolutionData = last30.map((d) => ({
    label: dateFormatter.format(new Date(d.date + "T12:00:00")),
    pct: Math.round((d.pointsEarned / d.pointsPossible) * 100),
  }));

  const daysCompleted = last30.filter((d) => d.grew).length;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-5 py-6 md:py-10">
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
          Estatísticas
        </h1>
        <p className="relative mt-1 text-sm text-muted-foreground">
          Como sua rotina tem caminhado.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-foreground/[0.06]">
          <p className="text-2xl font-medium tabular-nums text-terracota">
            {productivity(last7)}%
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">produtividade — 7 dias</p>
        </div>
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-foreground/[0.06]">
          <p className="text-2xl font-medium tabular-nums text-terracota">
            {productivity(last30)}%
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">produtividade — 30 dias</p>
        </div>
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-foreground/[0.06]">
          <p className="text-2xl font-medium tabular-nums text-terracota">{streak}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">sequência de dias</p>
        </div>
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-foreground/[0.06]">
          <p className="text-2xl font-medium tabular-nums text-terracota">
            {daysCompleted}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">dias de hábitos concluídos</p>
        </div>
      </div>

      <Link
        href="/jardim"
        className="flex items-center gap-3 rounded-2xl bg-marrom px-4 py-3.5 text-branco-quente shadow-sm transition-opacity hover:opacity-90"
      >
        <span className="text-2xl">{current.emoji}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">Jardim da Constância</p>
          <p className="text-xs opacity-80">
            {current.label} · {totalGrowthDays} dias de crescimento
          </p>
        </div>
        <span className="text-xs underline opacity-80">ver mais</span>
      </Link>

      <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/[0.06]">
        <p className="mb-3 text-sm font-medium text-foreground">
          Evolução — últimos 30 dias
        </p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolutionData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pctFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-terracota)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-terracota)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                interval={4}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => [`${value}%`, "Concluído"]}
              />
              <Area
                type="monotone"
                dataKey="pct"
                stroke="var(--color-terracota)"
                strokeWidth={2}
                fill="url(#pctFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/[0.06]">
        <p className="mb-3 text-sm font-medium text-foreground">Áreas mais cuidadas</p>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topAreas}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 11, fill: "var(--foreground)" }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="pontos" fill="var(--color-terracota)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {leastAreas.some((a) => a.pontos === 0) && (
        <div className="rounded-2xl bg-secondary/50 p-4">
          <p className="text-sm font-medium text-foreground">Áreas menos cuidadas</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {leastAreas.map((a) => a.name).join(", ")} — sem cobrança, só um
            lembrete gentil de que existem.
          </p>
        </div>
      )}
    </div>
  );
}
