import { describe, expect, it } from "vitest";
import { assessDeterministically } from "./assessment";
import { exercises, requiredExerciseIds } from "./data/exercises";
import { advance, completeExercise, createInitialProgress, placeFacility, unlockFacility } from "./progression";
import { loadGame, saveGame, SAVE_KEY, type StorageLike } from "./storage";

class MemoryStorage implements StorageLike {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

describe("deterministic language assessment", () => {
  it("accepts documented typed equivalents and normalizes punctuation", () => {
    expect(assessDeterministically(exercises.valve, "Open the water valve!").correct).toBe(true);
    expect(assessDeterministically(exercises.valve, "open the valve for water").correct).toBe(true);
  });

  it("rejects incorrect answers and returns the curated hint", () => {
    const result = assessDeterministically(exercises.aqua, "lux");
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("aqua");
  });
});

describe("progression gates", () => {
  it("does not advance through a required exercise before success", () => {
    let progress = createInitialProgress();
    progress = advance(progress);
    progress = advance(progress);
    expect(progress.stage).toBe("learn-salve");
    expect(advance(progress)).toBe(progress);
  });

  it("unlocks only after all curated exercises", () => {
    let progress = createInitialProgress();
    for (const id of requiredExerciseIds.slice(0, -1)) progress = completeExercise(progress, id);
    expect(unlockFacility(progress).facility.status).toBe("locked");
    progress = completeExercise(progress, requiredExerciseIds.at(-1)!);
    expect(progress.facility.status).toBe("unlocked");
  });

  it("prevents placement while locked and places once unlocked", () => {
    let progress = createInitialProgress();
    expect(placeFacility(progress, 2).facility.status).toBe("locked");
    for (const id of requiredExerciseIds) progress = completeExercise(progress, id);
    const placed = placeFacility(progress, 2);
    expect(placed.facility).toEqual({ status: "placed", cell: 2 });
    expect(placed.stage).toBe("epilogue");
  });
});

describe("save and load", () => {
  it("round-trips progress", () => {
    const storage = new MemoryStorage();
    const progress = completeExercise(createInitialProgress(), "salve");
    saveGame(storage, progress);
    expect(loadGame(storage).learnedWords).toEqual(["salve"]);
  });

  it("recovers safely from corrupt data", () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, "{not valid json");
    expect(loadGame(storage).stage).toBe("intro-wake");
  });
});
