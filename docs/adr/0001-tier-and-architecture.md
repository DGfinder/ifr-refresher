# ADR 0001 — Tier and Architecture

Date: 2026-05-07

## Status

Accepted

## Context

IFR Refresher is a Next.js App Router PWA with static aviation study content and local-only progress storage. It currently has no backend, authentication, server database, tenancy, or payment flow.

## Decision

Operate at Pillars Tier 2 for internal/personal pilot-prep use. Promote toward Tier 3 before public, paying, external pilot, company-approved, or backend/account-sync use.

Use a static/offline-first PWA architecture:

- Next.js 16 App Router
- React 19
- Serwist service worker
- IndexedDB/local browser storage
- No server state authority

## Consequences

- Remediation focuses on frontend quality, PWA/offline verification, dependency security, governance, release/rollback, and aviation content verification.
- SaaS controls like tenant isolation, server authz, payment compliance, database migrations, and backend observability are out of scope until the architecture changes.
- Content verification remains important because IFR content is safety-adjacent even without backend data risk.
