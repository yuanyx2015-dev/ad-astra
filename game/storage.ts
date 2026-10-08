import { createInitialProgress, stageOrder } from "./progression";
import type { GameProgress } from "./types";
import { lexicon } from "./content/lexicon";
import { createLogEntry } from "./language";

export const SAVE_KEY = "ad-astra.chapter-01.v4";

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
    if (parsed.version !== 4 || !parsed.stage || !stageOrder.includes(parsed.stage)) return createInitialProgress();
    if (typeof parsed.playerName !== "string" || !parsed.languageLog || typeof parsed.languageLog !== "object") return createInitialProgress();
    if (typeof parsed.waterRestored !== "boolean" || typeof parsed.terminalAttempts !== "number") return createInitialProgress();
    // Extend the existing v4 save in place; do not change the key or restart Chapter I.
    const languageLog = Object.fromEntries(Object.entries(parsed.languageLog).map(([lemma, entry]) => [lemma, {
      ...createLogEntry(lemma), ...entry,
      canonicalGloss: lexicon[lemma]?.canonicalGloss ?? entry.canonicalGloss ?? "",
    }]));
    return {
      ...createInitialProgress(), ...parsed,
      languageLog,
      powerRestored: parsed.powerRestored === true,
      chapter2Help: Object.fromEntries(Object.entries(parsed.chapter2Help ?? {}).filter(([, count]) => Number.isFinite(count) && count >= 0).map(([stage, count]) => [stage, Math.min(3, Math.floor(count))])),
    } as GameProgress;
  } catch {
    return createInitialProgress();
  }
}

export function clearGame(storage: StorageLike): GameProgress {
  storage.removeItem(SAVE_KEY);
  return createInitialProgress();
}
