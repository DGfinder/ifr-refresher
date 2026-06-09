# Architecture Overview — IFR Refresher

Status: Accepted
Last updated: 2026-05-20

## Summary

IFR Refresher is a static, offline-first Next.js 16 PWA for CASA IFR study. It has no backend, no auth, no server database, and no tenant model. Study content is bundled as JSON, and user progress/history is stored locally in browser storage.

The architecture is intentionally simple but now follows a domain-first source layout:

```txt
Next route shell -> feature screen/hook -> feature model/storage -> content/platform/shared
```

## Runtime shape

```txt
Browser PWA
├── Static Next App Router pages
├── Static JSON aviation content bundled at build time
├── Serwist service worker for offline shell/content
└── IndexedDB/local storage for progress, quiz history, drill/FSRS state
```

There are no API routes or external runtime data dependencies.

## Main domains

- **Content** — source of truth for study sections, modules, content block shape, and rendered content blocks.
- **Programs** — named study/drill programs and the active program context.
- **Study** — browsing/searching/reading modules.
- **Drill** — extracting drill questions and tracking adaptive/FSRS drill progress.
- **Flashcards** — flashcard session presentation over drill questions.
- **Quiz** — MCQ generation, quiz state machine, scoring, and quiz history.
- **Radio calls** — scenario-driven radio phraseology practice over scripted ATC↔pilot exchanges (AIP / MATS sourced).
- **Progress** — progress summaries, streaks, and insights.
- **Platform/storage** — IndexedDB wrapper.
- **Platform/PWA** — service worker source and PWA support.

## Safety-adjacent content constraint

Aviation content is public/internal study material, but it is safety-adjacent. Any change to rules, numbers, references, or IDs requires:

1. Source/date evidence.
2. `npm run content:check`.
3. Relevant unit/browser smoke testing.
4. Update to `docs/content/content-verification.md` when source/review status changes.

## Persistence constraint

Local storage is user-visible state. Do not casually change:

- storage keys,
- question IDs,
- section IDs,
- module IDs,
- program IDs,
- quiz/drill/progress object shape.

If any of those must change, add a migration note and test the old-shape path.

## PWA constraint

`src/platform/pwa/sw.ts`, `next.config.ts`, `src/app/manifest.ts`, and `public/icons/**` form the offline/installable app contract. Changes require a production build and PWA/offline smoke.
