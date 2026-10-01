export interface LexiconItem {
  lemma: string;
  acceptedGlosses: string[];
}

export const lexicon: Record<string, LexiconItem> = {
  salve: { lemma: "salve", acceptedGlosses: ["hello", "hi", "greeting", "greetings"] },
  aqua: { lemma: "aqua", acceptedGlosses: ["water"] },
  deest: { lemma: "deest", acceptedGlosses: ["is missing", "missing", "is absent", "absent", "is lacking", "lacks"] },
  non: { lemma: "non", acceptedGlosses: ["not", "no"] },
  est: { lemma: "est", acceptedGlosses: ["is", "exists"] },
  viator: { lemma: "viator", acceptedGlosses: ["traveler", "traveller", "wayfarer"] },
  quid: { lemma: "quid", acceptedGlosses: ["what"] },
  recte: { lemma: "recte", acceptedGlosses: ["correct", "correctly", "right"] },
  aperi: { lemma: "aperi", acceptedGlosses: ["open", "open it"] },
  bene: { lemma: "bene", acceptedGlosses: ["well", "good", "fine"] },
};
