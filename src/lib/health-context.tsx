"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { type HealthMeasurement } from "@/types/health";

function dateDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const INITIAL_MEASUREMENTS: HealthMeasurement[] = [
  {
    id: crypto.randomUUID(),
    measurementDate: dateDaysAgo(6),
    measurementTime: "07:15",
    systolic: 118,
    diastolic: 76,
    heartRate: 70,
    context: "ao_acordar",
    armUsed: "Esquerdo",
    bodyPosition: "Sentada",
    symptoms: [],
    feeling: 4,
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    measurementDate: dateDaysAgo(4),
    measurementTime: "13:30",
    systolic: 124,
    diastolic: 80,
    heartRate: 76,
    context: "pos_alimentacao",
    armUsed: "Esquerdo",
    bodyPosition: "Sentada",
    symptoms: [],
    feeling: 3,
    notes: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    measurementDate: dateDaysAgo(1),
    measurementTime: "21:00",
    systolic: 121,
    diastolic: 78,
    heartRate: 72,
    context: "antes_dormir",
    armUsed: "Esquerdo",
    bodyPosition: "Sentada",
    symptoms: [],
    feeling: 4,
    notes: "",
    createdAt: new Date().toISOString(),
  },
];

interface HealthContextValue {
  measurements: HealthMeasurement[];
  addMeasurement: (m: HealthMeasurement) => void;
  deleteMeasurement: (id: string) => void;
  latest: HealthMeasurement | null;
}

const HealthContext = createContext<HealthContextValue | null>(null);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>(
    INITIAL_MEASUREMENTS
  );

  function addMeasurement(m: HealthMeasurement) {
    setMeasurements((prev) => [m, ...prev]);
  }

  function deleteMeasurement(id: string) {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  }

  const latest = useMemo(() => {
    if (measurements.length === 0) return null;
    return [...measurements].sort((a, b) =>
      `${b.measurementDate}${b.measurementTime}`.localeCompare(
        `${a.measurementDate}${a.measurementTime}`
      )
    )[0];
  }, [measurements]);

  return (
    <HealthContext.Provider
      value={{ measurements, addMeasurement, deleteMeasurement, latest }}
    >
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error("useHealth must be used within HealthProvider");
  return ctx;
}
