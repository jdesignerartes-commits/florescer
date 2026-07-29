"use client";

import { Clock, Hourglass } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getLifeArea, TONE_CLASSES } from "@/lib/life-areas";
import { useActivities } from "@/lib/activities-context";
import { PRIORITY_LABELS } from "@/types/activity";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function HojeView() {
  const { todaysActivities, todayCompleted, toggleToday } = useActivities();

  const pointsEarned = todaysActivities
    .filter((a) => todayCompleted.has(a.id))
    .reduce((sum, a) => sum + a.points, 0);
  const pointsPossible = todaysActivities.reduce((sum, a) => sum + a.points, 0);
  const completedCount = todaysActivities.filter((a) =>
    todayCompleted.has(a.id)
  ).length;

  const today = dateFormatter.format(new Date());
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

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
          Hoje
        </h1>
        <p className="relative mt-1 text-sm text-muted-foreground">
          {todayCapitalized}
        </p>
      </div>

      {todaysActivities.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-sm font-medium text-foreground">
              {completedCount} de {todaysActivities.length} concluídas
            </span>
            <span className="text-sm tabular-nums text-muted-foreground">
              {pointsEarned} / {pointsPossible} pontos
            </span>
          </div>
          <Progress value={pointsEarned} max={Math.max(pointsPossible, 1)} />
        </div>
      )}

      {todaysActivities.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-marinho px-5 py-8 text-center text-branco-quente">
          <span aria-hidden className="text-4xl">
            🌿
          </span>
          <p className="mt-2 text-sm">
            Nada agendado pra hoje. Um dia mais leve também conta.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {todaysActivities.map((activity) => {
            const area = getLifeArea(activity.lifeAreaSlug);
            const completed = todayCompleted.has(activity.id);
            return (
              <label
                key={activity.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl bg-card px-3.5 py-3.5 shadow-sm ring-1 ring-foreground/[0.06] transition-all hover:shadow-md",
                  completed && "opacity-70"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                    TONE_CLASSES[area.tone]
                  )}
                >
                  <area.icon className="size-4" />
                </span>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium text-foreground",
                        completed && "text-muted-foreground line-through"
                      )}
                    >
                      {activity.name}
                    </span>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                      +{activity.points}
                    </span>
                  </div>

                  {activity.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    {activity.scheduledTime && (
                      <span className="inline-flex items-center gap-0.5">
                        <Clock className="size-3" />
                        {activity.scheduledTime}
                      </span>
                    )}
                    {activity.durationMinutes && (
                      <span className="inline-flex items-center gap-0.5">
                        <Hourglass className="size-3" />
                        {activity.durationMinutes} min
                      </span>
                    )}
                    {activity.isRequired && (
                      <span className="text-terracota">Obrigatória</span>
                    )}
                    {activity.priority === "alta" && (
                      <span>Prioridade {PRIORITY_LABELS.alta.toLowerCase()}</span>
                    )}
                  </div>
                </div>

                <Checkbox
                  checked={completed}
                  onCheckedChange={() => toggleToday(activity.id)}
                  className="mt-0.5"
                />
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
