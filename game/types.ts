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
export type GlossMatch = "exact" | "close" | "incorrect";

export interface LanguageLogEntry {
  lemma: string;
  playerGuess: string;
  canonicalGloss: string;
  status: LogStatus;
  evidenceKnown: boolean;
  canonicalRevealed: boolean;
  helpLevel: number;
  matchQuality: GlossMatch | null;
}

export type LanguageLog = Record<string, LanguageLogEntry>;

export interface GameProgress {
  version: 4;
  stage: Stage;
  playerName: string;
  languageLog: LanguageLog;
  terminalAttempts: number;
  lastTerminalError: "english" | "other" | null;
  askedAperi: boolean;
  waterRestored: boolean;
  lastSavedAt: number;
}
