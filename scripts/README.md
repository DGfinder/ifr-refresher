# Scripts

Repository utility scripts. Scripts are part of the quality contract; do not weaken them to make a refactor pass.

| Script | Purpose | Blocking? |
|---|---|---|
| `check-content.mjs` | Validates bundled aviation JSON shape, IDs, category/module links, and basic content block contracts. Warns when modules lack refs. | Yes for shape/errors; refs are currently warnings. |
| `pillars-lint.sh` | Pillars governance/adoption lint. | Advisory in CI during Tier 2 adoption. |
| `pillars-frontend-lint.sh` | Frontend Pillars lint/adoption checks. | Advisory in CI during Tier 2 adoption. |
| `run-lighthouse.mjs` | Runs local Lighthouse budget checks using Playwright Chromium when needed. | Manual/local quality gate. |

## Content script scope

`check-content.mjs` reads `src/content/data/*.json`. If content moves again, update this script and the architecture docs in the same change.

## Expected verification bundle

```bash
npm run typecheck
npm run lint
npm run content:check
npm run test
npm run build
```
