"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

interface SettingsContextValue {
  name: string;
  setName: (name: string) => void;
  dailyGoalPoints: number;
  setDailyGoalPoints: (points: number) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState("Joyce");
  const [dailyGoalPoints, setDailyGoalPoints] = useState(100);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <SettingsContext.Provider
      value={{
        name,
        setName,
        dailyGoalPoints,
        setDailyGoalPoints,
        theme,
        setTheme,
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
