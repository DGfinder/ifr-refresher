# AUDIT_FINDINGS — IFR Refresher vs Pillars pack

Executor: Hermes Agent (gpt-5.5 via Discord thread)
Project path: `/Users/hayden/projects/ifr-companion`
Repo: `https://github.com/DGfinder/ifr-refresher.git`
Branch baseline: `main` up to date with `origin/main` (`git rev-list --left-right --count HEAD...origin/main` => `0 0`)
Declared tier assessed: Tier 2 internal/personal pilot-prep PWA; promote to Tier 3 before public/paying/external pilot use.
Data classes assessed: public/internal aviation study content; local-only personal progress/history; safety-adjacent CASA/AIP/ERSA content.
Art direction: committed in `docs/frontend/brand-kit.md`.
Uploaded standard read: `/tmp/pillars_files_doc_d411bdb3cfe0/PILLARS.md`, `PATTERNS.md`, `FRONTEND.md`, `starter-kit.zip` listing/reference shapes.

## Phase 1 orientation

This is a static/offline-first Next.js 16 App Router PWA for CASA IFR study, drill, flashcards, quiz, and progress insights. It has no backend, no auth, no server-side database, and stores user progress locally in IndexedDB. The highest-risk areas are not tenant/money/auth; they are aviation content provenance/currency, offline/PWA reliability, local storage degradation, and production browser/UI behaviour.

### Read

- Uploaded standard: all of `PILLARS.md`, `PATTERNS.md`, `FRONTEND.md`; starter-kit archive file listing and reference shape.
- Repo orientation and governance: `AGENTS.md`, `README.md`, `.pillars-lint.yml`, `.pillars-frontend.json`, `.github/workflows/ci.yml`, architecture/content/frontend/performance/runbook docs.
- Build/test/config: `package.json`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`, `tests/pwa.playwright.config.ts`, `scripts/check-content.mjs`, `scripts/run-lighthouse.mjs`, Pillars lint scripts by execution.
- Risk-heavy source: `src/content/model/section.ts`, content data inventory, `src/platform/pwa/sw.ts`, `src/platform/storage/idbStorage.ts`, `src/app/layout.tsx`, `src/app/manifest.ts`, `StorageStatusBanner`, PWA/browser tests.

### Not fully read

- I did not line-review every TSX component and every content JSON module end-to-end.
- I did not externally validate every aviation fact against current CASA/AIP/ERSA source material; that remains a human/domain-expert judgement call.
- I did not inspect GitHub Actions run history or deployed/public hosting state; assessment is local source + local commands.
- I did not perform code refactoring; this file is the hard-stop audit deliverable.

## Evidence commands

Passed after installing the missing local Playwright Chromium binary:

```text
git fetch origin --prune
git status --short --branch => ## main...origin/main, ?? .hermes/
git rev-list --left-right --count HEAD...origin/main => 0 0
npm run typecheck => pass
npm run lint => pass
npm run content:check => pass with 57 no-refs warnings
npm run test => 5 files / 91 tests passed
npm run build => Next/Serwist production build passed
npm audit --omit=dev => found 0 vulnerabilities
npm run pillars:lint:advisory => no mechanical violations
npm run frontend:lint:advisory => ok
npm run playwright => 18 passed after `npx playwright install chromium`
npm run playwright:pwa => 1 passed
npm run lighthouse => passed only after manually starting `npm run start -- --port 3101`; scores / perf .90 a11y .96 best .1 seo 1; /study .86/.96/1/1; /quiz .89/.94/1/1
```

Initial `npm run playwright` failed because the Playwright Chromium executable was not installed at `/Users/hayden/Library/Caches/ms-playwright/...`; `npx playwright install chromium` fixed the local environment. Initial standalone `npm run lighthouse` failed because no server was running on `127.0.0.1:3101`.

## Findings

### F1 — Aviation content provenance is incomplete for 57/105 modules

- **Gap**: Over half the study modules have empty `refs`, so safety-adjacent rules/numbers are not traceable module-by-module.
- **Violates**: `PILLARS §5` (prove behaviour/boundaries with evidence), `PILLARS §8` (tell the truth about data), `FRONTEND: Trust through honesty`.
- **Evidence**:
  - `scripts/check-content.mjs:61-63` treats missing refs as warnings, not errors.
  - `npm run content:check` passed while warning for modules including `administrative-part61.json:ADM-001` through `ADM-006`, `airspace-atc-services.json:ATC-001` etc.
  - Direct inventory: 57 modules missing refs out of 105 total modules.
  - Examples: `src/content/data/administrative-part61.json` modules `ADM-001`..`ADM-006`; `src/content/data/airspace-atc-services.json` modules `ATC-001`..`ATC-009`; `src/content/data/approaches.json` modules `APR-001`..`APR-010`.
  - The repo already acknowledges this: `docs/content/content-verification.md:28` says human aviation source verification is still required before external/public pilot use; `docs/content/content-verification.md:34-37` requires full review/source/version metadata before public pilot.
- **Risk**: A pilot studies stale or unsupported IFR material offline and treats it as current memory-refresh truth; the app can look polished while content confidence is uneven.
- **Severity**: High for Tier 2 safety-adjacent content; critical blocker before Tier 3/public/paying/external pilot.

### F2 — Lighthouse/performance budget is documented and locally passable, but not CI-enforced and the script is not self-starting

- **Gap**: Performance budget evidence exists locally only if a human remembers to start the server first; CI does not run Lighthouse.
- **Violates**: `PILLARS §5` (checks must prove risk-heavy flows), `PILLARS §8` (performance is architecture), `PILLARS §10` (done means checks green and evidence written down), `FRONTEND: Performance is felt as quality`.
- **Evidence**:
  - `docs/performance/performance-budget.md:31-35` documents manual two-step execution: build, start server on 3101, then `npm run lighthouse`.
  - `scripts/run-lighthouse.mjs:5-13` points at `http://127.0.0.1:3101` and does not start a server.
  - Running `npm run lighthouse` with no server produced a Chrome interstitial/load failure for `http://127.0.0.1:3101/`.
  - `.github/workflows/ci.yml:20-53` runs typecheck/lint/test/content/build/Playwright/PWA/Pillars/audit, but no `npm run lighthouse` step.
  - With `npm run start -- --port 3101` running, `npm run lighthouse` passed all budgets.
