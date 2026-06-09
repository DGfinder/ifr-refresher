# Project Structure Contract — IFR Refresher

Status: Accepted
Last updated: 2026-05-20

## Principle

This repo is **domain/feature first, technical category second**. New code should live with the product capability it changes before falling back to `shared` or `platform`.

Do not recreate broad technical drawers such as `src/components`, `src/hooks`, `src/utils`, `src/types`, or `src/lib`.

## Current source map

```txt
src/
├── app/                 # Next.js route files only; keep pages thin
├── app-shell/           # global chrome, nav, shell state, app error boundary, theme constants
├── content/             # aviation study content, section schema, registry, content rendering
├── features/            # domain features: home, study, programs, drill, flashcards, quiz, progress
├── platform/            # browser/PWA infrastructure: storage and service worker
└── shared/              # generic UI/hooks/lib with no domain knowledge
```

## Ownership

| Area | Owns | Must not own |
|---|---|---|
| `app/` | Next route entry points and Next special files | domain logic, storage writes, complex UI orchestration |
| `app-shell/` | layout chrome, nav, app-wide banners, app theme metadata | quiz/drill/study business rules, home dashboard logic |
| `content/` | JSON study content, section schema, content rendering, content registry | progress persistence or quiz session state |
| `features/home/` | home/landing dashboard aggregating cheat-sheet progress + weak-question CTA | content authoring or quiz/drill internals |
| `features/study/` | module browsing, search, section/category/module selection | quiz/drill scoring or persistence |
| `features/programs/` | study program definitions and active program context | question generation internals |
| `features/drill/` | drill question extraction, drill progress, FSRS/adaptive selection | flashcard presentation-specific UI |
| `features/flashcards/` | flashcard session screens/components over drill questions | raw content registry ownership |
| `features/quiz/` | quiz generation, session lifecycle, scoring, quiz history | global app navigation or content source truth |
| `features/radio-calls/` | scenario-based radio phraseology practice (MCQ over a scripted ATC↔pilot exchange) | content authoring or drill/FSRS internals |
| `features/progress/` | progress/streak/insights domain | quiz session UI |
| `platform/storage/` | IndexedDB wrapper and storage platform policy | feature-specific domain decisions |
| `platform/pwa/` | service worker/PWA support | ordinary UI or content data |
| `shared/` | reusable UI primitives, generic hooks, generic helpers | IFR-specific business logic |

## Import direction rules

Allowed high-level direction:

```txt
app -> app-shell/features/content/shared/platform
features -> content/shared/platform
content -> shared
app-shell -> shared/platform
shared -> no features/content/app-shell/platform domain imports
platform -> no feature/UI imports
```

Rules:

1. `shared/**` must not import from `features/**`, `content/**`, or `app-shell/**`.
2. `platform/**` must not import React UI or feature modules.
3. Feature components should prefer feature hooks/screens/public APIs over reaching into global registries directly.
4. Stable persisted IDs live in content/program/drill/quiz models and must not be changed without migration notes.
5. Next special files stay under `src/app/**` even if their implementation delegates elsewhere.

## Public module surfaces

Each major module has an `index.ts` public surface. **Crossing a feature boundary must go through that barrel** — `eslint.config.mjs` enforces this via `no-restricted-imports` (see `docs/architecture/module-boundaries.md` for the enforcement contract). Same-feature internals may still be imported via their deep path.

Examples:

```ts
import { sections } from "@/content";
import { useQuizSession } from "@/features/quiz";
import { ProgressBar } from "@/shared/ui";
```

## Where new code belongs

- New quiz mode: `src/features/quiz/model`, `src/features/quiz/hooks`, `src/features/quiz/components`.
- New flashcard UI: `src/features/flashcards/components`.
- New content block type: `src/content/model`, `src/content/components`, `scripts/check-content.mjs`, and content docs.
- New storage key: feature-specific storage module first, then `platform/storage` only for generic helpers.
- New generic visual primitive: `src/shared/ui` only if it has no IFR-specific meaning.
- New PWA/offline behavior: `src/platform/pwa` plus PWA smoke verification.

## Forbidden regressions

Do not add these folders back:

```txt
src/components/
src/hooks/
src/utils/
src/types/
src/lib/
components/
```

If a future tool such as shadcn needs a generation target, configure it to `src/shared/ui` or move generated files immediately into the owning feature/shared module.
