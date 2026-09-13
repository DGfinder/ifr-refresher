# IFR learning improvements — assessment

Base: origin/main at 3ba2d4d. Work branch: codex/ifr-learning-improvements.
Execution: Luna handled preparation pathways; Terra handled quiz quality; the coordinating agent reviewed their changes, fixed integration issues, added source visibility, and verified the result.

## Delivered

- Scored MCQs require a nonblank prompt and answer plus three distinct authored distractors. Answers from unrelated questions and generic option placeholders are no longer used.
- The assessment bank currently contains 120 eligible MCQs. All 1,148 study cards remain available as flashcards. Authored options do not imply aviation verification.
- Empty assessment programs explain the gap and retain the selected program when opening flashcards. Answered questions link to their source lesson in a separate tab. Quiz scores no longer claim IFR readiness.
- Home entry points now include Instrument Rating, IPC Prep, Airline Transition and Comprehensive Review. New pathways filter existing material; these are not complete syllabus mappings or personalised study plans. Existing program identifiers remain compatible.
- Home topic cards select their category. Completion explicitly covers the cheat sheet; the review count explicitly covers the whole library. URL changes reset flashcard sessions so another program cannot inherit a previous queue.
- Lesson pages display pending source verification and expose existing references and edition notes. A listed reference or access date does not establish a completed aviation review. Reading completion is labelled Read.
- Corrected an existing unstable FSRS object dependency in useDrill that could repeatedly reload progress. The hook now depends on stable callbacks.
- Review and browser testing caught and fixed narrow-screen quiz overflow and ambiguous screen-reader status matching. Program selectors expose their selected state.

No aviation rule, numerical limit, source quotation, or dependency version was changed. No deployment was performed.

## Verification

- TypeScript, ESLint and content validation passed.
- Unit/model suite: 280 tests passed in 21 files.
- Full Chrome browser suite: 32 passed; the subsequently expanded pathway suite passed 5/5, including client-side program changes. These cover 33 distinct browser checks in total.
- Production offline reload test passed. The Windows server cleanup remained running after the passing test and was interrupted.
- Production build passed. Next.js reports a workspace-root warning because this isolated worktree is nested inside the original checkout.
- Lighthouse desktop scores, using the local production build:

| Route | Performance | Accessibility | Best practices | SEO |
|---|---:|---:|---:|---:|
| / | 100 | 96 | 100 | 100 |
| /study | 96 | 95 | 100 | 100 |
| /quiz | 100 | 94 | 100 | 100 |

The repository Lighthouse launcher fails on Windows with `spawn npm ENOENT`. The installed Lighthouse CLI was run directly with Chrome for the same routes and categories instead. The Node runtime is 22.18.0, below Lighthouse's declared 22.19 minimum; treat scores as local observations and repeat the standard CI gate on its supported runtime.

The frontend advisory shell script could not complete because Python 3 is unavailable in the Git Bash environment. Its partial output also flags existing inline styles. No lint, tests or gate thresholds were weakened.

The Pillars advisory check was run against the committed diff. It flags the scope limits: 29 changed files exceed the default limit of 8, and approximately 762 changed lines exceed 400. The multi-feature work is saved for review, not represented as merge-gate clean. Split delivery into smaller review units before applying the repository's standard merge gate; do not raise thresholds merely to pass it.

The production dependency audit reports 8 existing findings: 1 critical, 6 high and 1 moderate, including Next.js. This change leaves package.json and the lockfile unchanged. Resolve and re-audit these before a public release; successful browser tests do not clear dependency findings.

## Instructional and product assessment

The site is a stronger personal refresher: clearer entry points, less misleading assessment feedback, and a direct route from an answer to its lesson and references. Its code already has useful feature boundaries, storage support, and automated coverage. A rewrite is unnecessary.

It is not yet a defensible IPC-readiness or instrument-rating-readiness assessment. The scored bank is concentrated in Quick Study; lesson provenance is not the same as a completed current-source review; the new pathways organise existing material rather than establishing competency coverage.

Recommended next increments, in order:

1. Complete and record qualified aviation review against current primary sources, with applicability, edition, review date, reviewer and review cadence. Replace the pending status only with recorded evidence.
2. Expand authored MCQs across IPC and airline topics, adding rationales for correct and incorrect answers and a stable learning-objective mapping.
3. Build one source-reviewed flight exercise spanning planning, departure, en route, arrival and diversion decisions, with an instructor debrief. Existing radio scenarios provide a useful starting point but are not a full-flight assessment.
4. Add diagnostic entry and a next-session plan. FSRS exists in the code, but the main flashcard flow still explicitly uses adaptive mode; connect due-review scheduling to the user-facing workflow before describing that flow as spaced repetition.
5. Resolve dependency advisories and make the local performance/advisory tools portable before considering public release.

Keep reading, recall, application and instructor-observed performance distinct. Do not derive an operational readiness claim from a percentage quiz score.
