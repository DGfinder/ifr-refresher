# Reading layouts across the baseline

All 51 topics / 64 source fragments now have explicit presentation maps. The original three pilot maps remain; 61 additional fragment maps cover the remaining 48 topics. Baseline source data is unchanged.

Terra supplied the first-half source maps and independent corrections to the second half. Luna supplied second-half maps and the corrected landing-minima nesting. Root reviewed source pages, integrated the maps, corrected approach-type groups and the shared day/night table row, preserved radio-call line breaks, and rendered nine diagram/table regions directly from the original PDF. One comparison asset is retained even though its table now renders as HTML.

## Changes

- Complete paragraphs replace artificial PDF line wraps.
- Heading, reference, note and nested-list blocks retain source order and literal markers.
- Radio examples preserve meaningful call line breaks; briefings use headings and grouped paragraphs.
- Tables preserve every source token and their reviewed row/column relationships. Single-column requirements render as lists. Shared conditions span table columns.
- Eight diagram or complex-layout blocks retain original source imagery. Focused source regions avoid repeating unrelated neighbouring topics and full blank pages. The unchanged full PDF and page images remain available.
- Every nonblank source line must be mapped once, in order. Table reconstruction also checks token conservation. Invalid or stale range maps fall back to the original source presentation.

## Review findings resolved

Initial maps omitted graphics that were invisible to text extraction, overlapped some nested ranges, and retained PDF wrapping as individual paragraphs. The final maps were corrected rather than accepted merely because text coverage passed. Holding limitations table boundaries and the day/night shared condition were corrected against original pages. A failing test exposed acceptance of out-of-range maps after source truncation; runtime bounds checking now rejects those maps.

## Verification

- Typecheck, ESLint, 294 unit tests and production build pass (65 generated pages).
- Reading-map validator passes all 61 new fragments for order, coverage and table tokens. Tests also check all 51 topics, complete source-token preservation, essential figure assets, statutory markers and fallback behaviour.
- All nine rendered source-image regions were inspected for clipping. These were source-asset checks, not browser UX checks.
- Active browser expectations were updated for Reading view and focused diagrams, but not executed. Browser/mobile/keyboard/offline/Lighthouse checks remain unperformed under the previously recorded Sites restriction; rendered UX remains unverified.
- No dependency or aviation-rule changes. Current-publication verification remains deferred. The existing dependency audit and broad advisory findings from the earlier review are unchanged and were not rerun for this formatting pass.

Rebuild maps with `node scripts/build-reading-plans.mjs`; validate with `node scripts/check-reading-plans.mjs`. Source research artifacts are inputs, while `src/features/baseline/model/reviewedPlans.json` is the app's presentation data. Future content work must update the source deliberately and re-review its formatting map.
