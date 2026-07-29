"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { type Activity, isDueToday } from "@/types/activity";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

export type AsyncStatus = "loading" | "ready" | "error";

type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];

interface ActivitiesContextValue {
  activities: Activity[];
  addActivity: (activity: Activity) => void;
  updateActivity: (activity: Activity) => void;
  deleteActivity: (id: string) => void;
  todayCompleted: Set<string>;
  toggleToday: (id: string) => void;
  todaysActivities: Activity[];
  status: AsyncStatus;
  error: string | null;
}

const ActivitiesContext = createContext<ActivitiesContextValue | null>(null);

function byScheduledTime(a: Activity, b: Activity) {
  if (!a.scheduledTime && !b.scheduledTime) return 0;
  if (!a.scheduledTime) return 1;
  if (!b.scheduledTime) return -1;
  return a.scheduledTime.localeCompare(b.scheduledTime);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function fromRow(row: ActivityRow, lifeAreaSlugById: Map<string, string>): Activity {
  const config = row.recurrence_config as
    | { days_of_week?: number[]; day_of_month?: number }
    | null;
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    lifeAreaSlug: lifeAreaSlugById.get(row.life_area_id) ?? "saude",
    scheduledTime: row.scheduled_time ? row.scheduled_time.slice(0, 5) : null,
    durationMinutes: row.duration_minutes,
    priority: row.priority,
    points: row.points,
    recurrence: row.recurrence,
    weekDays: row.recurrence === "semanal" ? (config?.days_of_week ?? []) : [],
    monthDay: row.recurrence === "mensal" ? (config?.day_of_month ?? null) : null,
    notes: row.notes ?? "",
    isRequired: row.is_required,
  };
}

function toRow(
  activity: Activity,
  userId: string,
  lifeAreaIdBySlug: Map<string, string>
): Database["public"]["Tables"]["activities"]["Insert"] {
  let recurrenceConfig: { days_of_week: number[] } | { day_of_month: number | null } | null =
    null;
  if (activity.recurrence === "semanal") {
    recurrenceConfig = { days_of_week: activity.weekDays };
  } else if (activity.recurrence === "mensal") {
    recurrenceConfig = { day_of_month: activity.monthDay };
  }

  return {
    id: activity.id,
    user_id: userId,
    life_area_id: lifeAreaIdBySlug.get(activity.lifeAreaSlug) ?? "",
    name: activity.name,
    description: activity.description || null,
    scheduled_time: activity.scheduledTime,
    duration_minutes: activity.durationMinutes,
    priority: activity.priority,
    points: activity.points,
    recurrence: activity.recurrence,
    recurrence_config: recurrenceConfig,
    is_required: activity.isRequired,
    notes: activity.notes || null,
    active: true,
  };
}

export function ActivitiesProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [todayCompleted, setTodayCompleted] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const lifeAreaIdBySlug = useRef<Map<string, string>>(new Map());
  const lifeAreaSlugById = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setError(null);
      try {
        const [{ data: areas, error: areasErr }, { data: rows, error: rowsErr }] =
          await Promise.all([
            supabase.from("life_areas").select("id, slug"),
            supabase.from("activities").select("*").eq("active", true),
          ]);
        if (areasErr) throw areasErr;
        if (rowsErr) throw rowsErr;
        if (cancelled) return;

        lifeAreaIdBySlug.current = new Map((areas ?? []).map((a) => [a.slug, a.id]));
        lifeAreaSlugById.current = new Map((areas ?? []).map((a) => [a.id, a.slug]));

        const mapped = (rows ?? []).map((r) => fromRow(r, lifeAreaSlugById.current));
        setActivities(mapped);

        const today = todayStr();
        const due = mapped.filter((a) => isDueToday(a));
        if (due.length > 0) {
          const materializeRows = due.map((a) => ({
            user_id: userId,
            activity_id: a.id,
            life_area_id: lifeAreaIdBySlug.current.get(a.lifeAreaSlug) ?? "",
            scheduled_date: today,
            name: a.name,
            points: a.points,
            is_required: a.isRequired,
          }));
          const { error: materializeErr } = await supabase
            .from("activity_logs")
            .upsert(materializeRows, {
              onConflict: "user_id,activity_id,scheduled_date",
              ignoreDuplicates: true,
            });
          if (materializeErr) throw materializeErr;
        }

        const { data: logs, error: logsErr } = await supabase
          .from("activity_logs")
          .select("activity_id, completed")
          .eq("scheduled_date", today);
        if (logsErr) throw logsErr;
        if (cancelled) return;

        const completedSet = new Set<string>();
        for (const log of logs ?? []) {
          if (log.activity_id && log.completed) completedSet.add(log.activity_id);
        }
        setTodayCompleted(completedSet);
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Erro ao carregar atividades.");
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  async function addActivity(activity: Activity) {
    setActivities((prev) => [...prev, activity]);
    const { error: err } = await supabase
      .from("activities")
      .insert(toRow(activity, userId, lifeAreaIdBySlug.current));
    if (err) {
      setActivities((prev) => prev.filter((a) => a.id !== activity.id));
      setError(err.message);
    }
  }

  async function updateActivity(activity: Activity) {
    const previous = activities;
    setActivities((prev) => prev.map((a) => (a.id === activity.id ? activity : a)));
    const { error: err } = await supabase
      .from("activities")
      .update(toRow(activity, userId, lifeAreaIdBySlug.current))
      .eq("id", activity.id);
    if (err) {
      setActivities(previous);
      setError(err.message);
    }
  }

  async function deleteActivity(id: string) {
    const previousActivities = activities;
    const previousCompleted = todayCompleted;
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setTodayCompleted((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    const { error: err } = await supabase.from("activities").delete().eq("id", id);
    if (err) {
      setActivities(previousActivities);
      setTodayCompleted(previousCompleted);
      setError(err.message);
    }
  }

  async function toggleToday(id: string) {
    const wasCompleted = todayCompleted.has(id);
    const nextCompleted = !wasCompleted;
    setTodayCompleted((prev) => {
      const next = new Set(prev);
      if (nextCompleted) next.add(id);
      else next.delete(id);
      return next;
    });

    const activity = activities.find((a) => a.id === id);
    if (!activity) return;

    const { error: err } = await supabase.from("activity_logs").upsert(
      {
        user_id: userId,
        activity_id: id,
        life_area_id: lifeAreaIdBySlug.current.get(activity.lifeAreaSlug) ?? "",
        scheduled_date: todayStr(),
        name: activity.name,
        points: activity.points,
        is_required: activity.isRequired,
        completed: nextCompleted,
        completed_at: nextCompleted ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,activity_id,scheduled_date" }
    );
    if (err) {
      setTodayCompleted((prev) => {
        const next = new Set(prev);
        if (wasCompleted) next.add(id);
        else next.delete(id);
        return next;
      });
      setError(err.message);
    }
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
        status,
        error,
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
