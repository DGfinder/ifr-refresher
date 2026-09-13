# Aviation Content Verification â€” IFR Refresher

This project is a study refresher, not an operational source of truth. IFR/CASA/AIP/ERSA details are safety-adjacent, so content changes need explicit review evidence.

## Current status

- Content lives in `src/content/data/*.json`.
- Runtime type shape is defined in `src/content/model/section.ts`.
- Automated structural check: `npm run content:check`.
- The structural checker now fails any module without at least one source/reference or explicit provenance note.
- Human source verification is required for rule/number/reference changes.
- Lesson pages expose "Source verification pending" until a completed aviation review is recorded. The sources tab opens references and existing edition/access notes without treating those notes as review sign-off. Marking a lesson read records reading only.

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
| 2026-05-29 | Provenance coverage hardening | Existing local content; no rule text changed | Hermes | Added explicit unverified-local-study-notes provenance to the 57 modules that previously had empty refs and made empty refs a failing content check. This improves honesty/traceability but does not complete human aviation source verification. |
| 2026-06-14 | Cheat-sheet briefing-flow modules CS-019/CS-020 | IFR Cheat Sheet (Ben Montgomery-Schinkel), V7.1 March 2024; extracted from `docs/content/IFR-Cheat-Sheet (1).pdf` using `@opendataloader/pdf` and manually checked against extracted Markdown pages/sections for Sample Departure Briefing, Sample Take-off Safety Briefing, and Sample Approach Briefing | Hermes | Added quick-study briefing prompts and Q&A only; no new regulatory minima/rules introduced. Study-aid content remains subject to human aviation review before public/paying pilot use. |

## Promotion to Tier 3/public pilot

Before public/paying/external pilot use:

- Complete human content review of every module.
- Add source URLs/parts/chapters where missing.
- Add date/version metadata for each section or module.
- Decide review cadence and stale-content warning threshold.

## Visual workbook — 13 September 2026

Scope: new `/principles` holding geometry, 2D/3D approach guidance and gradient/groundspeed relationships. Original explanations and schematic SVGs; no copied cheat-sheet artwork or new regulatory minima.

Teaching reference: Ben Montgomery-Schinkel, IFR Cheat Sheet V7.1, 30 March 2024, pages 38–40, 41/44 and 57 respectively. Supplied Downloads PDF matches the repository PDF by SHA-256.

Primary comparisons accessed 13 September 2026:
- Airservices AIP ENR 1.5 holding procedures, complete edition 19 March 2026: https://www.airservicesaustralia.com/aip/current/aip/complete_19MAR2026.pdf
- CASA instrument approach operations (page last updated 5 December 2021): https://www.casa.gov.au/licences-and-certificates/pilots/ratings-reviews-and-endorsements/instrument-ratings/instrument-approach-operations
- Airservices Aeronautical Chart User Guide v5 effective 7 August 2026, conversion tables: https://www.airservicesaustralia.com/aip/current/iaipchart/Aeronauticalchartuserguide.pdf

Review corrections: the approach schematic places the illustrative path above constraint marks. Advisory VNAV does not guarantee obstacle protection; CASA classifies using it to manage descent as a 3D operation for recent-experience purposes, even on a lateral-only procedure. The explanation preserves that distinction.

Gradient output uses 1852 m/NM and 0.3048 m/ft; 5% at 120 kt gives approximately 608 ft/min. Automated tests check conversions, speed proportionality, invalid inputs and URL fallback. Holding is nominal geometry only, without entry selection, wind correction or protected-airspace calculations. Human instructor source sign-off remains pending; editorial comparison is not operational approval.
