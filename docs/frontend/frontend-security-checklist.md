# Frontend Security Checklist — IFR Refresher

Project: IFR Refresher / IFR Quick Study
Tier: T2 now; T3 before public/paying pilot

## Tenant/data isolation
- [x] No tenant model or backend data.
- [x] Progress is local-only in browser storage.
- [ ] If sync/account features are added later, cache keys must be user-scoped and server authz must enforce access.

## Sensitive data handling
- [x] No production/customer data in visual tests.
- [x] No secrets required for normal operation.
- [ ] Screenshots for PRs should avoid personal progress/history if real user data is present.

## Auth and permissions UX
- [x] No auth surface currently.
- [ ] If account sync is added, distinguish unauthenticated/expired/offline/sync-failed states.

## Dangerous/safety actions
- [x] No server-side destructive actions.
- [ ] Local progress reset/export/import should require confirmation if added.
- [ ] Aviation content changes require source/review evidence because the content is safety-adjacent.
