export type Stage =
  | "title"
  | "morning"
  | "less-news"
  | "you-what"
  | "repeat-aqua"
  | "no-aqua"
  | "aqua-choice"
  | "aqua-response"
  | "salve-terminal"
  | "salve-explain"
  | "salve-choice"
  | "salve-response"
  | "recycler-offline"
  | "terminal-question"
  | "terminal-correct"
  | "terminal-aperi"
  | "water-good"
  | "return-water"
  | "you-six"
  | "final";

export type RobotMood = "neutral" | "amused" | "concerned" | "annoyed";

export interface LearningState {
  aqua: "unseen" | "encountered" | "inferred" | "recalled";
  salve: "unseen" | "recognized";
  deest: "unseen" | "inferred";
  bene: "unseen" | "recognized";
  nonEst: "unseen" | "exposed" | "inferred";
  aperi: "unseen" | "encountered" | "action-understood";
  quidRecteViator: "unseen" | "exposed";
}

export interface GameProgress {
  version: 2;
  stage: Stage;
  learning: LearningState;
  aquaChoice: "system" | "unclear" | null;
  salveChoice: "salve" | "hello" | null;
  terminalAttempts: number;
  lastTerminalError: "english" | "other" | null;
  askedAperi: boolean;
  lastSavedAt: number;
}
