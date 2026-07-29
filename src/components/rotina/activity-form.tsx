"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LIFE_AREAS } from "@/lib/life-areas";
import {
  type Activity,
  type Priority,
  type Recurrence,
  PRIORITY_LABELS,
  RECURRENCE_LABELS,
  WEEKDAY_LABELS,
} from "@/types/activity";
import { cn } from "@/lib/utils";

const POINT_PRESETS = [5, 10, 15, 20, 30];

function emptyActivity(): Activity {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    lifeAreaSlug: LIFE_AREAS[0].slug,
    scheduledTime: null,
    durationMinutes: null,
    priority: "media",
    points: 10,
    recurrence: "diaria",
    weekDays: [],
    monthDay: 1,
    notes: "",
    isRequired: false,
  };
}

export function ActivityForm({
  open,
  onOpenChange,
  activity,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity | null;
  onSave: (activity: Activity) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        key={activity?.id ?? "new"}
        className="flex flex-col overflow-y-auto"
      >
        <ActivityFormBody
          initial={activity ?? emptyActivity()}
          isEditing={activity !== null}
          onSave={(a) => {
            onSave(a);
            onOpenChange(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

function ActivityFormBody({
  initial,
  isEditing,
  onSave,
}: {
  initial: Activity;
  isEditing: boolean;
  onSave: (activity: Activity) => void;
}) {
  const [form, setForm] = useState<Activity>(initial);
  const [customPoints, setCustomPoints] = useState(
    !POINT_PRESETS.includes(initial.points)
  );

  function update<K extends keyof Activity>(key: K, value: Activity[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleWeekDay(day: number) {
    setForm((prev) => ({
      ...prev,
      weekDays: prev.weekDays.includes(day)
        ? prev.weekDays.filter((d) => d !== day)
        : [...prev.weekDays, day].sort(),
    }));
  }

  const canSave = form.name.trim().length > 0 && form.points > 0;

  return (
    <>
      <SheetHeader>
        <SheetTitle>{isEditing ? "Editar atividade" : "Nova atividade"}</SheetTitle>
        <SheetDescription>
          {isEditing
            ? "Ajuste os detalhes dessa atividade da sua rotina."
            : "Adicione um novo hábito à sua rotina recorrente."}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Ex: Caminhada, Ler, Beber água..."
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Categoria</Label>
          <Select
            value={form.lifeAreaSlug}
            onValueChange={(v) => update("lifeAreaSlug", v as string)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolha uma área">
                {(v: string) => LIFE_AREAS.find((a) => a.slug === v)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LIFE_AREAS.map((area) => (
                <SelectItem key={area.slug} value={area.slug}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Opcional"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="time">Horário</Label>
            <Input
              id="time"
              type="time"
              value={form.scheduledTime ?? ""}
              onChange={(e) => update("scheduledTime", e.target.value || null)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="duration">Duração (min)</Label>
            <Input
              id="duration"
              type="number"
              min={0}
              step={5}
              value={form.durationMinutes ?? ""}
              onChange={(e) =>
                update(
                  "durationMinutes",
                  e.target.value ? Number(e.target.value) : null
                )
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Prioridade</Label>
          <Select
            value={form.priority}
            onValueChange={(v) => update("priority", v as Priority)}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v: Priority) => PRIORITY_LABELS[v]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Pontuação</Label>
          <div className="flex flex-wrap gap-1.5">
            {POINT_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setCustomPoints(false);
                  update("points", p);
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  !customPoints && form.points === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCustomPoints(true)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                customPoints
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              Personalizado
            </button>
          </div>
          {customPoints && (
            <Input
              type="number"
              min={1}
              value={form.points}
              onChange={(e) => update("points", Number(e.target.value) || 0)}
              className="mt-1 w-28"
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Recorrência</Label>
          <Select
            value={form.recurrence}
            onValueChange={(v) => update("recurrence", v as Recurrence)}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v: Recurrence) => RECURRENCE_LABELS[v]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(RECURRENCE_LABELS) as Recurrence[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {RECURRENCE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {form.recurrence === "semanal" && (
            <div className="mt-1 flex gap-1">
              {WEEKDAY_LABELS.map((label, day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWeekDay(day)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                    form.weekDays.includes(day)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {form.recurrence === "mensal" && (
            <Input
              type="number"
              min={1}
              max={31}
              value={form.monthDay ?? 1}
              onChange={(e) => update("monthDay", Number(e.target.value) || 1)}
              className="mt-1 w-28"
              aria-label="Dia do mês"
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Opcional"
            rows={2}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted px-3.5 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Atividade obrigatória
            </p>
            <p className="text-xs text-muted-foreground">
              Precisa ser concluída para o dia &ldquo;crescer&rdquo; o Jardim
            </p>
          </div>
          <Switch
            checked={form.isRequired}
            onCheckedChange={(checked) => update("isRequired", checked === true)}
          />
        </div>
      </div>

      <SheetFooter className="flex-row">
        <SheetClose
          className="flex-1"
          render={<Button variant="outline" className="w-full" />}
        >
          Cancelar
        </SheetClose>
        <Button
          className="flex-1"
          disabled={!canSave}
          onClick={() => onSave(form)}
        >
          Salvar
        </Button>
      </SheetFooter>
    </>
  );
}
