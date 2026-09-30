import type { GameProgress, RobotMood } from "./types";

export function describeRobotState(progress: GameProgress): { mood: RobotMood; label: string } {
  const mood = progress.robot.mood;
  const labels: Record<RobotMood, string> = {
    observing: "Observing",
    smug: "Pedagogically smug",
    alarmed: "Concerned, allegedly",
    pleased: "Quietly impressed",
    quiet: "Unusually quiet",
  };
  return { mood, label: labels[mood] };
}
