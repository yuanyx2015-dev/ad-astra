# Chapter II LUX

Source: the approved `AD_ASTRA_完整游戏剧本.docx`, Chapter II, scenes 2.1–2.4. Dialogue, branches, the maintenance card, three language actions, ten core review words and untranslated final promise follow that manuscript. Paragraphs are split into existing Continue beats. The cabinet and circuit choices use accessible controls; no new art is required.

Editable content lives in `game/content/chapter-02.ts`; vocabulary, accepted synonyms and three-level review hints live in `game/content/chapter-02-lexicon.ts`. Surface forms such as aquam, bona and serva map to aqua, bonus and servo. Optional words receive help but do not gate the ten-word review. The final promise remains untranslated.

Chapter I's end card now continues into LUX after water is restored and its ten words are confirmed. The same dialogue surface, terminal, Language Log, CRAS assets and habitat image are used. Primary-power restoration changes the habitat lighting while leaving its water-online asset in place.

The existing `ad-astra.chapter-01.v4` local-storage key and version are retained. Loading older v4 saves fills only the new `powerRestored` and `chapter2Help` defaults and any missing log metadata; it preserves the current stage, name, guesses, confirmations and water state. Task help and per-word help persist. Incorrect actions never reset circuits, consume resources or advance the story. Chapter II ends at its chapter card, with no Chapter III route.

Run `npm test` for the Chapter I regression and Chapter II continuity/help tests. Use the same preview origin to retain browser-local saves. Other origins have separate browser storage.
