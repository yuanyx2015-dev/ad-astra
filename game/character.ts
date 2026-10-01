import type { GameProgress, RobotMood } from "./types";

export const robotAssets: Record<RobotMood, string> = {
  neutral: "/assets/chapter1/cras_neutral.png",
  amused: "/assets/chapter1/cras_amused.png",
  concerned: "/assets/chapter1/cras_concerned.png",
  annoyed: "/assets/chapter1/cras_annoyed.png",
};

export function robotMood(progress: GameProgress): RobotMood {
  if (progress.stage === "aqua-response") return progress.aquaChoice === "system" ? "amused" : "annoyed";
  if (progress.stage === "salve-response") return progress.salveChoice === "salve" ? "amused" : "annoyed";
  if (["less-news", "no-aqua", "recycler-offline"].includes(progress.stage)) return "concerned";
  if (["repeat-aqua", "terminal-question"].includes(progress.stage) && progress.terminalAttempts > 0) return "annoyed";
  if (["salve-explain", "terminal-correct", "return-water", "final"].includes(progress.stage)) return "amused";
  return "neutral";
}
