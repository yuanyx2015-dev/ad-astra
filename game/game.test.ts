import { describe, expect, it } from "vitest";
import { assessAquaAnswer, terminalScaffold } from "./assessment";
import {
  activateControl,
  advance,
  chooseAquaMeaning,
  chooseSalveReply,
  createInitialProgress,
  recallAqua,
  recordTerminalError,
} from "./progression";
import { loadGame, saveGame, SAVE_KEY, type StorageLike } from "./storage";
import type { GameProgress } from "./types";

class MemoryStorage implements StorageLike {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

describe("approved opening flow", () => {
  it("starts on the title screen and gates narrative choices", () => {
    let progress = createInitialProgress();
    expect(progress.stage).toBe("title");
    for (let index = 0; index < 5; index += 1) progress = advance(progress);
    expect(progress.stage).toBe("aqua-choice");
    expect(advance(progress)).toBe(progress);
  });

  it("tracks inferred aqua and recognized salve internally", () => {
    let progress = createInitialProgress();
    for (let index = 0; index < 5; index += 1) progress = advance(progress);
    progress = chooseAquaMeaning(progress, "system");
    expect(progress.learning.aqua).toBe("inferred");
    expect(progress.learning.deest).toBe("inferred");
    progress = advance(progress);
    progress = advance(progress);
    progress = chooseSalveReply(progress, "salve");
    expect(progress.learning.salve).toBe("recognized");
  });

  it("accepts aqua case-insensitively while ignoring spaces and a final period", () => {
    expect(assessAquaAnswer("  A Q U A. ").correct).toBe(true);
    expect(assessAquaAnswer("water")).toMatchObject({ correct: false, kind: "english" });
  });

  it("uses the required wrong-answer scaffolding without showing the answer", () => {
    expect(terminalScaffold("english", 1)).toMatchObject({ terminal: "IGNOTUM.", cras: "It remains stubbornly Latin." });
    expect(terminalScaffold("other", 1).cras).toBe("Consider the system that is failing.");
    expect(terminalScaffold("other", 2).cras).toBe("The recycler is dry.");
    expect(terminalScaffold("other", 3).cras).toBe("You encountered the relevant word earlier.");
    expect(terminalScaffold("other", 4).offerReview).toBe(true);
  });

  it("does not let the special English error skip the other-error hints", () => {
    const terminal = { ...createInitialProgress(), stage: "terminal-question" as const };
    const afterEnglish = recordTerminalError(terminal, "english");
    const firstOther = recordTerminalError(afterEnglish, "other");
    expect(firstOther.terminalAttempts).toBe(1);
    expect(terminalScaffold("other", firstOther.terminalAttempts).cras).toBe("Consider the system that is failing.");
  });

  it("keeps the terminal gated until aqua is recalled", () => {
    let progress: GameProgress = { ...createInitialProgress(), stage: "terminal-question" };
    progress = recordTerminalError(progress, "other");
    expect(progress.stage).toBe("terminal-question");
    progress = recallAqua(progress);
    expect(progress.stage).toBe("terminal-correct");
    expect(progress.learning.aqua).toBe("recalled");
  });

  it("requires the water control for the aperi action", () => {
    const progress = { ...createInitialProgress(), stage: "terminal-aperi" as const };
    expect(activateControl(progress, "air")).toBe(progress);
    const repaired = activateControl(progress, "water");
    expect(repaired.stage).toBe("water-good");
    expect(repaired.learning.aperi).toBe("action-understood");
    expect(repaired.learning.bene).toBe("recognized");
  });

  it("round-trips v2 saves and rejects the old chapter save shape", () => {
    const storage = new MemoryStorage();
    const progress = advance(createInitialProgress());
    saveGame(storage, progress);
    expect(loadGame(storage).stage).toBe("morning");
    storage.setItem(SAVE_KEY, JSON.stringify({ version: 1, stage: "intro-wake" }));
    expect(loadGame(storage).stage).toBe("title");
  });
});
