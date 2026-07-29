"use client";

import { useState } from "react";
import { Plus, Clock, Trash2, X, Check } from "lucide-react";
import { ActivityForm } from "@/components/rotina/activity-form";
import { getLifeArea, TONE_CLASSES } from "@/lib/life-areas";
import { useActivities } from "@/lib/activities-context";
import { type Activity, PRIORITY_LABELS, recurrenceSummary } from "@/types/activity";
import { cn } from "@/lib/utils";

export function RotinaManager() {
  const { activities, addActivity, updateActivity, deleteActivity } =
    useActivities();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(activity: Activity) {
    setEditing(activity);
    setFormOpen(true);
  }

  function handleSave(activity: Activity) {
    const exists = activities.some((a) => a.id === activity.id);
    if (exists) updateActivity(activity);
    else addActivity(activity);
  }

  function handleDelete(id: string) {
    deleteActivity(id);
    setConfirmingId(null);
  }

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
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-medium text-foreground">
              Minha Rotina
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Suas atividades recorrentes.
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            Nova
          </button>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-marrom px-5 py-8 text-center text-branco-quente">
          <span aria-hidden className="text-4xl">
            🌱
          </span>
          <p className="mt-2 text-sm">
            Sua rotina está em branco. Que tal plantar o primeiro hábito?
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {activities.map((activity) => {
            const area = getLifeArea(activity.lifeAreaSlug);
            const confirming = confirmingId === activity.id;

            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 rounded-2xl bg-card px-3.5 py-3 shadow-sm ring-1 ring-foreground/[0.06]"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    TONE_CLASSES[area.tone]
                  )}
                >
                  <area.icon className="size-4" />
                </span>

                <button
                  onClick={() => openEdit(activity)}
                  className="flex-1 text-left"
                >
                  <p className="text-sm font-medium text-foreground">
                    {activity.name}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                    {activity.scheduledTime && (
                      <span className="inline-flex items-center gap-0.5">
                        <Clock className="size-3" />
                        {activity.scheduledTime}
                      </span>
                    )}
                    <span>{recurrenceSummary(activity)}</span>
                    {activity.isRequired && (
                      <span className="text-terracota">· Obrigatória</span>
                    )}
                    {activity.priority === "alta" && (
                      <span>· Prioridade {PRIORITY_LABELS.alta.toLowerCase()}</span>
                    )}
                  </p>
                </button>

                <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                  +{activity.points}
                </span>

                {confirming ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => handleDelete(activity.id)}
                      aria-label="Confirmar exclusão"
                      className="flex size-7 items-center justify-center rounded-full bg-destructive/15 text-destructive"
                    >
                      <Check className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      aria-label="Cancelar"
                      className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingId(activity.id)}
                    aria-label="Excluir"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ActivityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        activity={editing}
        onSave={handleSave}
      />
    </div>
  );
}
