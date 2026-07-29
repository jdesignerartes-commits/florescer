"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { type Activity, INITIAL_ACTIVITIES, isDueToday } from "@/types/activity";

interface ActivitiesContextValue {
  activities: Activity[];
  addActivity: (activity: Activity) => void;
  updateActivity: (activity: Activity) => void;
  deleteActivity: (id: string) => void;
  todayCompleted: Set<string>;
  toggleToday: (id: string) => void;
  todaysActivities: Activity[];
}

const ActivitiesContext = createContext<ActivitiesContextValue | null>(null);

function byScheduledTime(a: Activity, b: Activity) {
  if (!a.scheduledTime && !b.scheduledTime) return 0;
  if (!a.scheduledTime) return 1;
  if (!b.scheduledTime) return -1;
  return a.scheduledTime.localeCompare(b.scheduledTime);
}

export function ActivitiesProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [todayCompleted, setTodayCompleted] = useState<Set<string>>(new Set());

  function addActivity(activity: Activity) {
    setActivities((prev) => [...prev, activity]);
  }

  function updateActivity(activity: Activity) {
    setActivities((prev) =>
      prev.map((a) => (a.id === activity.id ? activity : a))
    );
  }

  function deleteActivity(id: string) {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setTodayCompleted((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function toggleToday(id: string) {
    setTodayCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const todaysActivities = useMemo(
    () => activities.filter((a) => isDueToday(a)).sort(byScheduledTime),
    [activities]
  );

  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        addActivity,
        updateActivity,
        deleteActivity,
        todayCompleted,
        toggleToday,
        todaysActivities,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  const ctx = useContext(ActivitiesContext);
  if (!ctx) {
    throw new Error("useActivities must be used within ActivitiesProvider");
  }
  return ctx;
}
