import { type WorkoutExercise, type ExerciseProgress } from "@/types/exercise";

export function totalPlannedReps(we: WorkoutExercise): number {
  return (we.sets ?? 1) * (we.repetitions ?? 0);
}

export function totalPlannedDuration(we: WorkoutExercise): number {
  return (we.sets ?? 1) * (we.durationSeconds ?? 0);
}

function completionRatio(we: WorkoutExercise, p: ExerciseProgress): number {
  const reps = totalPlannedReps(we);
  const duration = totalPlannedDuration(we);
  let ratio: number;
  if (reps > 0) ratio = p.completedRepetitions / reps;
  else if (duration > 0) ratio = p.completedDurationSeconds / duration;
  else ratio = p.completedSets / (we.sets ?? 1);
  return Math.min(1, Math.max(0, ratio));
}

export function computeEarnedScore(
  we: WorkoutExercise,
  p: ExerciseProgress
): number {
  const ratio = completionRatio(we, p);
  if (we.scoreMode === "integral") {
    return ratio >= 1 ? we.score : 0;
  }
  return Math.round(we.score * ratio);
}

export function isExerciseComplete(we: WorkoutExercise, p: ExerciseProgress): boolean {
  return completionRatio(we, p) >= 1;
}

export function initProgress(we: WorkoutExercise): ExerciseProgress {
  return {
    workoutExerciseId: we.id,
    exerciseId: we.exerciseId,
    plannedSets: we.sets,
    completedSets: 0,
    plannedRepetitions: we.repetitions,
    completedRepetitions: 0,
    plannedDurationSeconds: we.durationSeconds,
    completedDurationSeconds: 0,
    earnedScore: 0,
    status: "em_andamento",
  };
}

export function completeSet(
  we: WorkoutExercise,
  p: ExerciseProgress
): ExerciseProgress {
  const totalSets = we.sets ?? 1;
  const newSets = Math.min(totalSets, p.completedSets + 1);
  const repsPerSet = we.repetitions ?? 0;
  const newReps = Math.min(totalPlannedReps(we), newSets * repsPerSet);
  const newDuration = Math.min(
    totalPlannedDuration(we),
    newSets * (we.durationSeconds ?? 0)
  );
  const updated: ExerciseProgress = {
    ...p,
    completedSets: newSets,
    completedRepetitions: newReps,
    completedDurationSeconds: newDuration,
  };
  updated.earnedScore = computeEarnedScore(we, updated);
  updated.status = isExerciseComplete(we, updated) ? "concluido" : "em_andamento";
  return updated;
}

export function addOneRep(
  we: WorkoutExercise,
  p: ExerciseProgress
): ExerciseProgress {
  const total = totalPlannedReps(we);
  const newReps = Math.min(total, p.completedRepetitions + 1);
  const repsPerSet = we.repetitions ?? 1;
  const newSets = Math.min(we.sets ?? 1, Math.floor(newReps / repsPerSet));
  const updated: ExerciseProgress = {
    ...p,
    completedRepetitions: newReps,
    completedSets: newSets,
  };
  updated.earnedScore = computeEarnedScore(we, updated);
  updated.status = isExerciseComplete(we, updated) ? "concluido" : "em_andamento";
  return updated;
}
