"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type AsyncStatus = "loading" | "ready" | "error";

interface DayEntryContextValue {
  mood: number | null;
  energy: number | null;
  intention: string;
  checkedIn: boolean;
  checkIn: (mood: number, energy: number, intention: string) => void;
  editCheckIn: () => void;
  status: AsyncStatus;
  error: string | null;
}

const DayEntryContext = createContext<DayEntryContextValue | null>(null);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function DayEntryProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [intention, setIntention] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from("day_entries")
          .select("mood_start, energy_start, intention")
          .eq("entry_date", todayStr())
          .maybeSingle();
        if (err) throw err;
        if (cancelled) return;

        if (data && data.mood_start !== null && data.energy_start !== null) {
          setMood(data.mood_start);
          setEnergy(data.energy_start);
          setIntention(data.intention ?? "");
          setCheckedIn(true);
        }
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Erro ao carregar o check-in do dia.");
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  async function checkIn(newMood: number, newEnergy: number, newIntention: string) {
    const previous = { mood, energy, intention, checkedIn };
    setMood(newMood);
    setEnergy(newEnergy);
    setIntention(newIntention);
    setCheckedIn(true);

    const { error: err } = await supabase.from("day_entries").upsert(
      {
        user_id: userId,
        entry_date: todayStr(),
        mood_start: newMood,
        energy_start: newEnergy,
        intention: newIntention || null,
      },
      { onConflict: "user_id,entry_date" }
    );
    if (err) {
      setMood(previous.mood);
      setEnergy(previous.energy);
      setIntention(previous.intention);
      setCheckedIn(previous.checkedIn);
      setError(err.message);
    }
  }

  function editCheckIn() {
    setCheckedIn(false);
  }

  return (
    <DayEntryContext.Provider
      value={{ mood, energy, intention, checkedIn, checkIn, editCheckIn, status, error }}
    >
      {children}
    </DayEntryContext.Provider>
  );
}

export function useDayEntry() {
  const ctx = useContext(DayEntryContext);
  if (!ctx) {
    throw new Error("useDayEntry must be used within DayEntryProvider");
  }
  return ctx;
}
