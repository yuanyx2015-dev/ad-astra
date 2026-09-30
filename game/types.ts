export type Stage =
  | "intro-wake"
  | "intro-choice"
  | "learn-salve"
  | "learn-aqua"
  | "terminal-aqua"
  | "learn-aperi"
  | "terminal-valve"
  | "repair"
  | "terminal-flow"
  | "facility-unlocked"
  | "placement"
  | "epilogue"
  | "complete";

export type RobotMood = "observing" | "smug" | "alarmed" | "pleased" | "quiet";

export interface GameProgress {
  version: 1;
  stage: Stage;
  learnedWords: string[];
  completedExerciseIds: string[];
  mistakes: Record<string, number>;
  facility: { status: "locked" | "unlocked" | "placed"; cell: number | null };
  robot: { mood: RobotMood; rapport: number };
  lastSavedAt: number;
}

export interface ChoiceExercise {
  id: string;
  kind: "choice";
  prompt: string;
  context: string;
  options: Array<{ id: string; label: string }>;
  correctAnswer: string;
  hint: string;
  success: string;
}

export interface TypedExercise {
  id: string;
  kind: "typed";
  prompt: string;
  context: string;
  acceptedAnswers: string[];
  hint: string;
  success: string;
}

export type Exercise = ChoiceExercise | TypedExercise;
