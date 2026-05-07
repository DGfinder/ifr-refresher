# Performance Budget — IFR Refresher

Tier: T2 now; T3 before public/paying pilot

## Lighthouse budgets

Measured on production build via `npm run lighthouse` against:

- `/`
- `/study`
- `/quiz`

Minimum category scores:

| Category | Minimum |
|---|---:|
| Performance | 0.85 |
| Accessibility | 0.90 |
| Best practices | 0.90 |
| SEO | 0.85 |

## Bundle/content considerations

- App is data-heavy because study content is bundled JSON.
- Prefer route-level/code-level lazy boundaries before adding more large assets.
- Avoid decorative media unless it improves study outcomes.
- Service worker cache strategy must not cache broken shells indefinitely.

## Running locally

```bash
npm run build
npm run start -- --port 3101
LIGHTHOUSE_BASE_URL=http://127.0.0.1:3101 npm run lighthouse
```
