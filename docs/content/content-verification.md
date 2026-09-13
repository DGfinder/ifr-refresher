# Aviation Content Verification — IFR Refresher

This project is a study refresher, not an operational source of truth. IFR/CASA/AIP/ERSA details are safety-adjacent, so content changes need explicit review evidence.

## Current status

- Baseline organisation: 51 topics now contain exact source-page text fragments, with stored character offsets. Checked that all extracted body text on pages 6–58 is accounted for without overlap; corrected alternates coverage to include its continuation on page 29. This is source-capture integrity work, not regulatory verification. No explanations, scenarios or live-app changes were added.

- Content development continued with `docs/curriculum/administrational.md`, covering the six source topics on pp.6–13. Source excerpts, tables and authored scenarios preserve the supplied edition. No current-publication comparison was performed, as requested. No live app content or routes changed; runtime checks were not rerun for Markdown-only authoring.

- Owner direction after the curriculum draft: current-publication verification is deferred while developing source-faithful content. `docs/curriculum/holding.md` now uses attributed passages from the supplied PDF, authored operational explanations and worked scenarios. Verification commentary has moved out of its teaching body; no claim of current regulatory verification is added.

- **13 September 2026 correction:** the March 2026 AIP URL cited in the earlier visual-workbook review now returns 404. The current official AIP Book listing is dated 3 September 2026, but its ENR text/figure has not been obtained and inspected in this pass. Withdraw any implication that the March link establishes current holding verification. The new text-first holding draft explicitly records this gap.

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

## Curriculum reset authoring — 13 September 2026

Authored docs/product/cheat-sheet-topic-map.md and docs/curriculum/holding.md from the supplied V7.1 PDF. Read pages 38–40 and rendered page 39 with pypdfium2 to inspect sector geometry. The holding draft retains the two source subtopics, labels authored examples and source limitations, and includes onward-clearance reasoning. Source entries and numerical limits are attributed to the supplied 2024 edition; current AIP verification and instructor review remain pending.

Terra researched holding and withdrew an initially overstated current-source claim after the owner reproduced a 404 from the March URL. Luna mapped headings/page starts and legacy duplication. The current source gateway and 3 September AIP Book listing were inspected; search-index snippets were not accepted as current text verification. Existing unsafe or oversimplified migration candidates are logged in docs/product/holding-migration-review.md. No live aviation JSON or app routes changed.

Post-draft review: Terra independently confirmed the nil-wind example geometry and requested clearer parallel-track wording and consistent track/course terminology; both corrections applied. Luna confirmed the source hierarchy and coverage. Repetition of the departure distinction was shortened; entry-specific timing qualifications were deliberately retained rather than compressed. Checks cover Markdown links, unique topic IDs, encoding and diff whitespace. Runtime/build/browser checks were not rerun because only authoring documents and project instructions changed.

Administrational editorial review: Terra checked the draft against the supplied pp.6–13. Corrected the circling scenario to refer to the most recent IPC and made IFR operation explicit in the altitude-alerting scenario. The review found no discrepancy in the date examples, recency distinction or equipment-footnote mapping. This is source-fidelity review, not a current-publication check.

## Owner correction: baseline capture precedes enrichment

Captured all 58 source pages in docs/curriculum/baseline without authored instructional additions. Compared source PDF SHA-256 with the supplied Downloads PDF and checked every saved page against a fresh extraction. Original PDF remains unchanged and preserves tables/diagrams absent from text extraction. Previous enriched chapters moved to deferred-context, not accepted as baseline content. No app changes or runtime checks in this documentation-only correction.
