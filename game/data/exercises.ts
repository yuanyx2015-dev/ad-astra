import type { Exercise } from "../types";

export const exercises: Record<string, Exercise> = {
  salve: {
    id: "salve",
    kind: "choice",
    prompt: "CRAS said salve when you woke. What did he mean?",
    context: "He used it as a greeting, immediately before commenting on your survival.",
    options: [
      { id: "hello", label: "Hello" },
      { id: "danger", label: "Danger" },
      { id: "sleep", label: "Go back to sleep" },
    ],
    correctAnswer: "hello",
    hint: "Listen to the situation: it was the first word of a greeting.",
    success: "SALVE · hello / greetings",
  },
  aqua: {
    id: "aqua",
    kind: "choice",
    prompt: "SALVE, VIATOR. QUID DEEST?",
    context: "The terminal asks what is missing. The water recycler is offline.",
    options: [
      { id: "aqua", label: "AQUA" },
      { id: "lux", label: "LUX" },
      { id: "cibus", label: "CIBUS" },
    ],
    correctAnswer: "aqua",
    hint: "CRAS just called water aqua. The broken system recycles water.",
    success: "AQUA · water",
  },
  valve: {
    id: "valve",
    kind: "typed",
    prompt: "APERI VALVAM AQUAE.",
    context: "Type the computer's instruction in English.",
    acceptedAnswers: [
      "open the water valve",
      "open water valve",
      "open the valve for water",
      "open the valve of water",
    ],
    hint: "aperi = open · valvam = valve · aquae = of/for water",
    success: "Correct. The terminal wants you to open the water valve.",
  },
  flow: {
    id: "flow",
    kind: "choice",
    prompt: "AQUA CURRIT.",
    context: "The pump has restarted. What status is the computer reporting?",
    options: [
      { id: "water-flows", label: "The water is flowing." },
      { id: "light-fails", label: "The light is failing." },
      { id: "food-ready", label: "The food is ready." },
    ],
    correctAnswer: "water-flows",
    hint: "You already know aqua. The moving blue gauge suggests what currit means.",
    success: "AQUA CURRIT · the water flows",
  },
};

export const requiredExerciseIds = ["salve", "aqua", "valve", "flow"];
