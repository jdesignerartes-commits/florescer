"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Theme = "light" | "dark";
export type AsyncStatus = "loading" | "ready" | "error";

interface SettingsContextValue {
  name: string;
  setName: (name: string) => void;
  dailyGoalPoints: number;
  setDailyGoalPoints: (points: number) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  status: AsyncStatus;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);
const THEME_STORAGE_KEY = "florescer.theme";
const SAVE_DEBOUNCE_MS = 600;

export function SettingsProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [name, setNameState] = useState("");
  const [dailyGoalPoints, setDailyGoalPointsState] = useState(100);
  const [theme, setThemeState] = useState<Theme>("light");
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const nameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    // SSR não tem window, então isso só pode ser lido depois do mount —
    // setState aqui é necessário, não um efeito evitável.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "light" || stored === "dark") setThemeState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setError(null);
      const { data, error: err } = await supabase
        .from("profiles")
        .select("name, daily_goal_points")
        .eq("id", userId)
        .single();
      if (cancelled) return;
      if (err) {
        setError(err.message);
        setStatus("error");
        return;
      }
      setNameState(data.name);
      setDailyGoalPointsState(data.daily_goal_points);
      setStatus("ready");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  function setName(next: string) {
    setNameState(next);
    if (nameTimer.current) clearTimeout(nameTimer.current);
    nameTimer.current = setTimeout(async () => {
      const { error: err } = await supabase
        .from("profiles")
        .update({ name: next })
        .eq("id", userId);
      if (err) setError(err.message);
    }, SAVE_DEBOUNCE_MS);
  }

  function setDailyGoalPoints(next: number) {
    setDailyGoalPointsState(next);
    if (goalTimer.current) clearTimeout(goalTimer.current);
    goalTimer.current = setTimeout(async () => {
      const { error: err } = await supabase
        .from("profiles")
        .update({ daily_goal_points: next })
        .eq("id", userId);
      if (err) setError(err.message);
    }, SAVE_DEBOUNCE_MS);
  }

  function setTheme(next: Theme) {
    setThemeState(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  }

  return (
    <SettingsContext.Provider
      value={{
        name,
        setName,
        dailyGoalPoints,
        setDailyGoalPoints,
        theme,
        setTheme,
        status,
        error,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
