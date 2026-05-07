# Definition of Done — IFR Refresher

## Change done

A change is done when:

- Scope and acceptance criteria are met.
- Executor mode is declared in the PR/handoff.
- Relevant tier checklist is completed.
- Tests/checks were run or explicitly skipped with reason.
- No known regression is hidden.
- Verification evidence is recorded.

## Feature done

A feature is done when:

- The user job is complete end-to-end.
- UI states are handled: loading, empty, error, offline/degraded where relevant.
- Local storage/offline implications are considered.
- Aviation content changes have source/review notes.
- Docs/runbooks are updated where relevant.

## Release done

A release is done when:

- `npm run quality` passes.
- `npm audit --omit=dev` is clean or waived in `docs/security/dependency-audit.md`.
- Browser/PWA smoke checks pass for critical journeys.
- Release notes/changelog are written.
- Rollback path is known.
- Production smoke is defined and run after deploy.
