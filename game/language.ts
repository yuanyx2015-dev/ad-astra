import { lexicon } from "./content/lexicon";
import type { LanguageLog, LanguageLogEntry } from "./types";

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
    next[lemma] = { lemma, guess: "", status: "UNKNOWN", evidenceKnown: false };
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
    next[lemma] = { lemma, guess: "", status: "UNKNOWN", evidenceKnown: false };
  }
  return next;
}

export function isAcceptedGloss(lemma: string, guess: string): boolean {
  const normalized = normalizeGloss(guess);
  return (lexicon[lemma]?.acceptedGlosses ?? []).some((gloss) => normalizeGloss(gloss) === normalized);
}

export function recordHypothesis(log: LanguageLog, lemma: string, guess: string): LanguageLog {
  const current = log[lemma];
  if (!current) return log;
  const trimmed = guess.trim();
  let status: LanguageLogEntry["status"] = trimmed ? "HYPOTHESIS" : "UNKNOWN";
  if (trimmed && current.evidenceKnown) status = isAcceptedGloss(lemma, trimmed) ? "CONFIRMED" : "CONTRADICTED";
  return { ...log, [lemma]: { ...current, guess: trimmed, status } };
}

export function validateLemma(log: LanguageLog, lemma: string): LanguageLog {
  const current = log[lemma];
  if (!current) return log;
  const status = current.guess
    ? (isAcceptedGloss(lemma, current.guess) ? "CONFIRMED" : "CONTRADICTED")
    : "UNKNOWN";
  return { ...log, [lemma]: { ...current, evidenceKnown: true, status } };
}

export function revealMeaning(log: LanguageLog, lemma: string, gloss: string): LanguageLog {
  const current = log[lemma];
  if (!current) return log;
  const guess = current.guess || gloss;
  return {
    ...log,
    [lemma]: {
      ...current,
      guess,
      evidenceKnown: true,
      status: isAcceptedGloss(lemma, guess) ? "CONFIRMED" : "CONTRADICTED",
    },
  };
}

export function unknownLemmas(log: LanguageLog): string[] {
  return Object.values(log).filter((entry) => entry.status === "UNKNOWN").map((entry) => entry.lemma);
}
