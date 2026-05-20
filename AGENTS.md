# IFR Refresher Agent Context

## Project context

- Project name: IFR Refresher / IFR Quick Study
- Owner: Hayden
- Active tier: Tier 2 internal/personal pilot-prep tool. Promote to Tier 3 before public/paying/external pilot use.
- Executor mode: Hermes/Codex unless another executor is explicitly proven available.
- Framework: Next.js 16 App Router, static/offline-first PWA.
- Package manager: npm.
- Primitive engine: Radix/shadcn in existing code; do not migrate primitives without a plan.
- Styling: Tailwind CSS v4 plus IFR CSS tokens in `src/app/globals.css`.
- Offline: Serwist service worker plus IndexedDB/local storage for progress.

## Data classes

- Study content: public/internal aviation study material.
- User progress/history: personal local-only browser data.
- No backend, no auth, no server-side PII, no tenant/customer data.
- Treat CASA/AIP/ERSA content as safety-adjacent: do not change aviation rules, numbers, or references without a source/date note.

## Critical paths requiring extra care

- `src/content/data/**`
- `src/content/model/section.ts`
- `src/features/drill/model/buildDrillQuestions.ts`
- `src/features/quiz/model/buildQuizQuestions.ts`
- `src/features/drill/hooks/useDrill.ts`
- `src/features/quiz/hooks/useQuizSession.ts`
- `src/platform/storage/idbStorage.ts`
- `src/platform/pwa/sw.ts`
- `src/app/manifest.ts`
- `package.json`
- `package-lock.json`

## Verification commands

Run before claiming done unless explicitly skipped with reason:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm audit --omit=dev
npm run pillars:lint:advisory
npm run frontend:lint:advisory
```

For UI/PWA work, also run the relevant Playwright/Lighthouse checks once they exist:

```bash
npm run playwright
npm run lighthouse
```

## Non-negotiables

- No unscoped broad rewrites.
- No weakening tests/lint/typecheck/build to pass gates.
- No aviation content change without source, review date, and content verification update.
- No service-worker/PWA changes without browser/offline smoke.
- No hard-coded new colours in TSX/JSX; use IFR tokens or documented metadata constants.
- Inline `style={{ ... }}` is allowed only for CSS-variable escape hatches or documented 3D transform exceptions.
- Client-side hidden/disabled UI is UX only, never security.
- If a command is not run, state why.
