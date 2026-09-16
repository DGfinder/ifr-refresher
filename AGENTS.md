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

Latest scope extension: owner authorised agents to add applicable Australian examples to other topics where useful. Use short, contextual prose (situation, action, reason), simple titles and nearby source references. Do not force an example onto every topic. Root reviews and integrates agent research; source text remains unchanged. This supersedes the three-pilot limit below.

Writing standard for new explanations: write for someone encountering the example for the first time. Establish the pilot’s position, aircraft and relevant conditions before introducing a decision or calculation. Use short, connected sentences and explain what each number represents. KISS means removing repetition and generic commentary, not removing necessary context or writing in shorthand. Keep essential definitions beside the numbers they explain. Preserve distinctions such as cruise time versus time to landing and assumed versus aircraft-specific fuel flow. Apply this to authored additions only; baseline source wording stays immutable.

Latest authorisation: trial three Australian operational examples within their existing topics: fuel/alternates, equipment defects and landing minima. Preserve baseline wording. These additions require targeted current official references and explicit fictional assumptions; broader enrichment and baseline regulatory revision remain deferred. See `docs/reviews/2026-09-13-operational-pilots.md`.

Read `docs/product/curriculum-reset.md` before proposing or implementing learning content, navigation or UI changes. This supersedes the earlier feature-expansion and visual-workbook direction.

- The supplied IFR Cheat Sheet V7.1 is the canonical starting curriculum: follow its topics, order and scope. Current CASA/Airservices publications govern regulatory correctness.
- Build text-first. Map every lesson to exact cheat-sheet pages before authoring it. Any extension must identify its parent topic, source and specific learning need.
- Latest owner correction: capture the baseline FIRST. Current scope is the unchanged supplied cheat sheet and faithful source capture only. Do not add explanations, operational context, scenarios, questions or interpretive summaries yet. Previous enriched drafts are parked in docs/curriculum/deferred-context and must not be treated as baseline content. Current-publication verification remains deferred.
- Use one canonical lesson per topic. Summaries, questions and future diagrams belong to that lesson; do not create parallel topic libraries or duplicate banks of facts.
- Reading layout is now mapped for all 51 topics. Keep baseline text immutable during formatting work. Rebuild/validate presentation maps with `node scripts/build-reading-plans.mjs` and `node scripts/check-reading-plans.mjs`; word coverage alone is insufficient without paragraph/list/visual review.
- Subsequent owner authorisation: implement the captured baseline as a simple contents-and-reader site and create brand mockups. The 51 source topics now drive `/study`; `/design-system` compares three styles using the same reader. This does not authorise curriculum enrichment. Legacy practice routes redirect to contents; their implementations remain recoverable.
- The reset starts with the source baseline and topic-to-page map. Develop enriched lessons only in a later authorised stage. Do not bulk-generate or automatically migrate existing content.
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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
