import { createInitialProgress, stageOrder } from "./progression";
import type { GameProgress } from "./types";

export const SAVE_KEY = "ad-astra.chapter-01.v3";

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
    if (parsed.version !== 3 || !parsed.stage || !stageOrder.includes(parsed.stage)) return createInitialProgress();
    if (typeof parsed.playerName !== "string" || !parsed.languageLog || typeof parsed.languageLog !== "object") return createInitialProgress();
    if (typeof parsed.waterRestored !== "boolean" || typeof parsed.terminalAttempts !== "number") return createInitialProgress();
    return parsed as GameProgress;
  } catch {
    return createInitialProgress();
  }
}

export function clearGame(storage: StorageLike): GameProgress {
  storage.removeItem(SAVE_KEY);
  return createInitialProgress();
}
