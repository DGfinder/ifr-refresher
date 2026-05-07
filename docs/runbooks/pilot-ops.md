# Pilot Ops Runbook — IFR Refresher

## Normal operation

- App is static/offline-first.
- User progress is local browser storage only.
- No backend or operator admin tasks exist.

## Known degraded states

- Browser storage blocked/full: content still loads, progress may not save, storage banner is shown if storage calls fail.
- Offline before first load/install: app may not be cached yet.
- Stale offline content: disclaimer tells users to verify authoritative sources.

## Support checklist

1. Ask what route failed: home/study/flashcard/quiz/insights.
2. Ask whether device is offline or low-storage/private-browsing.
3. Ask browser/device and whether app was installed to home screen.
4. Check console errors if available.
5. Reproduce locally:
   ```bash
   npm run dev -- --port 3100
   npm run playwright
   ```
6. If PWA/offline issue:
   ```bash
   npm run build
   npm run start -- --port 3101
   npm run playwright:pwa
   ```

## Tier 3 promotion triggers

Promote governance and gates before:

- External pilot users.
- Public URL advertised outside the owner.
- Paid training product positioning.
- Account sync/backend storage.
- Operational/company-approved use claims.
