# Module Boundary Contract — IFR Refresher

Status: Accepted
Last updated: 2026-05-20

## Boundary rules

### `app/`

- Route files are shells.
- They may import feature screens/components and app-shell providers.
- They must not contain reusable domain logic.
- Next special files stay here: `layout.tsx`, `manifest.ts`, `error.tsx`, `not-found.tsx`, route `page.tsx` files.

### `content/`

- Owns section schema and bundled aviation JSON.
- IDs are stable contracts.
- Content renderer components belong here if they understand content block types.
- Content must not import quiz/drill/progress feature logic.

### `features/*/model`

- Pure or mostly pure domain logic.
- Prefer no React imports.
- Tests live beside model code in `__tests__`.

### `features/*/hooks`

- React state/effects for one feature.
- Hooks may call feature model/storage and platform storage.
- Hooks should not import unrelated feature internals.

### `features/*/components`

- Feature-specific UI.
- Components may consume their feature hooks/model types.
- Cross-feature imports should go through public `index.ts` where practical.

### `features/*/storage`

- Feature-specific persistence adapters.
- This layer may call `platform/storage`.
- It owns storage key semantics for that feature.

### `platform/`

- Browser/PWA infrastructure only.
- No feature imports.
- No UI imports.

### `shared/`

- Generic UI, hooks, and library helpers only.
- No domain vocabulary, aviation rules, quiz/drill/progress semantics, or content schema knowledge.

## Known improvement target

The source tree now has enforceable homes and thin route shells. The remaining architectural debt is inside a few large feature hooks/controllers, especially `features/quiz/hooks/useQuizSession.ts`. Future changes should split these into pure model functions plus thin React wrappers without changing storage IDs or aviation content IDs.

## Review checklist

Before merging structural changes, verify:

```bash
npm run typecheck
npm run lint
npm run content:check
npm run test
npm run build
```

For UI/PWA changes also run:

```bash
npm run playwright
npm run playwright:pwa
```
