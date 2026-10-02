import { lexicon } from "./content/lexicon";
import type { GlossMatch, LanguageLog, LanguageLogEntry } from "./types";

export interface MarkupSegment {
  text: string;
  lemma: string | null;
}

export function normalizeGloss(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"“”‘’]+/g, "")
    .replace(/\s+/g, " ");
}

export function parseLatinMarkup(text: string): MarkupSegment[] {
  const segments: MarkupSegment[] = [];
  const pattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) segments.push({ text: text.slice(cursor, index), lemma: null });
    segments.push({ text: match[1], lemma: (match[2] ?? match[1]).trim().toLowerCase() });
    cursor = index + match[0].length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), lemma: null });
  return segments;
}

export function collectMarkedLatin(log: LanguageLog, text: string): LanguageLog {
  let next = log;
  for (const { lemma } of parseLatinMarkup(text)) {
    if (!lemma || next[lemma]) continue;
    if (next === log) next = { ...log };
    next[lemma] = createLogEntry(lemma);
  }
  return next;
}

export function collectMarkedTexts(log: LanguageLog, texts: string[]): LanguageLog {
  return texts.reduce(collectMarkedLatin, log);
}

export function ensureLemmas(log: LanguageLog, lemmas: readonly string[]): LanguageLog {
  let next = log;
  for (const lemma of lemmas) {
    if (next[lemma]) continue;
    if (next === log) next = { ...log };
    next[lemma] = createLogEntry(lemma);
  }
  return next;
}

export function createLogEntry(lemma: string): LanguageLogEntry {
  return {
    lemma,
    playerGuess: "",
    canonicalGloss: lexicon[lemma]?.canonicalGloss ?? "",
    status: "UNKNOWN",
    evidenceKnown: false,
    canonicalRevealed: false,
    helpLevel: 0,
    matchQuality: null,
  };
}

export function assessGloss(lemma: string, guess: string): GlossMatch {
  const item = lexicon[lemma];
  const normalized = normalizeGloss(guess);
  if (!item || !normalized) return "incorrect";
  const canonicalMeanings = item.canonicalGloss.split(";").map(normalizeGloss);
  if (canonicalMeanings.includes(normalized)) return "exact";
  return item.acceptedGlosses.some((gloss) => normalizeGloss(gloss) === normalized) ? "close" : "incorrect";
}

export function isAcceptedGloss(lemma: string, guess: string): boolean {
  return assessGloss(lemma, guess) !== "incorrect";
}

export function recordHypothesis(log: LanguageLog, lemma: string, guess: string): LanguageLog {
  const current = log[lemma];
  if (!current) return log;
  const trimmed = guess.trim();
  const matchQuality = trimmed ? assessGloss(lemma, trimmed) : null;
  let status: LanguageLogEntry["status"] = trimmed ? "HYPOTHESIS" : "UNKNOWN";
  if (trimmed && current.evidenceKnown) status = matchQuality !== "incorrect" ? "CONFIRMED" : "CONTRADICTED";
  return { ...log, [lemma]: { ...current, playerGuess: trimmed, status, matchQuality } };
}

export function validateLemma(log: LanguageLog, lemma: string): LanguageLog {
  const current = log[lemma];
  if (!current) return log;
  const matchQuality = current.playerGuess ? assessGloss(lemma, current.playerGuess) : null;
  const status = current.playerGuess
    ? (matchQuality !== "incorrect" ? "CONFIRMED" : "CONTRADICTED")
    : "UNKNOWN";
  return { ...log, [lemma]: { ...current, evidenceKnown: true, status, matchQuality } };
}

export function revealMeaning(log: LanguageLog, lemma: string): LanguageLog {
  const current = log[lemma];
  if (!current) return log;
  const matchQuality = current.playerGuess ? assessGloss(lemma, current.playerGuess) : null;
  return {
    ...log,
    [lemma]: {
      ...current,
      canonicalRevealed: true,
      evidenceKnown: true,
      status: current.playerGuess ? (matchQuality !== "incorrect" ? "CONFIRMED" : "CONTRADICTED") : "UNKNOWN",
      matchQuality,
    },
  };
}

export function displayGloss(entry: LanguageLogEntry): string {
  return entry.status === "CONFIRMED" ? entry.canonicalGloss : entry.playerGuess;
}

export function unknownLemmas(log: LanguageLog): string[] {
  return Object.values(log).filter((entry) => entry.status === "UNKNOWN").map((entry) => entry.lemma);
}
