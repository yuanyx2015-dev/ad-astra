import { chapter01, markedTextsForStage } from "./content/chapter-01";
import { collectMarkedTexts, ensureLemmas, recordHypothesis, revealMeaning, validateLemma } from "./language";
import type { GameProgress, LanguageLog, Stage } from "./types";

export const stageOrder: Stage[] = [
  "crawl", "impact", "wake-salve", "salve-explain", "name-prompt", "name-ack",
  "name-objection", "name-joke", "good-news", "less-news", "no-aqua", "aqua-guess",
  "recycler-offline", "terminal-question", "terminal-correct", "terminal-aperi", "water-good",
  "return-water", "chapter-review", "ending-now", "ending-crashed", "ending-noticed",
  "ending-observant", "ending-why", "ending-log", "ending-convenient", "ending-defense",
  "ending-power", "chapter-end",
];

export function createInitialProgress(): GameProgress {
  return {
    version: 3,
    stage: "crawl",
    playerName: "",
    languageLog: {},
    terminalAttempts: 0,
    lastTerminalError: null,
    askedAperi: false,
    waterRestored: false,
    lastSavedAt: Date.now(),
  };
}

export function enterStage(progress: GameProgress, stage: Stage, languageLog = progress.languageLog): GameProgress {
  let nextLog = collectMarkedTexts(languageLog, markedTextsForStage(stage));
  if (stage === "chapter-review") nextLog = ensureLemmas(nextLog, chapter01.languageLog.coreVocabulary);
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
  if (["name-prompt", "aqua-guess", "terminal-question", "terminal-aperi", "chapter-review", "chapter-end"].includes(progress.stage)) return progress;
  let log = progress.languageLog;
  if (progress.stage === "salve-explain") log = revealMeaning(log, "salve", "hello");
  return enterStage(progress, nextStage(progress.stage), log);
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
  return { ...progress, languageLog: recordHypothesis(progress.languageLog, lemma, guess), lastSavedAt: Date.now() };
}

export function recordTerminalError(progress: GameProgress, kind: "english" | "other"): GameProgress {
  if (progress.stage !== "terminal-question") return progress;
  return {
    ...progress,
    terminalAttempts: progress.terminalAttempts + (kind === "other" ? 1 : 0),
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
    languageLog: revealMeaning(progress.languageLog, "aperi", "open"),
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

export function canVerifyChapterReview(languageLog: LanguageLog): boolean {
  return chapter01.languageLog.coreVocabulary.every((lemma) => Boolean(languageLog[lemma]?.guess.trim()));
}

export function verifyChapterReview(progress: GameProgress): GameProgress {
  if (progress.stage !== "chapter-review" || !canVerifyChapterReview(progress.languageLog)) return progress;
  const languageLog = chapter01.languageLog.coreVocabulary.reduce(validateLemma, progress.languageLog);
  return { ...progress, languageLog, lastSavedAt: Date.now() };
}

export function chapterReviewCounts(languageLog: LanguageLog) {
  const entries = chapter01.languageLog.coreVocabulary
    .map((lemma) => languageLog[lemma])
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const confirmed = entries.filter((entry) => entry.status === "CONFIRMED").length;
  return {
    discovered: entries.length,
    confirmed,
    revision: chapter01.languageLog.coreVocabulary.length - confirmed,
  };
}

export function canCompleteChapterReview(languageLog: LanguageLog): boolean {
  return chapter01.languageLog.coreVocabulary.every((lemma) => languageLog[lemma]?.status === "CONFIRMED");
}

export function completeChapterReview(progress: GameProgress): GameProgress {
  if (progress.stage !== "chapter-review" || !canCompleteChapterReview(progress.languageLog)) return progress;
  return enterStage(progress, "ending-now");
}
