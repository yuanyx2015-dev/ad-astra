import { chapter01, markedTextsForStage } from "./content/chapter-01";
import { chapter02, luxMarkedTexts, luxStep, luxTask } from "./content/chapter-02";
import { assessLuxAnswer } from "./assessment";
import { collectMarkedTexts, ensureLemmas, recordHypothesis, revealMeaning, validateLemma } from "./language";
import type { GameProgress, LanguageLog, Stage } from "./types";

export const stageOrder: Stage[] = [
  "crawl", "impact", "wake-salve", "salve-explain", "name-prompt", "name-ack",
  "name-objection", "name-joke", "good-news", "less-news", "no-aqua", "aqua-guess",
  "recycler-offline", "terminal-question", "terminal-correct", "terminal-aperi", "water-good",
  "return-water", "chapter-review", "ending-now", "ending-crashed", "ending-noticed",
  "ending-observant", "ending-why", "ending-log", "ending-convenient", "ending-defense",
  "ending-power", "chapter-end",
  ...chapter02.steps.map((step) => step.id),
];

export function createInitialProgress(): GameProgress {
  return {
    version: 4,
    stage: "crawl",
    playerName: "",
    languageLog: {},
    terminalAttempts: 0,
    lastTerminalError: null,
    askedAperi: false,
    waterRestored: false,
    powerRestored: false,
    chapter2Help: {},
    lastSavedAt: Date.now(),
  };
}

export function enterStage(progress: GameProgress, stage: Stage, languageLog = progress.languageLog): GameProgress {
  let nextLog = collectMarkedTexts(languageLog, [...markedTextsForStage(stage), ...luxMarkedTexts(stage)]);
  if (isReviewStage(stage)) nextLog = ensureLemmas(nextLog, reviewContent(stage).coreVocabulary);
  return {
    ...progress,
    stage,
    languageLog: nextLog,
    lastSavedAt: Date.now(),
  };
}

export function nextStage(stage: Stage): Stage {
  return stageOrder[Math.min(stageOrder.indexOf(stage) + 1, stageOrder.length - 1)];
}

export function advance(progress: GameProgress): GameProgress {
  if (progress.stage === "chapter-end") {
    if (!progress.waterRestored || !canCompleteChapterReview(progress.languageLog)) return progress;
    return enterStage(progress, "lux-start");
  }
  const step = luxStep(progress.stage);
  if (step?.kind || ["name-prompt", "aqua-guess", "terminal-question", "terminal-aperi", "chapter-review"].includes(progress.stage)) return progress;
  let log = progress.languageLog;
  if (progress.stage === "salve-explain") log = revealMeaning(log, "salve");
  return enterStage(progress, step?.next ?? nextStage(progress.stage), log);
}

export function completePrologue(progress: GameProgress): GameProgress {
  if (progress.stage !== "crawl") return progress;
  return enterStage(progress, "impact");
}

export const skipIntro = completePrologue;

export function submitName(progress: GameProgress, name: string): GameProgress {
  if (progress.stage !== "name-prompt" || !name.trim()) return progress;
  return enterStage({ ...progress, playerName: name.trim().slice(0, 40) }, "name-ack");
}

export function submitAquaHypothesis(progress: GameProgress, guess: string): GameProgress {
  if (progress.stage !== "aqua-guess" || !guess.trim()) return progress;
  const languageLog = recordHypothesis(progress.languageLog, "aqua", guess);
  return enterStage(progress, "recycler-offline", languageLog);
}

export function updateLanguageLog(progress: GameProgress, lemma: string, guess: string): GameProgress {
  if (progress.languageLog[lemma]?.status === "CONFIRMED") return progress;
  return { ...progress, languageLog: recordHypothesis(progress.languageLog, lemma, guess), lastSavedAt: Date.now() };
}

export function recordTerminalError(progress: GameProgress, kind: "english" | "other"): GameProgress {
  if (progress.stage !== "terminal-question") return progress;
  return {
    ...progress,
    terminalAttempts: progress.terminalAttempts + 1,
    lastTerminalError: kind,
    lastSavedAt: Date.now(),
  };
}

export function recallAqua(progress: GameProgress): GameProgress {
  if (progress.stage !== "terminal-question") return progress;
  return enterStage(
    { ...progress, lastTerminalError: null },
    "terminal-correct",
    validateLemma(progress.languageLog, "aqua"),
  );
}

export function askAperiMeaning(progress: GameProgress): GameProgress {
  if (progress.stage !== "terminal-aperi") return progress;
  return {
    ...progress,
    askedAperi: true,
    languageLog: revealMeaning(progress.languageLog, "aperi"),
    lastSavedAt: Date.now(),
  };
}

export function activateControl(progress: GameProgress, control: "air" | "water" | "thermal"): GameProgress {
  if (progress.stage !== "terminal-aperi" || control !== "water") return progress;
  return enterStage(
    { ...progress, waterRestored: true },
    "water-good",
    validateLemma(progress.languageLog, "aperi"),
  );
}

