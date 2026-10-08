import type { LexiconItem } from "./lexicon";

// Chapter II of AD ASTRA 完整游戏剧本.docx. Surface forms share one lemma.
const word = (lemma: string, canonicalGloss: string, acceptedGlosses: string[]): LexiconItem => ({ lemma, canonicalGloss, acceptedGlosses });
export const chapter02Lexicon: Record<string, LexiconItem> = {
  lux: word("lux", "light; daylight", ["light", "daylight", "the light", "brightness"]),
  lumen: word("lumen", "light; a light", ["light", "a light", "lamp", "glow", "brightness"]),
  nox: word("nox", "night", ["night", "nighttime", "night time"]),
  dies: word("dies", "day", ["day", "daytime", "day time"]),
  nunc: word("nunc", "now", ["now", "right now", "at present", "the present moment"]),
  primus: word("primus", "first", ["first", "the first", "1st"]),
  magnus: word("magnus", "large; great", ["large", "great", "big", "huge"]),
  parvus: word("parvus", "small", ["small", "little", "tiny"]),
  tutus: word("tutus", "safe; protected", ["safe", "protected", "secure", "not in danger", "out of danger"]),
  servo: word("servo", "preserve; protect; save", ["preserve", "protect", "save", "keep safe", "retain", "keep", "I preserve", "I protect", "I save"]),
  tenebrae: word("tenebrae", "darkness", ["darkness", "dark", "the dark"]),
  sol: word("sol", "sun", ["sun", "the sun"]),
  adhuc: word("adhuc", "so far; still", ["so far", "still", "until now"]),
  iam: word("iam", "already; now", ["already", "now"]),
  semper: word("semper", "always", ["always", "every time"]),
  numquam: word("numquam", "never", ["never", "not ever"]),
  secundus: word("secundus", "second", ["second", "the second", "2nd"]),
  tertius: word("tertius", "third", ["third", "the third", "3rd"]),
  vetus: word("vetus", "old", ["old", "used"]),
  novus: word("novus", "new", ["new", "fresh"]),
  malus: word("malus", "bad", ["bad", "faulty", "broken"]),
  periculum: word("periculum", "danger; risk", ["danger", "risk", "hazard"]),
  bonus: word("bonus", "good", ["good"]),
  ignis: word("ignis", "fire", ["fire", "flame"]),
  umbra: word("umbra", "shadow; shade", ["shadow", "shade"]),
  unus: word("unus", "one", ["one", "1"]),
  duo: word("duo", "two", ["two", "2"]),
  tres: word("tres", "three", ["three", "3"]),
  et: word("et", "and", ["and"]),
  maneo: word("maneo", "remain; stay", ["remain", "stay", "I remain", "I stay"]),
  hora: word("hora", "hour", ["hour", "an hour"]),
  cognosco: word("cognosco", "learn; come to know", ["learn", "come to know", "come to understand", "understand", "find out"]),
  disco: word("disco", "learn", ["learn", "study", "I learn"]),
  doceo: word("doceo", "teach", ["teach", "I teach"]),
  festino: word("festino", "hasten; hurry", ["hasten", "hurry", "make haste"]),
  lente: word("lente", "slowly", ["slowly"]),
};

const contextualHints: Record<string, readonly [string, string]> = {
  lux: ["It was missing while the room was dark.", "It names the light we restored."],
  lumen: ["CRAS used it for the lamp and its glow.", "It is another word for light."],
  nox: ["It was ending outside the window.", "The dark part of the day."],
  dies: ["It arrives whether we repair the cabinet or not.", "The daylight part of the cycle; also a day."],
  nunc: ["CRAS used it to identify the time to start repairs.", "The present moment."],
  primus: ["It labels the top of the three ordered shelves.", "The position before second."],
  magnus: ["The cracked module had this size, but was not better.", "The opposite of small."],
  parvus: ["The intact replacement module had this size.", "The opposite of large."],
  tutus: ["The cracked module could not honestly be called this.", "Not in danger."],
  servo: ["The command kept the repaired water circuit intact.", "Keep something from being lost or harmed."],
};

export const chapter02Hints: Record<string, readonly string[]> = Object.fromEntries(
  Object.values(chapter02Lexicon).map((item) => [item.lemma, [
    ...(contextualHints[item.lemma] ?? ["Recall the sentence where CRAS used this word.", `In this scene, think of “${item.canonicalGloss.split(";")[0]}.”`]),
    `${item.lemma} means ${item.canonicalGloss}. Enter that meaning in your own words.`,
  ]]),
);
