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
  if (kind === "english") {
    return { terminal: "IGNOTUM.", cras: "It remains stubbornly Latin.", offerReview: attempt >= 4 };
  }
  const hints = [
    "Consider the system that is failing.",
    "The recycler is dry.",
    "You encountered the relevant word earlier.",
  ];
  return {
    terminal: "",
    cras: hints[Math.min(attempt - 1, hints.length - 1)],
    offerReview: attempt >= 4,
  };
}
