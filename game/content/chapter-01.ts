import type { Stage } from "../types";

export interface Beat {
  speaker: "CRAS" | "YOU";
  text: string;
}

export const chapter01 = {
  crawl: {
    title: "AD ASTRA",
    chapter: "CHAPTER I — AQUA",
    durationMs: 19000,
    paragraphs: [
      "Humanity has begun its first permanent expansion beyond Earth.",
      "Advance crews travel ahead, preparing small habitats for those who will follow.",
      "You, the companion unit CRAS, and the Master Computer are responsible for one such refuge on Mars.",
      "The next crew arrives in eleven sols.",
      "Your assignment is simple:\nkeep the habitat alive until they get here.",
    ],
    skipLabel: "SKIP INTRO",
  },
  prologue: {
    phases: [
      { id: "crawl", message: "" },
      { id: "calm", durationMs: 1000, message: "" },
      { id: "navigation-warning", durationMs: 1200, message: "NAVIGATION WARNING" },
      { id: "navigation-failure", durationMs: 800, message: "NAVIGATION FAILURE" },
      { id: "signal-lost", durationMs: 700, message: "SIGNAL LOST" },
      { id: "impact", durationMs: 400, message: "IMPACT" },
      { id: "blackout", durationMs: 1700, message: "" },
    ],
  },
  impact: {
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
    coreVocabulary: ["salve", "aqua", "deest", "non", "est", "viator", "quid", "recte", "aperi", "bene"],
    button: "LANGUAGE LOG",
    title: "Language Log",
    close: "Close",
    saveGuess: "Record hypothesis",
    guessPlaceholder: "Your English guess",
    empty: "No Latin encountered yet.",
    reviewTitle: "Confirm discoveries",
    reviewInstruction: "Place your ten discoveries side by side. Record a hypothesis for each, then verify them together.",
    reviewVerify: "VERIFY",
    reviewContinue: "Continue to the crash conversation",
    reviewSummary: {
      discovered: "{count} words discovered",
      confirmed: "{count} hypotheses confirmed",
      revision: "{count} require revision",
    },
    statusLabels: {
      UNKNOWN: "UNKNOWN",
      HYPOTHESIS: "HYPOTHESIS",
      CONFIRMED: "CONFIRMED",
      CONTRADICTED: "CONTRADICTED",
    },
    askCras: "Ask CRAS",
    crasHints: {
      salve: "You heard it used as an opening greeting, before anything else was discussed.",
      aqua: "It is the substance the failed recycler could not provide.",
      deest: "The Master Computer used it while asking about something absent from the habitat.",
      non: "It turns a statement into its opposite.",
      est: "Compare aqua non est with aqua est after the repair.",
      viator: "The Master Computer used it to address a person making a journey.",
      quid: "It begins the computer's question about the missing thing.",
      recte: "The computer displayed it immediately after your correct operational response.",
      aperi: "It appeared immediately before you selected a control to act on the system.",
      bene: "It described the water system after restoration.",
    },
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
