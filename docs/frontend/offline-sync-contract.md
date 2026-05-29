# Offline & Sync Contract — IFR Refresher

Feature: Whole-app PWA offline study
Tier: T2 now; T3 before public/paying pilot
Surface: web PWA

## Offline requirement
- Critical offline data: app shell, study content, flashcards, quiz UI, icons, CSS/JS, saved progress, quiz history.
- Nice-to-have offline data: analytics/diagnostics if added later.
- Online-only data: none after first successful load.

## Local storage
- Backend: IndexedDB via `idb-keyval`.
- Quota strategy: small JSON progress/history only; no media uploads.
- iOS storage eviction handling: app remains readable; progress may be missing and should show degraded state once implemented.

## Sync queue
- Mutation types queued: none server-side. Local progress writes only.
- Queue state: N/A until account/cloud sync exists.
- Idempotency key strategy: N/A until sync exists.
- User-visible status surface: should show storage degraded/offline state for T3/public pilot.

## Conflict policy
- LWW data: local progress if export/import is added.
- Conflict-review-required data: none currently.

## Network behaviour
- Offline start after install: app shell and content should render.
- Mid-task disconnect: study/quiz/flashcards should continue.
- Reconnect/replay trigger: N/A until sync exists.

## Required tests
- [x] First load online -> reload offline -> `/study` renders.
- [x] Complete local progress -> reload -> progress persists.
- [x] Storage failure -> readable content with progress warning.
