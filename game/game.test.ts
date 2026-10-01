import { describe, expect, it } from "vitest";
import { assessAquaAnswer, terminalScaffold } from "./assessment";
import { collectMarkedLatin, isAcceptedGloss, normalizeGloss, recordHypothesis, validateLemma } from "./language";
import {
  activateControl,
  canCompleteChapterReview,
  createInitialProgress,
  enterStage,
  recallAqua,
  recordTerminalError,
  submitName,
  updateLanguageLog,
} from "./progression";
import { loadGame, saveGame, SAVE_KEY, type StorageLike } from "./storage";
import type { GameProgress, LanguageLog } from "./types";

class MemoryStorage implements StorageLike {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

describe("AD ASTRA Chapter I", () => {
  it("collects marked Latin automatically and groups inflections under one lemma", () => {
    const log = collectMarkedLatin({}, "[[aquam|aqua]] et [[aqua]]");
    expect(Object.keys(log)).toEqual(["aqua"]);
    expect(log.aqua).toMatchObject({ lemma: "aqua", status: "UNKNOWN" });
  });

  it("moves entries through hypothesis, confirmed, and contradicted states", () => {
    const encountered = collectMarkedLatin({}, "[[aqua]] [[deest]]");
    const yellow = recordHypothesis(encountered, "aqua", "water");
    expect(yellow.aqua.status).toBe("HYPOTHESIS");
    expect(validateLemma(yellow, "aqua").aqua.status).toBe("CONFIRMED");
    const wrong = recordHypothesis(encountered, "deest", "is present");
    expect(validateLemma(wrong, "deest").deest.status).toBe("CONTRADICTED");
  });

  it("normalizes punctuation, capitalization, spacing, and accepted synonyms", () => {
    expect(normalizeGloss("  Is   Missing! ")).toBe("is missing");
    expect(isAcceptedGloss("deest", "IS ABSENT.")).toBe(true);
    expect(isAcceptedGloss("viator", "Traveller")).toBe(true);
  });

  it("confirms the yellow aqua hypothesis after successful terminal use", () => {
    let progress = enterStage(createInitialProgress(), "terminal-question", collectMarkedLatin({}, "[[aqua]]"));
    progress = updateLanguageLog(progress, "aqua", "water");
    expect(progress.languageLog.aqua.status).toBe("HYPOTHESIS");
    progress = recallAqua(progress);
    expect(progress.languageLog.aqua.status).toBe("CONFIRMED");
  });

  it("blocks chapter review only for UNKNOWN entries", () => {
    const log: LanguageLog = {
      aqua: { lemma: "aqua", guess: "water", status: "HYPOTHESIS", evidenceKnown: false },
      salve: { lemma: "salve", guess: "hello", status: "CONFIRMED", evidenceKnown: true },
      deest: { lemma: "deest", guess: "present", status: "CONTRADICTED", evidenceKnown: true },
    };
    expect(canCompleteChapterReview(log)).toBe(true);
    expect(canCompleteChapterReview({ ...log, quid: { lemma: "quid", guess: "", status: "UNKNOWN", evidenceKnown: false } })).toBe(false);
  });

  it("persists the restored water visual state", () => {
    const storage = new MemoryStorage();
    let progress = enterStage(createInitialProgress(), "terminal-aperi", collectMarkedLatin({}, "[[aperi]]"));
    progress = activateControl(progress, "water");
    expect(progress.waterRestored).toBe(true);
    saveGame(storage, progress);
    expect(loadGame(storage).waterRestored).toBe(true);
  });

  it("retains wrong-answer scaffolding and never reveals the operational answer", () => {
    expect(assessAquaAnswer("  A Q U A. ").correct).toBe(true);
    expect(terminalScaffold("english", 0)).toMatchObject({ terminal: "IGNOTUM.", cras: "It remains stubbornly Latin." });
    expect(terminalScaffold("other", 1).cras).toBe("Consider the system that is failing.");
    expect(terminalScaffold("other", 2).cras).toBe("The recycler is dry.");
    expect(terminalScaffold("other", 3).cras).toBe("You encountered the relevant word earlier.");
    expect(terminalScaffold("other", 4).offerReview).toBe(true);

    const terminal = enterStage(createInitialProgress(), "terminal-question");
    const afterEnglish = recordTerminalError(terminal, "english");
    expect(recordTerminalError(afterEnglish, "other").terminalAttempts).toBe(1);
  });

  it("round-trips the player name and Language Log", () => {
    const storage = new MemoryStorage();
    let progress: GameProgress = enterStage(createInitialProgress(), "name-prompt");
    progress = submitName(progress, "Alex");
    progress = { ...progress, languageLog: recordHypothesis(collectMarkedLatin({}, "[[aqua]]"), "aqua", "water") };
    saveGame(storage, progress);
    expect(loadGame(storage)).toMatchObject({ playerName: "Alex", languageLog: { aqua: { guess: "water", status: "HYPOTHESIS" } } });
    storage.setItem(SAVE_KEY, JSON.stringify({ version: 2, stage: "title" }));
    expect(loadGame(storage).stage).toBe("crawl");
  });
});
