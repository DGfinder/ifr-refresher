# IFR Companion

**Mobile PWA for instrument-rated pilots to study IFR law and theory on the go.**

Offline-first flashcard & quiz app, built for CASA IFR, IPC oral prep, and airline panel interviews. No backend — all progress lives in IndexedDB on-device.

---

## Features

- **Study mode** — browse modules by category, read content, search across all material.
- **Drill mode** — FSRS/adaptive flashcard drilling.
- **Quiz mode** — 4-choice MCQ with Classic, Timed, Learn, and Challenge sub-modes.
- **Insights** — streak tracking, weakest sections, progress over time.
- **Offline-first** — Serwist service worker pre-caches the app shell/content.
- **Installable PWA** — add to home screen on iOS/Android.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| Runtime | Static/offline-first PWA |
| Styling | Tailwind CSS v4 + IFR CSS tokens |
| Components | React 19, existing Radix/shadcn-compatible primitives |
| Spaced Repetition | `ts-fsrs` |
| Offline | Serwist |
| Storage | IndexedDB via `idb-keyval` |
| Search | Fuse.js |
| Testing | Vitest + Playwright |

No auth, no database, no server-fetched data.

---

## Project Structure

This repo follows **domain/feature first, technical category second**.

```txt
src/
├── app/                 # Next.js route files and special files only
├── app-shell/           # global chrome, nav, app-wide banners, theme constants
├── content/             # aviation JSON content, schemas, registry, content rendering
├── features/
│   ├── drill/           # drill extraction, adaptive/FSRS hooks, drill tests
│   ├── flashcards/      # flashcard session screens/components
│   ├── home/            # home/landing dashboard at /
│   ├── programs/        # study/drill program definitions and active program context
│   ├── progress/        # progress, streaks, insights
│   ├── quiz/            # quiz generation, session lifecycle, scoring, history
│   └── study/           # browsing/searching/reading modules
├── platform/
│   ├── pwa/             # Serwist service worker source
│   └── storage/         # IndexedDB storage wrapper
└── shared/              # generic UI/hooks/lib only; no domain imports
```

Architecture contracts live in:

- `docs/architecture/overview.md`
- `docs/architecture/project-structure.md`
- `docs/architecture/module-boundaries.md`
- `docs/architecture/storage-contract.md`

Do not add broad drawers like `src/components`, `src/hooks`, `src/utils`, `src/types`, or `src/lib` back to the repo.

---

## Data Format

All study content lives in `src/content/data/*.json`. Each file is a **Section** shaped by `src/content/model/section.ts` and aggregated by `src/content/registry/sections.ts`.

Content edits are safety-adjacent. For any aviation rule/number/reference change:

1. Record source material and source/access date.
2. Run `npm run content:check`.
3. Run relevant tests/browser smoke.
4. Update `docs/content/content-verification.md` if review/source status changes.

---

## Development

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run content:check
npm run test
npm run build
```

Full local quality bundle:

```bash
npm run quality
npm run playwright
npm run playwright:pwa
npm audit --omit=dev
```

---

## Testing

- Unit/model tests live beside owning domains, e.g. `src/features/quiz/model/__tests__`.
- Content/drill extraction tests live beside the owning domain, e.g. `src/features/drill/model/__tests__`.
- Browser/PWA tests live in `tests/e2e` and `tests/pwa.playwright.config.ts`.

---

## PWA / Offline

Serwist is configured in `next.config.ts` and uses `src/platform/pwa/sw.ts` as the service-worker source. The manifest remains in `src/app/manifest.ts` because it is a Next.js App Router special file.

Do not change PWA/offline files without a production build and offline smoke.

---

## Deployment

Deployed on Vercel. CI runs typecheck, lint, tests, content check, build, Playwright smoke, PWA smoke, advisory Pillars lint, advisory frontend lint, and runtime dependency audit.

GitHub repo: [github.com/DGfinder/ifr-refresher](https://github.com/DGfinder/ifr-refresher)
