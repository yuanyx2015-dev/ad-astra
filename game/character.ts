import type { GameProgress, RobotMood } from "./types";

export const robotAssets: Record<RobotMood, string> = {
  neutral: "/assets/chapter1/cras_neutral.png",
  amused: "/assets/chapter1/cras_amused.png",
  concerned: "/assets/chapter1/cras_concerned.png",
  annoyed: "/assets/chapter1/cras_annoyed.png",
};

export function robotMood(progress: GameProgress): RobotMood {
  if (["less-news", "recycler-offline", "ending-log", "ending-power"].includes(progress.stage)) return "concerned";
  if (progress.stage === "terminal-question" && progress.lastTerminalError) return "annoyed";
  if (["name-joke", "terminal-correct", "ending-observant", "ending-defense"].includes(progress.stage)) return "amused";
  return "neutral";
}
