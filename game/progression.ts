import type { GameProgress, Stage } from "./types";

export const stageOrder: Stage[] = [
  "title", "morning", "less-news", "you-what", "repeat-aqua",
  "aqua-choice", "aqua-response", "salve-terminal", "salve-explain",
  "salve-response", "recycler-offline", "terminal-question",
  "terminal-correct", "terminal-aperi", "water-good", "return-water", "you-six", "final",
];

export function createInitialProgress(): GameProgress {
  return {
    version: 2,
    stage: "title",
    learning: {
      aqua: "unseen",
      salve: "unseen",
      deest: "unseen",
      bene: "unseen",
      nonEst: "unseen",
      aperi: "unseen",
      quidRecteViator: "unseen",
    },
    aquaChoice: null,
    salveChoice: null,
    terminalAttempts: 0,
    lastTerminalError: null,
    askedAperi: false,
    lastSavedAt: Date.now(),
  };
}

export function nextStage(stage: Stage): Stage {
  return stageOrder[Math.min(stageOrder.indexOf(stage) + 1, stageOrder.length - 1)];
}

export function advance(progress: GameProgress): GameProgress {
  if (["aqua-choice", "salve-explain", "terminal-question", "terminal-aperi", "final"].includes(progress.stage)) return progress;
  const stage = nextStage(progress.stage);
  const learning = { ...progress.learning };
  if (stage === "less-news") learning.aqua = "encountered";
  if (stage === "aqua-choice") learning.deest = "inferred";
  if (stage === "recycler-offline") learning.nonEst = "inferred";
  if (stage === "terminal-question") learning.quidRecteViator = "exposed";
  if (stage === "terminal-aperi") learning.aperi = "encountered";
  return { ...progress, stage, learning, lastSavedAt: Date.now() };
}

export function chooseAquaMeaning(progress: GameProgress, choice: "system" | "unclear"): GameProgress {
  if (progress.stage !== "aqua-choice") return progress;
  return {
    ...progress,
    stage: "aqua-response",
    aquaChoice: choice,
    learning: { ...progress.learning, aqua: "inferred", deest: "inferred" },
    lastSavedAt: Date.now(),
  };
}

export function chooseSalveReply(progress: GameProgress, choice: "salve" | "hello"): GameProgress {
  if (progress.stage !== "salve-explain") return progress;
  return {
    ...progress,
    stage: "salve-response",
    salveChoice: choice,
    learning: { ...progress.learning, salve: "recognized" },
    lastSavedAt: Date.now(),
  };
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
  return {
    ...progress,
    stage: "terminal-correct",
    lastTerminalError: null,
    learning: { ...progress.learning, aqua: "recalled", quidRecteViator: "exposed" },
    lastSavedAt: Date.now(),
  };
}

export function askAperiMeaning(progress: GameProgress): GameProgress {
  if (progress.stage !== "terminal-aperi") return progress;
  return { ...progress, askedAperi: true, lastSavedAt: Date.now() };
}

export function activateControl(progress: GameProgress, control: "air" | "water" | "thermal"): GameProgress {
  if (progress.stage !== "terminal-aperi" || control !== "water") return progress;
  return {
    ...progress,
    stage: "water-good",
    learning: { ...progress.learning, aperi: "action-understood", bene: "recognized" },
    lastSavedAt: Date.now(),
  };
}
