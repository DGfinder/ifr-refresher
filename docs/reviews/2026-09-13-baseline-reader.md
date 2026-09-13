# Baseline reader and brand mockups

Implemented 51 canonical source topics with searchable contents, exact captured text, original page images, unchanged PDF and previous/next navigation. Legacy practice routes redirect to contents; underlying code remains recoverable. No operational enrichment was added. Luna advised on brand directions; Terra reviewed source mapping. Terra's table-page finding was fixed by making pages 25, 51 and 52 open in original-page view.

The owner expressly requested brand mockups after baseline capture. Three scoped styles compare the same reader at wide/narrow widths.

## Checks

- Typecheck, ESLint, legacy content structural check and production build pass. Build generated 65 static pages, including 51 topic routes.
- All 288 unit tests pass across 23 files. Four new tests cover exact source fragments, page-29 alternates continuation, PDF checksum/page assets and unknown-topic handling.
- Historical browser contracts are preserved under tests/retired-ui with .archived suffixes. This prevents Vitest collecting Playwright code, which caused the initial test run to fail. Assertions and runner configurations remain unchanged. Replacement baseline browser tests are authored but unrun.
- Rendered desktop/mobile, keyboard, offline and Lighthouse checks remain unperformed. The Sites skill states: “Perform no screenshots, DOM inspection, clicking, resizing, or visual QA unless the user explicitly requests browser testing.” Source: C:/Users/Hayden/.codex/plugins/cache/openai-bundled/sites/0.1.70/skills/sites-building/SKILL.md, line 230. No explicit browser-testing request was received; the rendered flow is unverified.
- Production audit reports 8 existing dependency findings: 1 critical, 6 high, 1 moderate. Dependencies were not changed. This is not release clearance.
- Pillars advisory flags the accumulated branch diff above default 8-file/400-line limits. Frontend advisory remains incomplete: inline-style matches, an existing skip-link false positive, then missing python3. Initial non-login Git Bash attempts lacked Unix utilities and are not valid passes.

The supplied 2024 source has not been verified against current aviation publications; that work remains deferred at the owner's direction. Code checks do not establish instructional usefulness or aviation correctness.