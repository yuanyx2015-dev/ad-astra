# AD ASTRA — First Playable Prototype

## Technical design

AD ASTRA is a single-route React + TypeScript game built with Vite/Vinext. The interface is a responsive working surface rather than a marketing site. The first chapter is entirely client-side and saves one versioned progress record to `localStorage`.

The game is split into six small modules:

- `game/data/`: editable story beats, vocabulary, prompts, accepted answers, hints, and facility requirements.
- `game/assessment.ts`: deterministic choice and typed-answer assessment. `AssessmentProvider` is the seam for a future optional AI assessor; the chapter never needs a key or network call.
- `game/progression.ts`: ordered chapter state machine, exercise gates, learning rewards, facility unlock, and placement rules.
- `game/storage.ts`: versioned save/load/reset with safe fallback when saved data is missing or malformed.
- `game/character.ts`: CRAS mood/rapport presentation, kept independent from story content.
- `app/page.tsx`: view and input orchestration only.

The chapter cannot advance past an exercise until its curated answer is correct. Wrong answers increase a retry counter and reveal a hint, but never consume a resource or create a dead end. The water recycler unlocks only after all four language interactions, and may be placed only on open map cells.

## Chapter outline — “Aqua” (approximately 12–15 minutes)

1. **Emergency wake-up.** CRAS confirms the astronaut is alive and announces the broken water recycler. The player chooses how to respond; either response continues.
2. **Greeting in context.** CRAS mixes `salve` into English dialogue. The player identifies it as “hello.”
3. **Name the missing system.** CRAS introduces `aqua`. The Latin-only base computer asks `SALVE, VIATOR. QUID DEEST?`; the player selects `AQUA` from three plausible nouns.
4. **Transfer earlier knowledge.** CRAS introduces `aperi` beside a physical hatch. At the terminal, the player types an English interpretation of `APERI VALVAM AQUAE.` Accepted equivalents are documented in the exercise data.
5. **Practical repair.** The player applies the translated instruction by selecting the blue water valve rather than the oxygen or thermal lines.
6. **Read the result.** With contextual animation from the gauge, the player interprets `AQUA CURRIT.`
7. **Long-loop reward.** The restored water recycler unlocks as a facility and the player places it on one of four open foundation tiles in the base overview.
8. **Hidden-loop seed.** CRAS says `Aliquando stellae quoque solae sunt.` without translation. The chapter ends without resolving the emotional meaning.

## Prototype boundaries

- One chapter, one facility, four vocabulary items, and one placement action.
- No external API, AI grading, speech, inventory, freeform building, or complete relationship arc.
- Pixel art is deliberately sparse; gameplay and writing carry the prototype.
