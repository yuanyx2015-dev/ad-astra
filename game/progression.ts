import { requiredExerciseIds } from "./data/exercises";
import type { GameProgress, RobotMood, Stage } from "./types";

export const stageOrder: Stage[] = [
  "intro-wake", "intro-choice", "learn-salve", "learn-aqua", "terminal-aqua",
  "learn-aperi", "terminal-valve", "repair", "terminal-flow", "facility-unlocked",
  "placement", "epilogue", "complete",
];

const gatedStages: Partial<Record<Stage, string>> = {
  "learn-salve": "salve",
  "terminal-aqua": "aqua",
  "terminal-valve": "valve",
  "terminal-flow": "flow",
};

export function createInitialProgress(): GameProgress {
  return {
    version: 1,
    stage: "intro-wake",
    learnedWords: [],
    completedExerciseIds: [],
    mistakes: {},
    facility: { status: "locked", cell: null },
    robot: { mood: "observing", rapport: 0 },
    lastSavedAt: Date.now(),
  };
}

export function nextStage(stage: Stage): Stage {
  return stageOrder[Math.min(stageOrder.indexOf(stage) + 1, stageOrder.length - 1)];
}

export function advance(progress: GameProgress, mood?: RobotMood): GameProgress {
  const gate = gatedStages[progress.stage];
  if (gate && !progress.completedExerciseIds.includes(gate)) return progress;
  return {
    ...progress,
    stage: nextStage(progress.stage),
    robot: { ...progress.robot, mood: mood ?? progress.robot.mood },
    lastSavedAt: Date.now(),
  };
}

const learnedByExercise: Record<string, string> = {
  salve: "salve", aqua: "aqua", valve: "aperi", flow: "currit",
};

export function completeExercise(progress: GameProgress, exerciseId: string): GameProgress {
  if (progress.completedExerciseIds.includes(exerciseId)) return progress;
  const word = learnedByExercise[exerciseId];
  const completedExerciseIds = [...progress.completedExerciseIds, exerciseId];
  const allComplete = requiredExerciseIds.every((id) => completedExerciseIds.includes(id));
  return {
    ...progress,
    completedExerciseIds,
    learnedWords: word && !progress.learnedWords.includes(word) ? [...progress.learnedWords, word] : progress.learnedWords,
    facility: allComplete ? { status: "unlocked", cell: null } : progress.facility,
    robot: { mood: "pleased", rapport: progress.robot.rapport + 1 },
    lastSavedAt: Date.now(),
  };
}

export function recordMistake(progress: GameProgress, exerciseId: string): GameProgress {
  return {
    ...progress,
    mistakes: { ...progress.mistakes, [exerciseId]: (progress.mistakes[exerciseId] ?? 0) + 1 },
    robot: { ...progress.robot, mood: "alarmed" },
    lastSavedAt: Date.now(),
  };
}

export function unlockFacility(progress: GameProgress): GameProgress {
  const ready = requiredExerciseIds.every((id) => progress.completedExerciseIds.includes(id));
  return ready ? { ...progress, facility: { status: "unlocked", cell: null }, lastSavedAt: Date.now() } : progress;
}

export function placeFacility(progress: GameProgress, cell: number): GameProgress {
  if (progress.facility.status !== "unlocked" || ![1, 2, 4, 5].includes(cell)) return progress;
  return {
    ...progress,
    facility: { status: "placed", cell },
    stage: "epilogue",
    robot: { mood: "quiet", rapport: progress.robot.rapport + 1 },
    lastSavedAt: Date.now(),
  };
}
