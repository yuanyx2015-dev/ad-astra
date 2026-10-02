import { chapter01 } from "./content/chapter-01";

export interface AquaAssessment {
  correct: boolean;
  kind: "correct" | "english" | "other";
  normalized: string;
}

export function normalizeAquaAnswer(value: string): string {
  return value.trim().replace(/\s+/g, "").replace(/\.$/, "").toLowerCase();
}

export function assessAquaAnswer(value: string): AquaAssessment {
  const normalized = normalizeAquaAnswer(value);
  if (normalized === "aqua") return { correct: true, kind: "correct", normalized };
  if (normalized === "water") return { correct: false, kind: "english", normalized };
  return { correct: false, kind: "other", normalized };
}

export function terminalScaffold(kind: AquaAssessment["kind"], attempt: number) {
  const errors = chapter01.terminal.errors;
  const hintIndex = Math.min(Math.max(attempt, 1), errors.hints.length) - 1;
  return {
    terminal: kind === "english" ? errors.englishTerminal : "",
    cras: errors.hints[hintIndex],
    directReveal: attempt >= errors.hints.length,
  };
}
