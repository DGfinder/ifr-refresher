# Storage Contract — IFR Refresher

Status: Accepted
Last updated: 2026-05-20

## Storage model

The app has no backend. User progress/history is local-only browser state stored through `src/platform/storage/idbStorage.ts`.

Feature-specific storage belongs beside the feature that owns the data, not in generic helpers.

## Current storage owners

| Data | Owner | Notes |
|---|---|---|
| Active program | `features/programs/context/ProgramContext.tsx` | Program IDs are stable contracts. |
| Drill stats / FSRS state | `features/drill/hooks/useDrill.ts`, `features/drill/hooks/useFSRS.ts` | Question IDs are stable contracts. |
| Quiz history | `features/quiz/storage/quizHistoryStore.ts` | Quiz result shape is user-visible history. |
| Study streak | `features/progress/model/studyStreak.ts` | Date logic is local browser time/ISO-date based. |

## Rules

1. Do not rename storage keys without a migration.
2. Do not change section/module/question/program IDs casually.
3. Do not move feature persistence into `shared` or generic `utils`.
4. New persisted data gets an owner module and a short contract note here.
5. Storage failure should degrade gracefully: content should remain readable even if progress is missing.

## Migration requirement

Any breaking storage change must include:

- previous key/shape,
- new key/shape,
- migration function or explicit reset decision,
- tests for old data where practical,
- user-visible risk note if progress may be lost.
