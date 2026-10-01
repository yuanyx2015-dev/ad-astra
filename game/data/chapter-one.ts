import type { Stage } from "../types";

export interface Beat {
  speaker: "CRAS" | "YOU";
  text: string;
}

export const beats: Partial<Record<Stage, Beat>> = {
  morning: {
    speaker: "CRAS",
    text: "Good morning.\nYou have been unconscious for seventeen hours.\nI have excellent news.\nYou are not dead.",
  },
  "less-news": { speaker: "CRAS", text: "The less excellent news is that aqua deest." },
  "you-what": { speaker: "YOU", text: "What?" },
  "repeat-aqua": { speaker: "CRAS", text: "Aqua deest.\nI said it twice. Statistically, this should help." },
  "aqua-choice": { speaker: "CRAS", text: "We have no aqua." },
  "salve-terminal": { speaker: "CRAS", text: "SALVE, VIATOR." },
  "salve-explain": { speaker: "CRAS", text: "Salve is a greeting." },
  "recycler-offline": { speaker: "CRAS", text: "The recycler is offline. Aqua non est." },
  "return-water": {
    speaker: "CRAS",
    text: "Aqua est.\n\nCongratulations.\nYou now possess both water and approximately six words of Latin.",
  },
  "you-six": { speaker: "YOU", text: "Six?" },
  final: { speaker: "CRAS", text: "I rounded up for morale." },
};

export function responseText(stage: Stage, aquaChoice: "system" | "unclear" | null, salveChoice: "salve" | "hello" | null): Beat | null {
  if (stage === "aqua-response") {
    return aquaChoice === "system"
      ? { speaker: "CRAS", text: "Bene. Your pattern-recognition systems survived." }
      : { speaker: "CRAS", text: "Water. Aqua. Please try to retain this information until lunchtime." };
  }
  if (stage === "salve-response") {
    return salveChoice === "salve"
      ? { speaker: "CRAS", text: "Bene. Alarmingly quick." }
      : { speaker: "CRAS", text: "Acceptable. Spiritually disappointing." };
  }
  return null;
}
