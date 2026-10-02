import { describe, expect, it } from "vitest";
import { assessAquaAnswer, terminalScaffold } from "./assessment";
import { chapter01 } from "./content/chapter-01";
import { lexicon } from "./content/lexicon";
import { collectMarkedLatin, isAcceptedGloss, normalizeGloss, recordHypothesis, validateLemma } from "./language";
import {
  activateControl,
  canCompleteChapterReview,
  completeChapterReview,
  completePrologue,
  createInitialProgress,
  enterStage,
  recallAqua,
  recordTerminalError,
  skipIntro,
  submitName,
  updateLanguageLog,
  verifyChapterReview,
} from "./progression";
import { loadGame, saveGame, SAVE_KEY, type StorageLike } from "./storage";
import type { GameProgress } from "./types";

class MemoryStorage implements StorageLike {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

function reviewProgress(overrides: Record<string, string> = {}): GameProgress {
  let progress = enterStage(createInitialProgress(), "chapter-review");
  for (const lemma of chapter01.languageLog.coreVocabulary) {
    const guess = overrides[lemma] ?? lexicon[lemma].acceptedGlosses[0];
    progress = updateLanguageLog(progress, lemma, guess);
  }
  return progress;
}

describe("AD ASTRA Chapter I", () => {
  it("makes OPEN YOUR EYES the first required interaction after the automatic intro", () => {
    const initial = createInitialProgress();
    expect(initial.stage).toBe("crawl");
    expect(chapter01.crawl).not.toHaveProperty("continueLabel");
    expect(chapter01.crawl.durationMs).toBeGreaterThanOrEqual(18000);
    expect(chapter01.crawl.durationMs).toBeLessThanOrEqual(20000);
    expect(chapter01.crawl.paragraphs.join(" ").toLowerCase()).not.toMatch(/navigation|fall|impact|crash/);
    expect(chapter01.prologue.phases.map((phase) => phase.id)).toEqual([
      "crawl", "calm", "navigation-warning", "navigation-failure", "signal-lost", "impact", "blackout",
    ]);
    expect(completePrologue(initial).stage).toBe("impact");
    expect(chapter01.impact.action).toBe("OPEN YOUR EYES");
  });

  it("sends Skip Intro directly to OPEN YOUR EYES", () => {
    expect(skipIntro(createInitialProgress()).stage).toBe("impact");
    expect(chapter01.impact.action).toBe("OPEN YOUR EYES");
  });

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

  it("turns accepted review guesses green and wrong guesses red", () => {
    const verified = verifyChapterReview(reviewProgress({ deest: "is present" }));
    expect(verified.languageLog.aqua.status).toBe("CONFIRMED");
    expect(verified.languageLog.deest.status).toBe("CONTRADICTED");
  });

  it("cannot end the chapter while any core vocabulary entry is unconfirmed", () => {
    const verified = verifyChapterReview(reviewProgress({ deest: "is present" }));
    expect(canCompleteChapterReview(verified.languageLog)).toBe(false);
    expect(completeChapterReview(verified).stage).toBe("chapter-review");
  });

  it("confirms a corrected red hypothesis and then allows the chapter to continue", () => {
    let progress = verifyChapterReview(reviewProgress({ deest: "is present" }));
    expect(progress.languageLog.deest.status).toBe("CONTRADICTED");
    progress = updateLanguageLog(progress, "deest", "is absent");
    expect(progress.languageLog.deest.status).toBe("CONFIRMED");
    expect(canCompleteChapterReview(progress.languageLog)).toBe(true);
    expect(completeChapterReview(progress).stage).toBe("ending-now");
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
