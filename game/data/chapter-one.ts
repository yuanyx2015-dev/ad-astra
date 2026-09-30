import type { RobotMood, Stage } from "../types";

export interface StoryBeat {
  speaker: "CRAS" | "BASE COMPUTER" | "MISSION CONTROL" | "NARRATOR";
  channel: string;
  text: string;
  mood: RobotMood;
  action?: string;
  latinOnly?: boolean;
}

export const chapterOne: Record<Stage, StoryBeat> = {
  "intro-wake": {
    speaker: "CRAS", channel: "LOCAL CHANNEL", mood: "observing",
    text: "Emergency wake cycle complete. I have excellent news: you are not dead. The less excellent news is making a very dramatic noise behind the wall.",
    action: "Open your eyes",
  },
  "intro-choice": {
    speaker: "CRAS", channel: "LOCAL CHANNEL", mood: "smug",
    text: "Salve, astronaut. That means hello. I have decided to improve your Latin while we repair the base. Unnecessary challenges are the spine of human development.",
  },
  "learn-salve": {
    speaker: "CRAS", channel: "FIELD LESSON 01", mood: "smug",
    text: "A small test. Your brain is warm, the oxygen is stable, and excuses would only embarrass us both.",
  },
  "learn-aqua": {
    speaker: "CRAS", channel: "RECYCLER BAY", mood: "alarmed",
    text: "The recycler is dry. Aqua means water — the substance humans insist on carrying inside themselves. Remember aqua. The base computer will not repeat itself in English because it has standards.",
    action: "Approach the terminal",
  },
  "terminal-aqua": {
    speaker: "BASE COMPUTER", channel: "TERMINAL / CUSTOS", mood: "observing",
    text: "SALVE, VIATOR. QUID DEEST?",
    latinOnly: true,
  },
  "learn-aperi": {
    speaker: "CRAS", channel: "RECYCLER BAY", mood: "smug",
    text: "Aperi means open. The hatch says APERI; the fact that it is welded shut is the hatch's personal failure, not Latin's.",
    action: "Read the next instruction",
  },
  "terminal-valve": {
    speaker: "BASE COMPUTER", channel: "TERMINAL / CUSTOS", mood: "observing",
    text: "APERI VALVAM AQUAE.",
    latinOnly: true,
  },
  repair: {
    speaker: "CRAS", channel: "RECYCLER BAY", mood: "alarmed",
    text: "Now do what the Latin said. Choose the water valve. I advise against the oxygen line unless today's lesson is intended to become extremely memorable.",
  },
  "terminal-flow": {
    speaker: "BASE COMPUTER", channel: "TERMINAL / CUSTOS", mood: "pleased",
    text: "AQUA CURRIT.",
    latinOnly: true,
  },
  "facility-unlocked": {
    speaker: "CRAS", channel: "BASE NETWORK", mood: "pleased",
    text: "Water restored. You have repaired a machine by reading Latin on Mars, which is exactly the sort of sentence mission planners avoid writing in advance.",
    action: "Open base overview",
  },
  placement: {
    speaker: "MISSION CONTROL", channel: "BASE OVERVIEW", mood: "pleased",
    text: "The recycler is ready to join the permanent base plan. Select an open foundation tile.",
  },
  epilogue: {
    speaker: "CRAS", channel: "QUIET CHANNEL", mood: "quiet",
    text: "Aliquando stellae quoque solae sunt.",
    action: "End chapter",
  },
  complete: {
    speaker: "NARRATOR", channel: "CHAPTER COMPLETE", mood: "pleased",
    text: "The recycler hums through the habitat walls. Somewhere above the dust, the first arrivals are still eleven sols away.",
  },
};

export const vocabulary = [
  { latin: "salve", english: "hello", sourceStage: "learn-salve" },
  { latin: "aqua", english: "water", sourceStage: "terminal-aqua" },
  { latin: "aperi", english: "open", sourceStage: "terminal-valve" },
  { latin: "currit", english: "flows / runs", sourceStage: "terminal-flow" },
];
