import type { Stage } from "../types";

export interface Beat {
  speaker: "CRAS" | "YOU";
  text: string;
}

export const chapter01 = {
  crawl: {
    title: "AD ASTRA",
    chapter: "CHAPTER I — AQUA",
    paragraphs: [
      "Humanity no longer waits for distant worlds to become hospitable.",
      "Advance crews cross the dark first, preparing small habitats for those who will follow.",
      "You, the companion unit CRAS, and the Master Computer are responsible for one such refuge on Mars.",
      "Eleven sols before the next arrivals, navigation fails. The horizon turns. The habitat falls.",
    ],
    continueLabel: "CONTINUE TO IMPACT",
    skipLabel: "SKIP INTRO",
  },
  impact: {
    status: ["NAVIGATION FAILURE", "TRAJECTORY LOST", "IMPACT"],
    action: "OPEN YOUR EYES",
  },
  beats: {
    "wake-salve": { speaker: "CRAS", text: "[[salve]], Human." },
    "salve-explain": { speaker: "CRAS", text: "Salve means hello." },
    "name-prompt": { speaker: "CRAS", text: "Before we proceed, what name do you prefer?" },
    "name-ack": { speaker: "CRAS", text: "Acknowledged, {name}. I will continue to call you Human." },
    "name-objection": { speaker: "YOU", text: "Then why did you ask my name?" },
    "name-joke": { speaker: "CRAS", text: "There are no other humans here. Your name provides no useful disambiguation." },
    "good-news": {
      speaker: "CRAS",
      text: "You have been unconscious for seventeen hours.\nI have excellent news.\nYou are not dead.",
    },
    "less-news": { speaker: "CRAS", text: "The less excellent news is that [[aqua]] [[deest]]." },
    "no-aqua": { speaker: "CRAS", text: "We have no [[aqua]]." },
    "aqua-guess": { speaker: "CRAS", text: "Before I translate it: what do you think [[aqua]] means?" },
    "recycler-offline": { speaker: "CRAS", text: "The recycler is offline. [[aqua]] [[non]] [[est]]." },
    "return-water": { speaker: "CRAS", text: "[[aqua]] [[est]]." },
    "chapter-review": { speaker: "CRAS", text: "Before we discuss the crash, account for the words you have encountered." },
    "ending-now": { speaker: "YOU", text: "Now tell me what happened." },
    "ending-crashed": { speaker: "CRAS", text: "We crashed." },
    "ending-noticed": { speaker: "YOU", text: "I noticed." },
    "ending-observant": { speaker: "CRAS", text: "Yes. You are becoming observant." },
    "ending-why": { speaker: "YOU", text: "Why did we crash?" },
    "ending-log": { speaker: "CRAS", text: "The impact log is offline with the primary power system." },
    "ending-convenient": { speaker: "YOU", text: "Convenient." },
    "ending-defense": { speaker: "CRAS", text: "I did not design the crash." },
    "ending-power": { speaker: "CRAS", text: "We should restore power." },
  } satisfies Partial<Record<Stage, Beat>>,
  name: {
    label: "Preferred name",
    placeholder: "Your name",
    submitLabel: "Record name",
  },
  aquaGuess: {
    label: "Your hypothesis",
    placeholder: "English meaning",
    submitLabel: "Record hypothesis",
  },
  terminal: {
    heading: "MASTER COMPUTER",
    question: ["[[salve]], [[viator]].", "[[quid]] [[deest]]?"],
    inputLabel: "Latin answer",
    helpLabel: "What does this mean?",
    helpResponse: "Quid deest? — What is missing?",
    correct: ["AQUA.", "[[recte]]."],
    correctResponse: "Correct.\nI was preparing a longer explanation.\nThis outcome is personally disappointing.",
    command: ["AQUA DEEST.", "[[aperi]]."],
    aperiHelpLabel: "What does aperi mean?",
    aperiHelpResponse: "Open.",
    success: "AQUA: [[bene]]",
    returnLabel: "Return to habitat",
    controls: [
      { id: "air", symbol: "○", label: "AIR LINE" },
      { id: "water", symbol: "◇", label: "WATER" },
      { id: "thermal", symbol: "△", label: "THERMAL" },
    ],
    controlErrors: {
      air: "That would open the habitat air line.",
      thermal: "That is the thermal bleed.",
    },
    errors: {
      englishTerminal: "IGNOTUM.",
      englishCras: "It remains stubbornly Latin.",
      hints: [
        "Consider the system that is failing.",
        "The recycler is dry.",
        "You encountered the relevant word earlier.",
      ],
      reviewLabel: "Review Language Log",
    },
  },
  languageLog: {
    button: "LANGUAGE LOG",
    title: "Language Log",
    close: "Close",
    saveGuess: "Save guess",
    guessPlaceholder: "Your English guess",
    empty: "No Latin encountered yet.",
    reviewTitle: "Chapter review",
    reviewInstruction: "Give every unknown word a hypothesis. Yellow and red entries may remain unresolved.",
    reviewContinue: "Continue",
  },
  chapterEnd: "CHAPTER I — AQUA",
  continueLabel: "Continue",
} as const;

export function beatForStage(stage: Stage): Beat | undefined {
  return (chapter01.beats as Partial<Record<Stage, Beat>>)[stage];
}

export function markedTextsForStage(stage: Stage): string[] {
  if (stage === "terminal-question") return [...chapter01.terminal.question];
  if (stage === "terminal-correct") return [...chapter01.terminal.correct];
  if (stage === "terminal-aperi") return [...chapter01.terminal.command];
  if (stage === "water-good") return [chapter01.terminal.success];
  const beat = beatForStage(stage);
  return beat ? [beat.text] : [];
}
