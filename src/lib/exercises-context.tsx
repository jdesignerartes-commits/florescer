"use client";

import { createContext, useContext, useMemo, useState } from "react";
import {
  type Workout,
  type WorkoutSession,
  type ExerciseProgress,
  type PerceivedEffort,
  type Discomfort,
  INITIAL_WORKOUTS,
  plannedScore,
} from "@/types/exercise";
import { initProgress, completeSet, addOneRep } from "@/lib/workout-scoring";

interface ExercisesContextValue {
  workouts: Workout[];
  addWorkout: (w: Workout) => void;
  updateWorkout: (w: Workout) => void;
  deleteWorkout: (id: string) => void;
  sessions: WorkoutSession[];
  activeSession: WorkoutSession | null;
  activeWorkout: Workout | null;
  startSession: (
    workout: Workout,
    moodBefore: number | null,
    energyBefore: number | null
  ) => void;
  completeSetFor: (workoutExerciseId: string) => void;
  addRepFor: (workoutExerciseId: string) => void;
  finishSession: (patch: {
    perceivedEffort: PerceivedEffort | null;
    discomfort: Discomfort | null;
    moodAfter: number | null;
    energyAfter: number | null;
    notes: string;
  }) => void;
  abandonSession: () => void;
  todayEarnedScore: number;
}

const ExercisesContext = createContext<ExercisesContextValue | null>(null);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function ExercisesProvider({ children }: { children: React.ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>(INITIAL_WORKOUTS);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  function addWorkout(w: Workout) {
    setWorkouts((prev) => [...prev, w]);
  }
  function updateWorkout(w: Workout) {
    setWorkouts((prev) => prev.map((x) => (x.id === w.id ? w : x)));
  }
  function deleteWorkout(id: string) {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }

  function startSession(
    workout: Workout,
    moodBefore: number | null,
    energyBefore: number | null
  ) {
    const progress: ExerciseProgress[] = workout.exercises.map(initProgress);
    setActiveWorkout(workout);
    setActiveSession({
      id: crypto.randomUUID(),
      workoutId: workout.id,
      workoutName: workout.name,
      sessionDate: todayStr(),
      startedAt: new Date().toISOString(),
      endedAt: null,
      plannedScore: plannedScore(workout),
      earnedScore: 0,
      perceivedEffort: null,
      moodBefore,
      moodAfter: null,
      energyBefore,
      energyAfter: null,
      discomfort: null,
      notes: "",
      status: "em_andamento",
      progress,
    });
  }

  function updateProgressList(
    workoutExerciseId: string,
    updater: (p: ExerciseProgress) => ExerciseProgress
  ) {
    setActiveSession((prev) => {
      if (!prev) return prev;
      const progress = prev.progress.map((p) =>
        p.workoutExerciseId === workoutExerciseId ? updater(p) : p
      );
      const earnedScore = progress.reduce((sum, p) => sum + p.earnedScore, 0);
      return { ...prev, progress, earnedScore };
    });
  }

  function completeSetFor(workoutExerciseId: string) {
    if (!activeWorkout) return;
    const we = activeWorkout.exercises.find((e) => e.id === workoutExerciseId);
    if (!we) return;
    updateProgressList(workoutExerciseId, (p) => completeSet(we, p));
  }

  function addRepFor(workoutExerciseId: string) {
    if (!activeWorkout) return;
    const we = activeWorkout.exercises.find((e) => e.id === workoutExerciseId);
    if (!we) return;
    updateProgressList(workoutExerciseId, (p) => addOneRep(we, p));
  }

  function finishSession(patch: {
    perceivedEffort: PerceivedEffort | null;
    discomfort: Discomfort | null;
    moodAfter: number | null;
    energyAfter: number | null;
    notes: string;
  }) {
    if (!activeSession) return;
    const finished: WorkoutSession = {
      ...activeSession,
      ...patch,
      endedAt: new Date().toISOString(),
      status: "concluido",
    };
    setSessions((s) => [finished, ...s]);
    setActiveSession(null);
    setActiveWorkout(null);
  }

  function abandonSession() {
    if (!activeSession) return;
    setSessions((s) => [
      { ...activeSession, status: "abandonado", endedAt: new Date().toISOString() },
      ...s,
    ]);
    setActiveSession(null);
    setActiveWorkout(null);
  }

  const todayEarnedScore = useMemo(() => {
    const today = todayStr();
    return sessions
      .filter((s) => s.sessionDate === today && s.status === "concluido")
      .reduce((sum, s) => sum + s.earnedScore, 0);
  }, [sessions]);

  return (
    <ExercisesContext.Provider
      value={{
        workouts,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        sessions,
        activeSession,
        activeWorkout,
        startSession,
        completeSetFor,
        addRepFor,
        finishSession,
        abandonSession,
        todayEarnedScore,
      }}
    >
      {children}
    </ExercisesContext.Provider>
  );
}

export function useExercises() {
  const ctx = useContext(ExercisesContext);
  if (!ctx) throw new Error("useExercises must be used within ExercisesProvider");
  return ctx;
}