- **Risk**: Future changes can regress LCP/INP-like user experience and still pass CI; a developer can also misread standalone `npm run lighthouse` failure as product failure rather than harness setup.
- **Severity**: Medium for Tier 2; higher if external users depend on mobile/offline performance.

### F3 — Offline/storage degradation contract is only partially tested

- **Gap**: Offline route reload is covered, but local progress persistence and storage-failure recovery are documented as required and remain unchecked.
- **Violates**: `PILLARS §5` (test behaviours and boundaries that matter), `PILLARS §7` (recovery is tested, not assumed), `PILLARS §8` (every state is designed), `FRONTEND: Render state / Trust through honesty`.
- **Evidence**:
  - `docs/frontend/offline-sync-contract.md:32-35` lists required tests; only first-load-online → reload-offline is checked, while progress persistence and storage failure remain unchecked boxes.
  - `tests/e2e/pwa-offline.spec.ts:3-16` only verifies `/study` reloads offline after first load.
  - `src/platform/storage/idbStorage.ts:10-35` dispatches storage-error events and rethrows.
  - `src/app-shell/components/StorageStatusBanner.tsx:16-24` displays a degraded-storage banner once the event fires.
  - Search found no Playwright/Vitest test that forces IndexedDB/storage failure and asserts readable content + banner.
- **Risk**: Safari private mode, quota eviction, or blocked IndexedDB can silently break progress/save flows or produce an untested UX path, exactly where offline-first trust matters.
- **Severity**: Medium for Tier 2; high before public/mobile pilot.

## Strengths verified

- Repo identity/freshness is clean: `main` equals `origin/main`; no code diff beyond pre-existing untracked `.hermes/` and this audit output.
- Tier/data classification exists in `AGENTS.md:5-20`, `.pillars-lint.yml:1-15`, `.pillars-frontend.json:1-8`, and architecture docs.
- Domain/feature-first structure is largely in place (`src/app` thin route shells; `src/features`, `src/content`, `src/platform`, `src/shared`, `src/app-shell`).
- Mechanical gates are strong for a small PWA: typecheck, lint, unit tests, production build, runtime audit, Pillars/advisory frontend lint, Playwright smoke/a11y/responsive, PWA offline smoke, and manual Lighthouse all pass.
- UI has an explicit art direction (`docs/frontend/brand-kit.md`) and tokens in `src/app/globals.css`; inline style search found a CSS-variable escape hatch in `src/shared/ui/ProgressBar.tsx:40`, not arbitrary one-off styling.
- No backend/auth/tenant/money surface was found, so SaaS-grade authz/tenant findings are not applicable rather than missing.

## Weakest-link verdict

Weakest link: **content provenance/currency** (F1). The most likely real-world failure is not a TypeScript/build failure; it is a polished offline study card presenting an unsupported or stale aviation rule as confidently as a verified one.

Weakest-link score: **6/10 for current Tier 2 internal/personal use**. The code and local gates are stronger than 6, but Appendix A caps trust because the safety-adjacent domain correctness is not externally verified. For Tier 3/public/paying/external pilot, current score would be **not pilot-ready** until F1 and the remaining offline/performance enforcement gaps are closed.

## Ordered shortlist to reduce risk

1. Close F1: add/verify refs and source/access/version metadata for every module; make missing refs fail at least for Tier 3/pilot mode.
2. Close F3: add tests for progress persistence across reload and storage failure/degraded banner while content remains readable.
3. Close F2: make Lighthouse self-contained or add a CI step that starts the production server and runs the budget.

## Human judgement calls still required

- Confirm whether Tier 2 internal use remains the target, or whether this is being prepared for public/paying/external pilot use.
- Domain-expert review: whether the IFR/CASA/AIP/ERSA content model and actual facts are correct/current.
- Decide acceptable source granularity: per module, per block, or per individual quiz/card item for Tier 3.
- Decide review cadence/staleness policy for offline aviation material.
- Decide whether local progress loss is acceptable with a warning, or whether export/import/sync is required before wider pilot.

## Hard stop

No refactor was performed. Await human selection of which finding(s) to fix and in what order.
