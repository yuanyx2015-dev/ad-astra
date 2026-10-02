export interface LexiconItem {
  lemma: string;
  canonicalGloss: string;
  acceptedGlosses: string[];
}

export const lexicon: Record<string, LexiconItem> = {
  salve: { lemma: "salve", canonicalGloss: "hello; greetings", acceptedGlosses: ["hello", "hi", "greeting", "greetings", "hail"] },
  aqua: { lemma: "aqua", canonicalGloss: "water", acceptedGlosses: ["water"] },
  deest: {
    lemma: "deest",
    canonicalGloss: "is missing; is lacking",
    acceptedGlosses: ["is missing", "missing", "is lacking", "lacking", "is absent", "absent", "lacks", "not have", "don't have", "doesn't have", "dont have", "doesnt have"],
  },
  non: { lemma: "non", canonicalGloss: "not", acceptedGlosses: ["not", "no"] },
  est: { lemma: "est", canonicalGloss: "is; exists", acceptedGlosses: ["is", "exists", "there is", "is present"] },
  viator: { lemma: "viator", canonicalGloss: "traveler", acceptedGlosses: ["traveler", "traveller", "wayfarer", "a traveler", "someone traveling", "person traveling"] },
  quid: { lemma: "quid", canonicalGloss: "what", acceptedGlosses: ["what", "what is it"] },
  recte: { lemma: "recte", canonicalGloss: "correctly; rightly", acceptedGlosses: ["correct", "correctly", "right", "rightly", "that's right"] },
  aperi: { lemma: "aperi", canonicalGloss: "open", acceptedGlosses: ["open", "open it"] },
  bene: { lemma: "bene", canonicalGloss: "well", acceptedGlosses: ["well", "good", "fine", "okay", "ok", "working well"] },
};
