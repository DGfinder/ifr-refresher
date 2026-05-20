# Aviation Content Verification — IFR Refresher

This project is a study refresher, not an operational source of truth. IFR/CASA/AIP/ERSA details are safety-adjacent, so content changes need explicit review evidence.

## Current status

- Content lives in `src/content/data/*.json`.
- Runtime type shape is defined in `src/content/model/section.ts`.
- Automated structural check: `npm run content:check`.
- Human source verification is required for rule/number/reference changes.

## Content change checklist

For any content edit:

1. Identify changed modules and exact rules/numbers/references.
2. Record source material used: CASA, Part 61 MOS, AIP, ERSA, company SOP/training material, or other.
3. Record source date/access date.
4. Run `npm run content:check`.
5. Run `npm run test`.
6. Browser-smoke changed study module and related quiz/flashcard generation.
7. Update this log if the source/version changed.

## Review log

| Date | Scope | Source | Reviewer | Notes |
|---|---|---|---|---|
| 2026-05-07 | Existing data shape/governance only | Existing local content; no rule text changed | Hermes | Added structural checker and disclaimer. Human aviation source verification still required before external/public pilot use. |

## Promotion to Tier 3/public pilot

Before public/paying/external pilot use:

- Complete human content review of every module.
- Add source URLs/parts/chapters where missing.
- Add date/version metadata for each section or module.
- Decide review cadence and stale-content warning threshold.
