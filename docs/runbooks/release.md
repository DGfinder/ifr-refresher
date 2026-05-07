# Release Runbook — IFR Refresher

## Pre-release

1. Confirm branch/diff scope:
   ```bash
   git status --short
   git diff --stat
   ```
2. Run quality gates:
   ```bash
   npm run quality
   npm audit --omit=dev
   npm run pillars:lint:advisory
   npm run frontend:lint:advisory
   ```
3. For UI/PWA changes:
   ```bash
   npm run playwright
   npm run build
   npm run start -- --port 3101
   npm run playwright:pwa
   npm run lighthouse
   ```
4. For content changes:
   ```bash
   npm run content:check
   ```
   Update `docs/content/content-verification.md` with source/review notes.
5. Update `CHANGELOG.md`.

## Deploy

- Vercel deployment should build with `npm run build`.
- Keep `next dev/build --webpack` while Serwist/Turbopack compatibility is uncertain.
- Do not deploy with a red runtime dependency audit unless documented and accepted.

## Post-deploy smoke

1. Open home, study, flashcard, quiz, insights.
2. Start one quiz and answer one question.
3. Open one study module.
4. Confirm service worker/manifest installability in browser devtools if PWA changed.
5. Confirm disclaimer/about page renders.

## Release evidence template

```text
Version/commit:
Executor:
Commands run:
Browser smoke:
PWA/offline smoke:
Content verification:
Known risks:
Rollback commit/deployment:
```
