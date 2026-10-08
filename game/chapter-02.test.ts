import { describe, expect, it } from "vitest";
import { assessLuxAnswer } from "./assessment";
import { chapter01 } from "./content/chapter-01";
import { chapter02, luxStep, luxTask } from "./content/chapter-02";
import { lexicon } from "./content/lexicon";
import { displayGloss, parseLatinMarkup } from "./language";
import {
  activateControl, advance, canCompleteChapterReview, chapterReviewCounts,
  chooseLuxDialogue, completeChapterReview, createInitialProgress, enterStage,
  recallAqua, requestLuxHelp, requestReviewHelp, skipIntro, stageOrder,
  submitAquaHypothesis, submitLuxAction, submitName, updateLanguageLog, verifyChapterReview,
} from "./progression";
import { loadGame, saveGame, SAVE_KEY, type StorageLike } from "./storage";
import type { GameProgress, Stage } from "./types";

class MemoryStorage implements StorageLike {
  data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

function confirmReview(progress: GameProgress, lemmas: readonly string[]) {
  for (const lemma of lemmas) progress = updateLanguageLog(progress, lemma, lexicon[lemma].canonicalGloss);
  return completeChapterReview(verifyChapterReview(progress));
}

// Exercise real Chapter I public actions rather than creating an end-stage fixture.
function finishChapterI() {
  let p = skipIntro(createInitialProgress());
  for (let i = 0; i < 80 && p.stage !== "chapter-end"; i++) {
    if (p.stage === "name-prompt") p = submitName(p, "Alex");
    else if (p.stage === "aqua-guess") p = submitAquaHypothesis(p, "water");
    else if (p.stage === "terminal-question") p = recallAqua(p);
    else if (p.stage === "terminal-aperi") p = activateControl(p, "water");
    else if (p.stage === "chapter-review") p = confirmReview(p, chapter01.languageLog.coreVocabulary);
    else p = advance(p);
  }
  expect(p.stage).toBe("chapter-end");
  return p;
}

function walkLux(p: GameProgress, target: Stage, branch = 0): GameProgress {
  for (let i = 0; i < 120 && p.stage !== target; i++) {
    const step = luxStep(p.stage);
    const task = luxTask(p.stage);
    if (task) p = submitLuxAction(p, task.acceptedAnswers[0]);
    else if (step?.choices) p = chooseLuxDialogue(p, step.choices[branch].next);
    else if (step?.kind === "review") p = confirmReview(p, chapter02.coreVocabulary);
    else p = advance(p);
  }
  expect(p.stage).toBe(target);
  return p;
}

describe("Chapter I → Chapter II continuity", () => {
  it.each([0, 1])("plays both chapters with dialogue branch %s without losing Chapter I", (branch) => {
    const chapterI = finishChapterI();
    let p = advance(chapterI);
    expect(p).toMatchObject({ stage: "lux-start", playerName: "Alex", waterRestored: true, powerRestored: false });
    const storage = new MemoryStorage();
    p = walkLux(p, "lux-circuits", branch);
    saveGame(storage, p);
    p = loadGame(storage);
    expect(p.powerRestored).toBe(false);
    p = walkLux(p, "lux-end", branch);
    expect(p).toMatchObject({ playerName: "Alex", waterRestored: true, powerRestored: true });
    for (const lemma of chapter01.languageLog.coreVocabulary) expect(p.languageLog[lemma]).toEqual(chapterI.languageLog[lemma]);
    for (const lemma of chapter02.coreVocabulary) expect(p.languageLog[lemma].status).toBe("CONFIRMED");
    saveGame(storage, p);
    expect(loadGame(storage)).toEqual(p);
    expect(advance(p)).toBe(p); // Chapter III is not playable.
  });

  it("loads pre-Chapter-II v4 saves at the same stage, name and water state", () => {
    const storage = new MemoryStorage();
    const original = finishChapterI();
    const { powerRestored: _power, chapter2Help: _help, ...oldSave } = original;
    for (const stage of ["terminal-aperi", "ending-why", "chapter-end"] as Stage[]) {
      storage.setItem(SAVE_KEY, JSON.stringify({ ...oldSave, stage }));
      const p = loadGame(storage);
      expect(p).toMatchObject({ stage, playerName: "Alex", waterRestored: true, powerRestored: false, chapter2Help: {} });
      expect(p.languageLog).toEqual(original.languageLog);
    }
    expect(advance(loadGame(storage)).stage).toBe("lux-start");
  });

  it("does not allow the Chapter II handoff before water and Chapter I learning are complete", () => {
    const incomplete = enterStage(createInitialProgress(), "chapter-end");
    expect(advance(incomplete)).toBe(incomplete);
    const waterMissing = { ...finishChapterI(), waterRestored: false };
    expect(advance(waterMissing)).toBe(waterMissing);
  });

  it("retains confirmed old meanings even when inflected aqua appears again", () => {
    const p = finishChapterI();
    const entered = enterStage(p, "lux-circuits");
    expect(entered.languageLog.aqua).toBe(p.languageLog.aqua);
    expect(entered.languageLog.aquam).toBeUndefined();
    expect(updateLanguageLog(entered, "aqua", "fire")).toBe(entered);
  });
});

describe("LUX language actions and progressive help", () => {
  it.each(Object.keys(chapter02.tasks) as Stage[])("cannot dead-end or skip %s; help and reload preserve progress", (stage) => {
    const task = luxTask(stage)!;
    let p = walkLux(advance(finishChapterI()), stage);
    const storage = new MemoryStorage();
    expect(advance(p)).toBe(p);
    p = requestLuxHelp(p);
    p = submitLuxAction(p, "wrong");
    p = requestLuxHelp(p);
    expect(p.chapter2Help[stage]).toBe(3);
    expect(p.stage).toBe(stage);
    expect(p.waterRestored).toBe(true);
    for (let i = 0; i < 8; i++) p = submitLuxAction(p, "wrong again");
    expect(p.chapter2Help[stage]).toBe(3);
    saveGame(storage, p);
    p = loadGame(storage);
    expect(p.stage).toBe(stage);
    expect(p.chapter2Help[stage]).toBe(3);
    expect(submitLuxAction(p, task.acceptedAnswers[0]).stage).toBe(task.next);
  });

  it("accepts lux normalization, distinguishes English, and rejects the old aqua answer", () => {
    expect(assessLuxAnswer("lux-question", "  LUX.  ").correct).toBe(true);
    expect(assessLuxAnswer("lux-question", "light")).toEqual({ correct: false, english: true });
    expect(assessLuxAnswer("lux-question", "aqua").correct).toBe(false);
  });

  it("blocks reset-all before execution and only restores power on retaining water", () => {
    const p = walkLux(advance(finishChapterI()), "lux-circuits");
    const wrong = submitLuxAction(p, "reset-all");
    expect(wrong).toMatchObject({ waterRestored: true, powerRestored: false, stage: "lux-circuits" });
    expect(submitLuxAction(wrong, "retain-water")).toMatchObject({ waterRestored: true, powerRestored: true, stage: "lux-power-good" });
  });

  it("requires all ten new core words, progressively helps red guesses, and keeps guess history", () => {
    let p = walkLux(advance(finishChapterI()), "lux-review");
    expect(completeChapterReview(p)).toBe(p);
    for (const lemma of chapter02.coreVocabulary) p = updateLanguageLog(p, lemma, "wrong");
    p = verifyChapterReview(p);
    expect(chapterReviewCounts(p.languageLog, p.stage)).toEqual({ discovered: 10, confirmed: 0, revision: 10 });
    for (const lemma of chapter02.coreVocabulary) {
      for (let i = 0; i < 4; i++) p = requestReviewHelp(p, lemma);
      expect(p.languageLog[lemma]).toMatchObject({ status: "CONTRADICTED", playerGuess: "wrong", helpLevel: 3, canonicalRevealed: true });
      expect(chapter02.crasHints[lemma][2]).toContain(lexicon[lemma].canonicalGloss);
      expect(completeChapterReview(p)).toBe(p);
      const answer = lemma === "parvus" ? "little" : lexicon[lemma].canonicalGloss;
      p = updateLanguageLog(p, lemma, answer);
      expect(p.languageLog[lemma]).toMatchObject({ status: "CONFIRMED", playerGuess: answer });
      expect(displayGloss(p.languageLog[lemma])).toBe(lexicon[lemma].canonicalGloss);
    }
    expect(p.languageLog.parvus.matchQuality).toBe("close");
    expect(canCompleteChapterReview(p.languageLog, p.stage)).toBe(true);
    expect(completeChapterReview(p).stage).toBe("lux-room");
  });

  it("keeps optional words optional and exposes help for them without translating the final promise", () => {
    let p = walkLux(advance(finishChapterI()), "lux-review", 1);
    p = requestReviewHelp(p, "maneo");
    expect(p.languageLog.maneo.helpLevel).toBe(1);
    p = confirmReview(p, chapter02.coreVocabulary);
    expect(p.stage).toBe("lux-room");
    expect(p.languageLog.maneo.status).toBe("UNKNOWN");
    expect(luxStep("lux-promise")?.text).toBe("Non te relinquam.");
  });

  it("has complete editable content, valid links and glosses for every marked word", () => {
    expect(new Set(stageOrder).size).toBe(stageOrder.length);
    for (const step of chapter02.steps) {
      for (const next of [step.next, ...step.choices?.map((c) => c.next) ?? []].filter(Boolean)) expect(stageOrder).toContain(next);
      const texts = [step.text, ...step.card ?? [], ...luxTask(step.id)?.lines ?? []];
      for (const text of texts) for (const { lemma } of parseLatinMarkup(text)) if (lemma) expect(lexicon[lemma]?.canonicalGloss).toBeTruthy();
    }
  });
});
