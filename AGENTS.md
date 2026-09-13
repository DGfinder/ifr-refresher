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

## Curriculum reset — owner direction, 13 September 2026

Read `docs/product/curriculum-reset.md` before proposing or implementing learning content, navigation or UI changes. This supersedes the earlier feature-expansion and visual-workbook direction.

- The supplied IFR Cheat Sheet V7.1 is the canonical starting curriculum: follow its topics, order and scope. Current CASA/Airservices publications govern regulatory correctness.
- Build text-first. Map every lesson to exact cheat-sheet pages before authoring it. Any extension must identify its parent topic, source and specific learning need.
- Use one canonical lesson per topic. Summaries, questions and future diagrams belong to that lesson; do not create parallel topic libraries or duplicate banks of facts.
- The reset starts with a topic-to-page map and one complete holding lesson for owner review before expanding the lesson pattern across the curriculum. Do not bulk-generate or automatically migrate existing content.
- Keep the core experience to contents/search → lesson → related next topic. Do not stack section-card grids, category lists and module grids on the same screen.
- Defer separate visual galleries, dashboards, gamification, multiple study modes and airline extensions from the reset's initial learner experience. Preserve existing work as a recoverable baseline rather than deleting it indiscriminately.
- Passing build, lint or tests proves neither instructional usefulness nor aviation correctness. Report code verification, source review and rendered UX verification separately; never imply an unperformed check passed.
- Before claiming a redesigned learner flow is complete, inspect its actual rendered desktop/mobile views and keyboard path under the applicable browser-tool permissions. If this cannot be done, explicitly report the flow as unverified.
- Do not use diagram disclaimers to justify omitting the lesson's central learning objective. For holding, entry, inbound course and departure as cleared are essential scope; an isolated racetrack rotation is not a complete holding lesson.

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
