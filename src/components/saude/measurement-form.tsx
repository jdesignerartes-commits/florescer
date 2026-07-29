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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHealth } from "@/lib/health-context";
import {
  type HealthMeasurement,
  type MeasurementContext,
  type Symptom,
  CONTEXT_LABELS,
  SYMPTOM_LABELS,
} from "@/types/health";
import { cn } from "@/lib/utils";

const FEELING_OPTIONS = [
  { value: 1, emoji: "😢" },
  { value: 2, emoji: "🙁" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "😀" },
] as const;

function emptyMeasurement(): HealthMeasurement {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    measurementDate: now.toISOString().slice(0, 10),
    measurementTime: now.toTimeString().slice(0, 5),
    systolic: 0,
    diastolic: 0,
    heartRate: null,
    context: null,
    armUsed: null,
    bodyPosition: null,
    symptoms: [],
    feeling: null,
    notes: "",
    createdAt: now.toISOString(),
  };
}

export function MeasurementForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto">
        <FormBody onDone={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}

function FormBody({ onDone }: { onDone: () => void }) {
  const { addMeasurement } = useHealth();
  const [form, setForm] = useState<HealthMeasurement>(emptyMeasurement());

  function update<K extends keyof HealthMeasurement>(
    key: K,
    value: HealthMeasurement[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSymptom(symptom: Symptom) {
    setForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  }

  const canSave = form.systolic > 0 && form.diastolic > 0;

  function handleSave() {
    addMeasurement(form);
    onDone();
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>Nova medição</SheetTitle>
        <SheetDescription>Pressão arterial.</SheetDescription>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m-date">Data</Label>
            <Input
              id="m-date"
              type="date"
              value={form.measurementDate}
              onChange={(e) => update("measurementDate", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m-time">Horário</Label>
            <Input
              id="m-time"
              type="time"
              value={form.measurementTime}
              onChange={(e) => update("measurementTime", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m-systolic">Sistólica (mmHg)</Label>
            <Input
              id="m-systolic"
              type="number"
              min={1}
              value={form.systolic || ""}
              onChange={(e) => update("systolic", Number(e.target.value) || 0)}
              placeholder="Ex: 120"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m-diastolic">Diastólica (mmHg)</Label>
            <Input
              id="m-diastolic"
              type="number"
              min={1}
              value={form.diastolic || ""}
              onChange={(e) => update("diastolic", Number(e.target.value) || 0)}
              placeholder="Ex: 80"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="m-hr">Frequência cardíaca (bpm) — opcional</Label>
          <Input
            id="m-hr"
            type="number"
            min={1}
            value={form.heartRate ?? ""}
            onChange={(e) =>
              update("heartRate", e.target.value ? Number(e.target.value) : null)
            }
            placeholder="Ex: 72"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Braço utilizado</Label>
            <Select
              value={form.armUsed ?? ""}
              onValueChange={(v) => update("armUsed", v as string)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Esquerdo">Esquerdo</SelectItem>
                <SelectItem value="Direito">Direito</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Posição</Label>
            <Select
              value={form.bodyPosition ?? ""}
              onValueChange={(v) => update("bodyPosition", v as string)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sentada">Sentada</SelectItem>
                <SelectItem value="Deitada">Deitada</SelectItem>
                <SelectItem value="Em pé">Em pé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Contexto da medição</Label>
          <Select
            value={form.context ?? ""}
            onValueChange={(v) => update("context", v as MeasurementContext)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolher">
                {(v: MeasurementContext) => CONTEXT_LABELS[v]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CONTEXT_LABELS) as MeasurementContext[]).map((c) => (
                <SelectItem key={c} value={c}>
                  {CONTEXT_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Sintomas percebidos</Label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(SYMPTOM_LABELS) as Symptom[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSymptom(s)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs transition-colors",
                  form.symptoms.includes(s)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {SYMPTOM_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Como você estava se sentindo?</Label>
          <div className="flex justify-between gap-1">
            {FEELING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("feeling", opt.value)}
                className={cn(
                  "flex flex-1 items-center justify-center rounded-lg py-2 text-xl transition-colors",
                  form.feeling === opt.value ? "bg-secondary" : "hover:bg-muted"
                )}
              >
                {opt.emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="m-notes">Observações</Label>
          <Textarea
            id="m-notes"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={2}
            placeholder="Opcional"
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
        <Button className="flex-1" disabled={!canSave} onClick={handleSave}>
          Salvar
        </Button>
      </SheetFooter>
    </>
  );
}