export function isReviewStage(stage: Stage): boolean {
  return stage === "chapter-review" || stage === "lux-review";
}

export function reviewContent(stage: Stage = "chapter-review") {
  return stage.startsWith("lux-") ? {
    ...chapter01.languageLog,
    coreVocabulary: chapter02.coreVocabulary,
    crasHints: chapter02.crasHints,
    reviewInstruction: chapter02.ui.reviewInstruction,
    reviewContinue: chapter02.ui.reviewContinue,
  } : chapter01.languageLog;
}

export function reviewHints(lemma: string): readonly string[] | undefined {
  return (chapter01.languageLog.crasHints as Record<string, readonly string[]>)[lemma] ?? chapter02.crasHints[lemma];
}

export function canVerifyChapterReview(languageLog: LanguageLog, stage: Stage = "chapter-review"): boolean {
  return reviewContent(stage).coreVocabulary.every((lemma) => languageLog[lemma]?.status === "CONFIRMED" || Boolean(languageLog[lemma]?.playerGuess.trim()));
}

export function requestReviewHelp(progress: GameProgress, lemma: string): GameProgress {
  if (!isReviewStage(progress.stage) && !progress.stage.startsWith("lux-")) return progress;
  const current = progress.languageLog[lemma];
  const hints = reviewHints(lemma);
  if (!current || current.status === "CONFIRMED" || !hints) return progress;
  const helpLevel = Math.min(current.helpLevel + 1, hints.length);
  const languageLog = {
    ...progress.languageLog,
    [lemma]: {
      ...current,
      helpLevel,
      canonicalRevealed: helpLevel === hints.length || current.canonicalRevealed,
      evidenceKnown: helpLevel === hints.length || current.evidenceKnown,
    },
  };
  return {
    ...progress,
    languageLog: helpLevel === hints.length ? validateLemma(languageLog, lemma) : languageLog,
    lastSavedAt: Date.now(),
  };
}

export function verifyChapterReview(progress: GameProgress): GameProgress {
  if (!isReviewStage(progress.stage) || !canVerifyChapterReview(progress.languageLog, progress.stage)) return progress;
  const languageLog = reviewContent(progress.stage).coreVocabulary.reduce((log, lemma) => log[lemma]?.status === "CONFIRMED" ? log : validateLemma(log, lemma), progress.languageLog);
  return { ...progress, languageLog, lastSavedAt: Date.now() };
}

export function chapterReviewCounts(languageLog: LanguageLog, stage: Stage = "chapter-review") {
  const vocabulary = reviewContent(stage).coreVocabulary;
  const entries = vocabulary
    .map((lemma) => languageLog[lemma])
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const confirmed = entries.filter((entry) => entry.status === "CONFIRMED").length;
  return {
    discovered: entries.length,
    confirmed,
    revision: vocabulary.length - confirmed,
  };
}

export function canCompleteChapterReview(languageLog: LanguageLog, stage: Stage = "chapter-review"): boolean {
  return reviewContent(stage).coreVocabulary.every((lemma) => {
    const entry = languageLog[lemma];
    return entry?.status === "CONFIRMED" && Boolean(entry.canonicalGloss);
  });
}

export function completeChapterReview(progress: GameProgress): GameProgress {
  if (!isReviewStage(progress.stage) || !canCompleteChapterReview(progress.languageLog, progress.stage)) return progress;
  if (progress.stage === "lux-review") {
    if (!progress.waterRestored || !progress.powerRestored || !canCompleteChapterReview(progress.languageLog)) return progress;
    return enterStage(progress, "lux-room");
  }
  return enterStage(progress, "ending-now");
}

export function chooseLuxDialogue(progress: GameProgress, next: Stage): GameProgress {
  const step = luxStep(progress.stage);
  if (step?.kind !== "choice" || !step.choices?.some((choice) => choice.next === next)) return progress;
  return enterStage(progress, next);
}

export function requestLuxHelp(progress: GameProgress): GameProgress {
  const task = luxTask(progress.stage);
  if (!task) return progress;
  const count = Math.min((progress.chapter2Help[progress.stage] ?? 0) + 1, task.hints.length);
  return { ...progress, chapter2Help: { ...progress.chapter2Help, [progress.stage]: count }, lastSavedAt: Date.now() };
}

export function submitLuxAction(progress: GameProgress, answer: string): GameProgress {
  const task = luxTask(progress.stage);
  if (!task) return progress;
  if (!assessLuxAnswer(progress.stage, answer).correct) return requestLuxHelp(progress);
  // A wrong reset action is never executed: restored water is retained on every path.
  return enterStage({ ...progress, powerRestored: task.restoresPower ? true : progress.powerRestored }, task.next);
}
