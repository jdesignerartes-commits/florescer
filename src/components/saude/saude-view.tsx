"use client";

import { useMemo, useState } from "react";
import { Plus, TriangleAlert, Trash2, Check, X } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useHealth } from "@/lib/health-context";
import { MeasurementForm } from "@/components/saude/measurement-form";
import {
  CONTEXT_LABELS,
  SYMPTOM_LABELS,
  ALERT_MESSAGES,
  getHealthAlert,
} from "@/types/health";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });

export function SaudeView() {
  const { measurements, deleteMeasurement, latest } = useHealth();
  const [formOpen, setFormOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...measurements].sort((a, b) =>
        `${b.measurementDate}${b.measurementTime}`.localeCompare(
          `${a.measurementDate}${a.measurementTime}`
        )
      ),
    [measurements]
  );

  const averages = useMemo(() => {
    if (measurements.length === 0) return null;
    const sys = measurements.reduce((s, m) => s + m.systolic, 0) / measurements.length;
    const dia = measurements.reduce((s, m) => s + m.diastolic, 0) / measurements.length;
    return { sys: Math.round(sys), dia: Math.round(dia) };
  }, [measurements]);

  const chartData = useMemo(
    () =>
      [...sorted]
        .reverse()
        .map((m) => ({
          label: dateFormatter.format(new Date(m.measurementDate + "T12:00:00")),
          sistólica: m.systolic,
          diastólica: m.diastolic,
        })),
    [sorted]
  );

  const latestAlert = latest ? getHealthAlert(latest) : null;

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
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-medium text-foreground">
              Minha Saúde
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pressão arterial e frequência cardíaca.
            </p>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            Nova
          </button>
        </div>
      </div>

      {latestAlert && (
        <div
          className={cn(
            "flex items-start gap-2.5 rounded-2xl px-4 py-3.5 text-sm",
            latestAlert === "urgent"
              ? "bg-destructive/10 text-destructive"
              : "bg-secondary text-foreground"
          )}
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>{ALERT_MESSAGES[latestAlert]}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-foreground/[0.06]">
          {latest ? (
            <>
              <p className="text-2xl font-medium tabular-nums text-terracota">
                {latest.systolic}/{latest.diastolic}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                última medição · {latest.measurementTime}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sem medições ainda</p>
          )}
        </div>
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-foreground/[0.06]">
          {averages ? (
            <>
              <p className="text-2xl font-medium tabular-nums text-terracota">
                {averages.sys}/{averages.dia}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">média geral</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </div>
      </div>

      {chartData.length > 1 && (
        <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/[0.06]">
          <p className="mb-3 text-sm font-medium text-foreground">Evolução</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="sistólica" stroke="var(--color-terracota)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="diastólica" stroke="var(--color-oliva)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {sorted.map((m) => {
          const alert = getHealthAlert(m);
          const confirming = confirmingId === m.id;
          return (
            <div
              key={m.id}
              className="flex flex-col gap-1.5 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/[0.06]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  {dateFormatter.format(new Date(m.measurementDate + "T12:00:00"))} ·{" "}
                  {m.measurementTime}
                </span>
                {confirming ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        deleteMeasurement(m.id);
                        setConfirmingId(null);
                      }}
                      className="flex size-6 items-center justify-center rounded-full bg-destructive/15 text-destructive"
                    >
                      <Check className="size-3" />
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingId(m.id)}
                    aria-label="Excluir"
                    className="flex size-6 items-center justify-center rounded-full text-muted-foreground/60 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
              <p className="text-xl font-medium tabular-nums text-foreground">
                {m.systolic}/{m.diastolic}{" "}
                <span className="text-xs font-normal text-muted-foreground">mmHg</span>
                {m.heartRate && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {m.heartRate} bpm
                  </span>
                )}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                {m.context && <span>{CONTEXT_LABELS[m.context]}</span>}
                {m.symptoms.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-muted px-2 py-0.5 text-secondary-foreground"
                  >
                    {SYMPTOM_LABELS[s]}
                  </span>
                ))}
              </div>
              {alert && (
                <p
                  className={cn(
                    "mt-1 text-xs",
                    alert === "urgent" ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {ALERT_MESSAGES[alert]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Esse espaço não substitui acompanhamento médico. Ele te ajuda a
        registrar e enxergar padrões — decisões de saúde continuam com você e
        seu médico.
      </p>

      <MeasurementForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
