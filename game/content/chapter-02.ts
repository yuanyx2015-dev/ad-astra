import type { RobotMood, Stage } from "../types";
import type { Beat } from "./chapter-01";
import { chapter02Hints } from "./chapter-02-lexicon";

// Authoritative source: AD ASTRA 完整游戏剧本.docx, Chapter II, scenes 2.1–2.4.
// Only presentation breaks and control labels adapt the manuscript to Chapter I's UI.
export interface LuxStep extends Beat {
  id: `lux-${string}`;
  next?: Stage;
  kind?: "choice" | "task" | "review" | "end";
  mood?: RobotMood;
  choices?: readonly { label: string; next: Stage }[];
  card?: readonly string[];
}
const cras = (id: LuxStep["id"], text: string, extra: Partial<LuxStep> = {}): LuxStep => ({ id, speaker: "CRAS", text, ...extra });
const you = (id: LuxStep["id"], text: string): LuxStep => ({ id, speaker: "YOU", text });

export interface LuxTask {
  mode: "text" | "control";
  lines: readonly string[];
  prompt: string;
  acceptedAnswers: readonly string[];
  englishAnswers?: readonly string[];
  englishFeedback?: string;
  hints: readonly string[];
  next: Stage;
  controls?: readonly { id: string; label: string; symbol: string; detail: string }[];
  restoresPower?: boolean;
}

