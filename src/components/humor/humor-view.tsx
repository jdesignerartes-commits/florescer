"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { SAMPLE_HISTORY } from "@/lib/sample-history";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
});

function average(values: number[]) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function HumorView() {
  const chartData = SAMPLE_HISTORY.map((d) => ({
    label: dateFormatter.format(new Date(d.date + "T12:00:00")),
    humor: Math.round(((d.moodStart + d.moodEnd) / 2) * 10) / 10,
    energia: Math.round(((d.energyStart + d.energyEnd) / 2) * 10) / 10,
  }));

  const moodAvg = average(
    SAMPLE_HISTORY.flatMap((d) => [d.moodStart, d.moodEnd])
  );
  const energyAvg = average(
    SAMPLE_HISTORY.flatMap((d) => [d.energyStart, d.energyEnd])
  );

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
          Humor
        </h1>
        <p className="relative mt-1 text-sm text-muted-foreground">
          Sua evolução de humor e energia.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-foreground/[0.06]">
          <p className="text-2xl font-medium tabular-nums text-terracota">
            {moodAvg.toFixed(1)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">humor médio</p>
        </div>
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-foreground/[0.06]">
          <p className="text-2xl font-medium tabular-nums text-terracota">
            {energyAvg.toFixed(1)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">energia média</p>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/[0.06]">
        <p className="mb-3 text-sm font-medium text-foreground">
          Últimos {chartData.length} dias
        </p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                interval={4}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="humor"
                stroke="var(--color-terracota)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="energia"
                stroke="var(--color-oliva)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-terracota" /> Humor
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-oliva" /> Energia
          </span>
        </div>
      </div>
    </div>
  );
}
