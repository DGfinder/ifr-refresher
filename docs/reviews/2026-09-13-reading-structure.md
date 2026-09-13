# Reading structure pilot

Owner authorised Terra and Luna to implement the proposed three-topic pilot. Terra reviewed original page images 6, 18 and 42 and supplied exact paragraph, table and nested-list mappings. Luna reviewed reading typography and recommended a narrower measure, semantic blocks, quieter references and retained source access. Root implemented and reviewed the shared renderer.

## Scope

- Part 61 Definitions: explicit nested statutory lists, including the original `(ca)` marker and wrapped continuation.
- Setting QNH Before IAF: source paragraph boundaries, three-item list and two source notes.
- Transponder codes: the three original rows with operation and code column headers.

The baseline data is unchanged. Presentation maps refer to source line ranges; only whitespace is normalised. A complete word-sequence comparison makes the renderer fall back if a map would omit or duplicate text. The existing article heading renders the source title once. Unreviewed topics retain their current source view. Original PDF/page images remain available; the reviewed table now defaults to reading view.

Used the existing typography plugin with scoped light/dark tokens, 18px body text, 1.65 line height, 68ch maximum measure, hanging list markers, restrained note rules and row/column table headers. No dependencies, operational explanations or source rules were added.

## Checks

Typecheck, lint, all 292 unit tests and production build pass. Four new tests cover nested markers, prose qualifications, table associations and fallback for unmapped content. Source images were inspected, but browser/keyboard/mobile UX checks remain unperformed under the previously documented Sites browser-testing restriction. This is a three-topic implementation for review, not a completed formatting migration of all 51 topics. Dependency audit and broad advisory findings are unchanged from the prior review; they were not rerun for this presentation-only pilot.
