import type { Exercise } from "./types";

export interface AssessmentResult {
  correct: boolean;
  feedback: string;
  normalizedResponse: string;
}

export interface AssessmentProvider {
  assess(exercise: Exercise, response: string): Promise<AssessmentResult> | AssessmentResult;
}

export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function assessDeterministically(exercise: Exercise, response: string): AssessmentResult {
  const normalizedResponse = normalizeAnswer(response);
  const accepted = exercise.kind === "choice"
    ? normalizedResponse === normalizeAnswer(exercise.correctAnswer)
    : exercise.acceptedAnswers.some((answer) => normalizeAnswer(answer) === normalizedResponse);

  return {
    correct: accepted,
    feedback: accepted ? exercise.success : exercise.hint,
    normalizedResponse,
  };
}

export const deterministicAssessment: AssessmentProvider = {
  assess: assessDeterministically,
};
