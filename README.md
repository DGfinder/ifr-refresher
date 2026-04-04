# IFR Companion

**Mobile PWA for instrument-rated pilots to study IFR law and theory on the go.**

Offline-first flashcard & quiz app, built for CASA IFR, IPC oral prep, and airline panel interviews. No backend — all progress lives in IndexedDB on-device.

---

## Features

- **Study mode** — browse modules by category, read content, search across all material
- **Drill mode** — FSRS spaced-repetition flashcards with Again / Hard / Good / Easy ratings
- **Quiz mode** — 4-choice MCQ with Classic, Timed, Learn, and Challenge sub-modes
- **Insights** — streak tracking, weakest sections, progress over time
- **Offline-first** — Serwist service worker pre-caches all content; works without network
- **Installable PWA** — add to home screen on iOS/Android

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Components | Radix UI primitives |
| Spaced Repetition | [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) |
| Offline | [Serwist](https://serwist.pages.dev) (Workbox wrapper for Next.js) |
| Storage | IndexedDB via `idb-keyval` |
| Search | Fuse.js fuzzy search |
| Testing | Vitest |

No auth, no database, no server components that fetch data — everything is static.

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout (fonts, nav, error boundary)
│   ├── page.tsx          # Home / study browse
│   ├── drill/            # Flashcard drill (FSRS)
│   ├── quiz/             # Quiz mode
│   ├── study/            # Module reader
│   ├── insights/         # Progress & analytics
│   ├── manifest.ts       # PWA manifest
│   ├── error.tsx         # Global error boundary (Next.js)
│   └── not-found.tsx     # 404 page
│
├── components/
│   ├── quiz/             # Quiz UI components
│   ├── flashcard/        # Flashcard UI components
│   ├── ErrorBoundary.tsx # React class error boundary
│   └── ...               # Shared UI (AppHeader, MainNav, etc.)
│
├── contexts/
│   └── ProgramContext.tsx # Active study program (persisted to IDB)
│
├── data/
│   ├── sections.ts       # Aggregates all JSON section files
│   ├── programs.ts       # Study program definitions
│   ├── drillPrograms.ts  # Drill-specific program configs
│   └── *.json            # Section content (see Data Format below)
│
├── hooks/                # React hooks for quiz, drill, FSRS, progress
├── lib/
│   └── storage.ts        # idb-keyval wrapper (get/set/del)
├── types/                # TypeScript types (Section, DrillQuestion, etc.)
└── utils/
    ├── quiz.ts           # buildQuizQuestions() — MCQ generation
    ├── drill.ts          # buildDrillQuestions() — extract from sections
    ├── quizScoring.ts    # Points, streaks, time bonuses
    ├── quizStorage.ts    # Quiz history persistence
    └── __tests__/        # Vitest unit tests
```

---

## Data Format

All study content lives in `src/data/*.json`. Each file is a **Section**:

```json
{
  "version": "1.0",
  "sectionId": "fuel-alternates",
  "sectionTitle": "Fuel & Alternates",
  "sectionDescription": "...",
  "categories": [
    {
      "id": "cat-fuel",
      "title": "Fuel Requirements",
      "description": "...",
      "moduleIds": ["mod-fuel-basic", "mod-fuel-alternates"]
    }
  ],
  "modules": [
    {
      "id": "mod-fuel-basic",
      "title": "IFR Fuel Requirements",
      "categoryId": "cat-fuel",
      "level": "core",
      "estReadingMinutes": 5,
      "tags": ["fuel", "legal"],
      "summary": "...",
      "content": [
        { "type": "text", "text": "Intro paragraph..." },
        { "type": "heading", "level": 2, "text": "Final Reserve" },
        {
          "type": "qa",
          "question": "What is the final reserve fuel for IFR ≤5700kg?",
          "answer": "45 minutes.",
          "distractors": ["30 minutes.", "60 minutes.", "As per POH."]
        },
        {
          "type": "numbers",
          "content": ["45MIN — IFR final reserve for aircraft ≤5700kg"]
        },
        {
          "type": "traps",
          "content": ["Using METAR QNH as 'actual' — METAR is observation, not an approved source."]
        }
      ],
      "refs": [{ "label": "CAO 20.18 §5.3", "url": "..." }]
    }
  ]
}
```

### Content Block Types

| type | Description |
|---|---|
| `text` | Prose paragraph |
| `heading` | Section heading with `level` (1–3) |
| `list` | `bullet` or `numbered` list |
| `qa` | Q&A flashcard — extracted by `buildDrillQuestions` |
| `numbers` | `FRONT — back` pairs for numeric memory drills |
| `traps` | `front — explanation` pairs for common gotcha questions |
| `ipc_questions` | `Q: ... A: ...` strings for IPC oral prep |
| `airline_questions` | `Q: ... A: ...` strings for airline panel prep |

`distractors` on `qa` blocks is optional. If provided, it must be an array of exactly 3 wrong answers used in quiz MCQ generation.

---

## Study Programs

| ID | Name | Question Kinds |
|---|---|---|
| `cheat_sheet` | Quick Study | `legacy_qa` |
| `ipc_oral` | IPC Oral | `ipc`, `legacy_qa`, `trap`, `numeric` |
| `airline_panel` | Airline Panel | `airline` |
| `quick_fire_numbers` | Quick Fire Numbers | `ipc`, `legacy_qa` |
| `god_mode` | God Mode | All kinds, all levels |
| `traps_only` | Trap Spotter | `trap` |
| `smart_review` | Smart Review | FSRS due cards |

---

## Development

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # Production build + type check
npm run test      # Vitest unit tests (84 tests)
npm run lint      # ESLint
```

### Running tests

```bash
npm run test          # Run once
npm run test:watch    # Watch mode
```

Tests cover: quiz MCQ generation, drill question extraction, scoring logic, streak multipliers, and data integrity checks on all JSON section files.

---

## PWA / Offline

Serwist (configured in `src/sw.ts`) pre-caches all static assets and JSON data at install time. The app works fully offline after first load.

**Service worker lifecycle:**
- `skipWaiting: true` — new SW activates immediately
- `clientsClaim: true` — new SW controls all open tabs
- `navigationPreload: true` — speeds up navigation on supported browsers
- `defaultCache` — Serwist's default runtime caching for assets, fonts, and images

The manifest (`src/app/manifest.ts`) declares `display: standalone` for full PWA install support on iOS and Android.

---

## Deployment

Deployed on Vercel. CI runs on every push to `main`:
- TypeScript type check
- Vitest tests
- ESLint
- Next.js build

GitHub repo: [github.com/DGfinder/ifr-refresher](https://github.com/DGfinder/ifr-refresher)
