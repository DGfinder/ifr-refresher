# Pillars Audit Remediation Closeout

Source audit: `AUDIT_FINDINGS.md`
Executor: Hermes Agent
Date: 2026-05-29

## Fixed

1. **Content provenance coverage**
   - Added an explicit provenance note to every module that previously had empty `refs`.
   - Tightened `scripts/check-content.mjs` so empty refs now fail, rather than warn.
   - Added `src/content/model/__tests__/contentProvenance.test.ts` to prevent regression.
   - Important: this does **not** certify aviation correctness. It makes unverified legacy content explicit and blocks future silent no-reference modules.

2. **Offline/storage degradation evidence**
   - Added Playwright coverage for completed study progress persisting after reload.
   - Added Playwright coverage for blocked IndexedDB: study content remains readable and the degraded-storage banner appears.
   - Updated `docs/frontend/offline-sync-contract.md` checkboxes.

3. **Lighthouse/performance budget enforcement**
   - Made `scripts/run-lighthouse.mjs` self-contained: it starts `npm run start -- --port 3101` when `LIGHTHOUSE_BASE_URL` is not already reachable.
   - Added the Lighthouse budget step to GitHub Actions CI.
   - Added `src/platform/pwa/__tests__/lighthouseGate.test.ts` as a guardrail.
   - Updated `docs/performance/performance-budget.md`.

## Verification

```text
npm run typecheck                         PASS
npm run lint                              PASS
npm run content:check                     PASS — 14 files, 105 modules
npm run test                              PASS — 7 files, 94 tests
npm run build                             PASS — Next/Serwist production build
npm audit --omit=dev                      PASS — 0 vulnerabilities
npm run pillars:lint:advisory             PASS
npm run frontend:lint:advisory            PASS
npm run playwright                        PASS — 20 tests
npm run playwright:pwa                    PASS — 1 test
npm run lighthouse                        PASS — / .94/.96/1/1, /study .91/.96/1/1, /quiz .88/.94/1/1
```

## Still human-owned

- Full CASA/AIP/ERSA fact verification and review cadence before Tier 3/public/paying/external pilot use.
- Whether broad `Unverified local study notes` provenance is acceptable for internal Tier 2, or whether every module/item needs precise section-level citations before broader use.
- Product decision on whether local-only progress is enough, or whether export/import/cloud sync is required.

## New weakest link

Human/domain verification of aviation facts remains the weakest link. The codebase now prevents silent missing provenance and has stronger automated offline/performance gates, but it still cannot self-certify IFR content correctness.