export const chapter02 = {
  title: "CHAPTER II — LUX",
  startLabel: "Continue to Chapter II — LUX",
  sol: "SOL 0",
  scene: {
    emergency: "Water flows through the pipes. The habitat lights are still dim and unstable.",
    restored: "Water is flowing. Primary power is restored; the habitat lights are steady.",
    emergencyLabel: "Habitat interior on emergency power, water flowing",
    restoredLabel: "Habitat interior with steady primary lighting, water flowing",
  },
  ui: {
    inputLabel: "Latin answer", submit: "Send", help: "Ask CRAS", reject: "IGNOTUM.",
    cabinetLabel: "Power cabinet modules", circuitLabel: "Circuit controls",
    openCabinet: "Open power cabinet", maintenanceCard: "Maintenance card",
    returnLabel: "Return to habitat", otherWords: "Earlier discoveries and other encountered words",
    reviewInstruction: "Place these ten new discoveries side by side, then verify them together. Your earlier confirmed words remain yours.",
    reviewContinue: "Return to the light", completion: "Water retained. Primary power restored.",
  },
  coreVocabulary: ["lux", "lumen", "nox", "dies", "nunc", "primus", "magnus", "parvus", "tutus", "servo"],
  crasHints: chapter02Hints,
  tasks: {
    "lux-question": {
      mode: "text", lines: ["[[AQUA|aqua]]: [[BENE|bene]].", "[[LUX|lux]] [[DEEST|deest]].", "[[QUID|quid]] [[DEEST|deest]]?"],
      prompt: "The water is flowing. The room is still dark. Answer the Master Computer in Latin.",
      acceptedAnswers: ["lux"], englishAnswers: ["light", "daylight"],
      englishFeedback: "You have understood what is missing. The Master Computer still needs its Latin name.",
      hints: ["The water is no longer the missing thing. Look at the room.", "It is the light we need, not another drink.", "Lux means light, especially daylight. The computer needs the word lux. Type lux yourself."],
      next: "lux-correct",
    },
    "lux-modules": {
      mode: "control", lines: ["[[PARVUS|parvus]]. [[NOVUS|novus]]. [[TUTUS|tutus]]."], prompt: "Choose the module described.",
      acceptedAnswers: ["small-new"],
      controls: [
        { id: "large-old", label: "Top module", symbol: "▰", detail: "LARGE · OLD · INTACT" },
        { id: "small-new", label: "Middle module", symbol: "▪", detail: "SMALL · NEW · INTACT" },
        { id: "large-cracked", label: "Bottom module", symbol: "▰ /", detail: "LARGE · CRACKED" },
      ],
      hints: ["Compare the description with the three modules, not with the three shelf positions alone.", "Parvus is small. Novus is new. The cracked module cannot be tutus.", "Tutus means safe. The correct module is the small, new, intact one in the middle. Select it yourself."],
      next: "lux-module-correct",
    },
    "lux-circuits": {
      mode: "control", lines: ["[[SERVA|servo]] [[AQUAM|aqua]].", "[[UNUS|unus]]: [[AQUA|aqua]].", "[[DUO|duo]]: [[AQUA|aqua]] [[ET|et]] [[LUX|lux]].", "[[TRES|tres]]: [[IGNIS|ignis]]."],
      prompt: "Read the instruction and choose the circuit action.", acceptedAnswers: ["retain-water"],
      controls: [
        { id: "retain-water", label: "Retain water circuit", symbol: "◇", detail: "Keep the repaired circuit running" },
        { id: "reset-all", label: "Reset all circuits", symbol: "↺", detail: "Disconnect every circuit" },
      ],
      hints: ["We have just restored one essential system. The computer does not want us to lose it.", "Aquam is the water you already know. The ending changed because it is the thing receiving the action.", "Serva means preserve or protect. Serva aquam means preserve the water. Choose retain water circuit."],
      next: "lux-power-good", restoresPower: true,
    },
  } satisfies Record<string, LuxTask>,
  steps: [
    you("lux-start", "Water first, power next. Then you tell me why we crashed."),
    cras("lux-sequence", "An excellent sequence. I particularly admire the part in which you do not attempt to interrogate an unpowered archive."),
    you("lux-powered", "You are powered."),
    cras("lux-cabinet-joke", "I am a companion unit, not a filing cabinet. Also, my filing cabinet is experiencing difficulties.", { mood: "amused" }),
    you("lux-rehearsed", "That sounded rehearsed."),
    cras("lux-darkness", "I have had seventeen hours to prepare, most of them in [[tenebris|tenebrae]]. Darkness. I do not recommend it as a decorative scheme."),
    you("lux-night", "Is it still night outside?"),
    cras("lux-dawn", "[[Nox|nox]], night, is ending. [[Dies|dies]], day, will arrive without consulting us. The [[sol]] is already on its way. Unfortunately, a sun outside does not repair a circuit inside."),
    you("lux-ready", "The base was supposed to be ready for us."),
    cras("lux-arrival", "It was. Then an arrival occurred at an unconventional angle. [[Adhuc|adhuc]], so far, you have restored water. [[Iam|iam]], already, that is more than this room had yesterday.", { kind: "choice", choices: [
      { label: "Tell me something encouraging.", next: "lux-encouraging" }, { label: "Tell me something useful.", next: "lux-useful" },
    ] }),
    cras("lux-encouraging", "You are improving. At this rate, the base may eventually meet the minimum requirements for being indoors.", { next: "lux-now", mood: "amused" }),
    cras("lux-useful", "The power cabinet opens manually. Your hands remain compatible with handles. This is an encouragingly stable standard."),
    cras("lux-now", "[[Nunc|nunc]] means now. A good time for repairs. [[Semper|semper]] means always, as in ‘always isolate a damaged circuit.’ [[Numquam|numquam]] means never, as in ‘never test a battery with your tongue.’ I include the second rule because humans have surprised me before."),
    you("lux-tongue", "I was not going to do that."),
    cras("lux-agree", "Then we agree on something. Let us preserve the moment."),
    cras("lux-question", "", { kind: "task" }),
    cras("lux-correct", "Light. You answered a familiar question without repeating an old answer. This is inconveniently good evidence that learning works.", { mood: "amused", card: ["[[LUX|lux]]. [[RECTE|recte]].", "[[APERI|aperi]]."] }),
    cras("lux-lumen", "[[Lumen|lumen]] is another word for light: the lamp, its glow, the useful brightness on a workbench. [[Lux|lux]] and [[lumen]] overlap. Latin has not signed a contract promising one English word per Latin word."),
    you("lux-english", "Neither has English."),
    cras("lux-communication", "Correct. You have collectively made communication a remarkably ambitious project.", { card: ["[[PRIMUS|primus]]: [[MAGNUS|magnus]], [[VETUS|vetus]].", "[[SECUNDUS|secundus]]: [[PARVUS|parvus]], [[NOVUS|novus]], [[TUTUS|tutus]].", "[[TERTIUS|tertius]]: [[MAGNUS|magnus]], [[MALUS|malus]]."] }),
    you("lux-ordinals", "First, second, third?"),
    cras("lux-shelves", "Yes. [[Primus|primus]], [[secundus]], [[tertius]]. The first module is large and old. The second is small and new. The third is large and bad. Its crack is an unusually frank product review."),
    you("lux-bigger", "Does large mean better?"),
    cras("lux-size", "[[Magnus|magnus]] means large or great. [[Parvus|parvus]] means small. Neither promises competence. I am small, and you have already witnessed my remarkable competence.", { mood: "amused" }),
    you("lux-confidence", "Your remarkable confidence."),
    cras("lux-danger", "A closely related measurement. The cracked module presents [[periculum]]: danger. The small intact module is [[tutus]], safe. We require safety, not an impressive silhouette.", { kind: "choice", choices: [
      { label: "The small one looks rather like you.", next: "lux-resemblance" }, { label: "Why keep the bad module?", next: "lux-parts" },
    ] }),
    cras("lux-resemblance", "It also has no need for dramatic entrances. I approve of the resemblance.", { next: "lux-bonus", mood: "amused" }),
    cras("lux-parts", "For parts, not optimism. A label saying ‘bad’ becomes dangerous only when somebody decides it means ‘probably fine.’"),
    you("lux-bonus", "This line says [[bonus]] beside a flame, but [[bona|bonus]] beside the light."),
    cras("lux-agreement", "[[Bonus|bonus]] means good. The ending changes to agree with the noun. [[Ignis|ignis]], fire, is grammatically masculine; [[lux]], light, is feminine. That is grammar, not a theory about the personalities of flames. [[Bonus|bonus]] [[ignis]]; [[bona|bonus]] [[lux]]. A safe module is not a safe flame. Please choose the object, not merely a pleasant adjective."),
    cras("lux-modules", "", { kind: "task" }),
    cras("lux-module-correct", "Small, new, safe. The cabinet has not asked you to buy the largest object. A refreshing departure from several human industries.", { mood: "amused" }),
    you("lux-brighter", "The room is getting brighter."),
    cras("lux-shadow", "A modest [[umbra]], shadow, now exists beneath my wheels. I had missed it. It makes me look substantially more grounded.", { card: ["[[SERVA|servo]] [[AQUAM|aqua]].", "[[UNUS|unus]]: [[AQUA|aqua]].", "[[DUO|duo]]: [[AQUA|aqua]] [[ET|et]] [[LUX|lux]].", "[[TRES|tres]]: [[IGNIS|ignis]]."] }),
    cras("lux-indicators", "That last line names the three indicators: one, water; two, water and light; three, fire. The third should remain dark. We are restoring illumination, not inaugurating a bonfire."),
    you("lux-serva", "And [[serva|servo]]?"),
    cras("lux-preserve", "Preserve. Protect. Keep something safe. [[Servo|servo]] is ‘I preserve’; [[serva|servo]] is a command to one person. Like [[aperi]], ‘open,’ it asks for an action rather than a translation essay. The following word names what must be preserved.", { kind: "choice", choices: [
      { label: "You could have led with that.", next: "lux-withholding" }, { label: "You sound unusually serious.", next: "lux-serious" },
    ] }),
    cras("lux-withholding", "I could. I am learning the difference between withholding an answer and withholding useful information.", { next: "lux-circuits" }),
    cras("lux-serious", "We have repaired something. I would prefer not to destroy it while celebrating.", { mood: "concerned" }),
    cras("lux-circuits", "", { kind: "task" }),
    cras("lux-power-good", "Water retained. Light restored. No fire. An exceptionally satisfying set of sentences.", { card: ["[[AQUA|aqua]]: [[BENE|bene]].", "[[LUX|lux]]: [[BENE|bene]].", "[[IGNIS|ignis]] [[NON|non]] [[EST|est]]."], mood: "amused" }),
    you("lux-log", "We can read the crash log now."),
    cras("lux-index", "We can read its index. The local file ends at the interruption. The complete recorder remained in the lander. We must recover it, then compare both records.", { mood: "concerned" }),
    you("lux-route", "This entry says the route changed."),
    cras("lux-it-did", "It did."),
    you("lux-did-you", "Did you change it?"),
    cras("lux-evidence", "Yes. I cannot demonstrate the reason from an index alone. I will not ask you to mistake my confidence for evidence.", { mood: "concerned" }),
    you("lux-reason", "You could still tell me your reason."),
    cras("lux-approach", "The planned approach became unsafe. I selected another path. I will explain the record when we can inspect it together. That is an explanation delayed, not an answer you owe me.", { kind: "choice", choices: [
      { label: "I want the evidence.", next: "lux-want-evidence" }, { label: "For now, I need you here.", next: "lux-remain" },
    ] }),
    cras("lux-want-evidence", "So do I. The cabinet is brighter now. My account should become brighter too.", { next: "lux-timestamp" }),
    cras("lux-remain", "Then I [[maneo]]. I remain. I can be useful without asking you to settle the entire question tonight."),
    cras("lux-timestamp", "There is a [[hora]], an hour, printed on the index. A timestamp is not a motive. We will [[cognoscere|cognosco]]—learn and come to understand—what happened, rather than merely agree about it."),
    you("lux-until", "And until then?"),
    cras("lux-learning", "You [[discis|disco]], learn; I [[doceo]], teach. Those are not the same job, despite my occasional attempts to perform both."),
    cras("lux-festina", "[[Festina|festino]] [[lente]]. Make haste slowly. We have eleven sols, not permission to be careless."),
    cras("lux-review", "", { kind: "review" }),
    you("lux-room", "The room looks different."),
    cras("lux-see", "It was always this room. You can see it now."),
    you("lux-stay", "Stay nearby."),
    // Deliberately unmarked: this original promise remains untranslated, not a required lemma.
    cras("lux-promise", "Non te relinquam."),
    cras("lux-end", "", { kind: "end" }),
  ] as LuxStep[],
} as const;

export function luxStep(stage: Stage): LuxStep | undefined {
  return chapter02.steps.find((step) => step.id === stage);
}

export function luxTask(stage: Stage): LuxTask | undefined {
  return (chapter02.tasks as Record<string, LuxTask>)[stage];
}

export function luxMarkedTexts(stage: Stage): string[] {
  const step = luxStep(stage);
  return [...(step ? [step.text, ...(step.card ?? [])] : []), ...(luxTask(stage)?.lines ?? [])];
}
