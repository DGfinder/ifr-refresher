# Brand Kit Decision Log — IFR Refresher

Project: IFR Refresher / IFR Quick Study
Tier: T2 now; T3 before public/paying pilot
Date: 2026-05-07

## Density default
Choice: medium-dense.
Benchmark: quiz card and study module list.
Rationale: pilots use this as a fast refresher, so the UI should be compact enough for preflight/crew-room use without feeling like a dense ops table.

## Border radius
Choice: 12px–24px cards, rounded controls.
Rationale: approachable study app, not an aircraft system UI; maintain enough softness for mobile.

## Body font
Font: Plus Jakarta Sans.
Rationale: readable on mobile and less generic than default Inter/Geist.

## Display font
Font: Barlow Condensed.
Rationale: aviation/instrument-panel character for headings.

## Mono font
Font: JetBrains Mono.
Where used: numeric values, quiz/card counters, technical values where needed.

## Primary container treatment
Choice: outlined cards with restrained shadows.
Where used: quiz cards, study modules, dashboard stats.
Where forbidden: dense lists that need scan speed should stay flatter.

## Status colour semantics
- Success: `--ifr-success`
- Warning/review/weak: `--ifr-warning`
- Danger/incorrect: `--ifr-danger`
- Neutral pending: `--ifr-text-muted`
- Stale/degraded/offline: warning + explicit text
- Disabled: muted border/text plus explanation where relevant
- Unknown: muted/neutral, not red

## Hero/data/empty-state treatment
Choice: typography-first with small aviation emoji/icon accents.
Rationale: keep the app fast and study-focused; avoid decorative SaaS slop.

## Anti-slop exceptions
- Dark cockpit/night theme is deliberate for aviation context.
- Emoji icons are allowed in first-run/empty states but should not replace accessible labels.
