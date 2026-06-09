# Radio Calls Feature

Owns the scenario-based radio phraseology practice at `/radio`. Walks a learner
through a scripted ATC ↔ pilot exchange and at each pilot turn asks them to
pick the correct call from four options.

## Owns

- Radio session state machine (`hooks/useRadioSession.ts`) and its pure model
  (`model/buildRadioSession.ts`, `model/types.ts`).
- The session UI: dashboard, transmission feed, MCQ choice, results.

## Does not own

- The scenario content or schema — those live in `@/content` (`model/radio.ts`,
  `registry/radioScenarios.ts`, `data/radio/*.json`).
- Drill/FSRS persistence — future phases may feed individual MCQs into the
  spaced-repetition system through `@/features/drill`, but the radio feature
  does not own that mapping.

## Content contract

Every scenario must:

- Have a stable `scenarioId` (persisted history will reference it).
- Have stable `leg.id` and `question.id` strings within the scenario.
- Cite a real CASA / Airservices source (AIP, MATS, ERSA, CASR) with an
  access date in `refs`. The content gate (`scripts/check-content.mjs`)
  rejects scenarios that only carry placeholder provenance.
- Pilot legs that the learner must answer have a `question`; ATC legs and
  scripted pilot follow-ups have none.

## Out of scope (today)

- Audio playback / TTS — Phase 3.
- Speech recognition for verbal readback — Phase 3, online-only.
- Persisting radio session history to IndexedDB — Phase 2.
