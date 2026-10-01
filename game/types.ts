export type Stage =
  | "crawl"
  | "impact"
  | "wake-salve"
  | "salve-explain"
  | "name-prompt"
  | "name-ack"
  | "name-objection"
  | "name-joke"
  | "good-news"
  | "less-news"
  | "no-aqua"
  | "aqua-guess"
  | "recycler-offline"
  | "terminal-question"
  | "terminal-correct"
  | "terminal-aperi"
  | "water-good"
  | "return-water"
  | "chapter-review"
  | "ending-now"
  | "ending-crashed"
  | "ending-noticed"
  | "ending-observant"
  | "ending-why"
  | "ending-log"
  | "ending-convenient"
  | "ending-defense"
  | "ending-power"
  | "chapter-end";

export type RobotMood = "neutral" | "amused" | "concerned" | "annoyed";
export type LogStatus = "UNKNOWN" | "HYPOTHESIS" | "CONFIRMED" | "CONTRADICTED";

export interface LanguageLogEntry {
  lemma: string;
  guess: string;
  status: LogStatus;
  evidenceKnown: boolean;
}

export type LanguageLog = Record<string, LanguageLogEntry>;

export interface GameProgress {
  version: 3;
  stage: Stage;
  playerName: string;
  languageLog: LanguageLog;
  terminalAttempts: number;
  lastTerminalError: "english" | "other" | null;
  askedAperi: boolean;
  waterRestored: boolean;
  lastSavedAt: number;
}
