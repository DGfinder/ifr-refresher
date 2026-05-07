# Rollback Runbook — IFR Refresher

## When to rollback

Rollback if any of these occur after release:

- App shell does not load.
- Study/quiz/flashcard critical journey is broken.
- Service worker caches a broken release.
- Content error is discovered in safety-adjacent aviation material.
- Dependency/security hotfix causes user-visible regression.

## Vercel rollback

1. Identify last known good deployment in Vercel.
2. Promote/restore the previous deployment.
3. Hard-refresh test browsers and verify service worker update behaviour.
4. Smoke:
   - `/`
   - `/study`
   - `/quiz`
   - `/flashcard`
   - `/insights`
5. If service worker is stuck, increment/alter SW build output by redeploying last known good commit.

## Git rollback

```bash
git log --oneline --decorate -n 20
git revert <bad-commit>
npm run quality
npm audit --omit=dev
```

Deploy the revert commit and complete post-deploy smoke.

## Content rollback

For a bad aviation content change:

1. Revert the content file(s).
2. Run `npm run content:check && npm run test`.
3. Update `docs/content/content-verification.md` with correction notes.
4. Deploy and smoke changed modules.
