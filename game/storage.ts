import { createInitialProgress, stageOrder } from "./progression";
import type { GameProgress } from "./types";

export const SAVE_KEY = "ad-astra.chapter-one.v1";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function saveGame(storage: StorageLike, progress: GameProgress): void {
  storage.setItem(SAVE_KEY, JSON.stringify(progress));
}

export function loadGame(storage: StorageLike): GameProgress {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return createInitialProgress();
  try {
    const parsed = JSON.parse(raw) as Partial<GameProgress>;
    if (parsed.version !== 1 || !parsed.stage || !stageOrder.includes(parsed.stage)) return createInitialProgress();
    if (!Array.isArray(parsed.learnedWords) || !Array.isArray(parsed.completedExerciseIds)) return createInitialProgress();
    if (!parsed.facility || !parsed.robot || !parsed.mistakes) return createInitialProgress();
    return parsed as GameProgress;
  } catch {
    return createInitialProgress();
  }
}

export function clearGame(storage: StorageLike): GameProgress {
  storage.removeItem(SAVE_KEY);
  return createInitialProgress();
}
