# Curriculum reset

Latest owner authorisation: extend relevant Australian operational examples beyond the three pilots, using agent drafts reviewed by root. Use brief, human-readable situations and decisions within existing parent topics. Skip topics where an example merely repeats the reference or requires unsupported aircraft/procedure details. Keep the immutable source baseline and single contents structure. This supersedes the earlier three-pilot scope limit.

## Current stage — three operational pilots

The owner has now authorised a trial of Australian-only operational context for fuel/alternates, equipment defects and landing minima. Add each beneath its existing source topic, retaining the captured baseline unchanged. Use explicit scenario assumptions, a decision with revealable reasoning, Part 91/135/121 comparisons and one changed-fact exercise. Current official references are checked for these additions only. This supersedes the earlier enrichment deferral for these three examples; it does not authorise expansion across the syllabus. See `docs/reviews/2026-09-13-operational-pilots.md`.

## Latest owner correction — baseline first

Capture the supplied cheat sheet before adding operational context. Current work is source capture only. Earlier lesson enrichment directions below describe a future stage and are superseded for now. The 58-page baseline is in docs/curriculum/baseline; enriched Holding and Administrational drafts are parked in docs/curriculum/deferred-context. Do not continue those drafts or migrate them into the baseline.

Owner direction recorded 13 September 2026. Subsequent authorisation: implement the captured baseline reader and brand mockups. The app now serves 51 source topics and three isolated style comparisons; operational enrichment remains deferred. Rendered UX review remains outstanding.

## Problem being corrected

The current Study screen presents fourteen competing section cards, a category sidebar and a module grid. Topic descriptions and titles are truncated. The cheat-sheet summary competes with expanded sections and additional collections such as traps and quick-fire numbers. The new visual lesson became yet another destination and omitted the holding decisions the learner actually needs to practise.

This is a curriculum and information-architecture failure. A colour/font refresh cannot resolve it. Earlier passing automated checks do not establish that the experience is useful for IPC preparation.

## Source contract

Use Ben Montgomery-Schinkel's IFR Cheat Sheet V7.1, 30 March 2024, as the canonical starting curriculum. The supplied file is `C:/Users/Hayden/Downloads/IFR-Cheat-Sheet.pdf`; the repository copy is `docs/content/IFR-Cheat-Sheet (1).pdf`.

Preserve its topic names, sequence and coverage as the initial contents. The PDF is the teaching starting point, not an assurance that its 2024 regulatory details remain current. Compare current requirements against official CASA/Airservices sources when authoring each lesson. Record differences explicitly rather than silently mixing editions.

Every lesson needs: stable topic ID, original heading, exact PDF pages, a learning objective, official references where applicable, source edition/access date and review status. Any supplementary explanation or scenario must have an identified purpose and parent topic. Do not treat invented scenarios as quoted source material.

## Initial source map

This chapter map is based on the PDF contents and page text. It is an outline for the full topic-level mapping, not a claim that every rule has been verified.

| Source chapter | PDF pages | Treatment |
|---|---|---|
| Administrational | 6–13 | Keep original subtopics, including IPC, privileges, recency and equipment |
| General Operational Knowledge | 14–21 | Keep each named source topic distinct |
| Phraseology | 22–24 | Integrate source coverage; defer unrelated radio extensions |
| Preflight / Alternate Requirements | 25–30 | Preserve conditions and exceptions rather than compressing them into numbers |
| Departure | 31–35 | Include checks, minima and both sample briefings |
| En Route | 36–37 | Retain the source sequence |
| Holding | 38–40 | First complete lesson for review |
| Approaches | 41–56 | Preserve individual source subtopics, including missed approaches |
| Gradient Rate Nomograph | 57 | Explain the relationship in text first |
| Sample Approach Briefing | 58 | Retain as a worked briefing within the curriculum |

Pages 1–5 supply contents, edition notes and introduction. Preserve the source's explanatory qualifications when completing the detailed map.

## One lesson format

Owner clarification: use the supplied cheat-sheet text directly where useful, with attribution, and build plain-English operational context and worked scenarios around it. Current-publication verification is deferred for this authoring stage. This changes the drafting priority, not the source edition. Keep editorial review mechanics out of the main learning narrative.

1. Topic title and what the pilot should be able to explain or decide.
2. Core knowledge in readable prose, with the relevant conditions and exceptions alongside it.
3. A worked example only where it materially aids understanding.
4. A small number of oral questions with reasoned answers, drawn from the same reviewed content.
5. Exact cheat-sheet pages and official reference notes.

Start with text. Add a table or embedded diagram only when it explains something the prose alone does poorly. Do not force the same number of examples, questions or visual elements into every topic. Do not claim that reading or quiz scores establish IPC readiness.

## Holding acceptance brief

The lesson must connect interpreting the clearance/procedure, orienting the inbound course and holding side, selecting and flying an entry, establishing inbound, maintaining the hold and departing as cleared. The inbound holding course and onward/departure track must be distinguished rather than assumed identical.

Map the entry explanation to pages 38–39 and limitations to page 40. Verify current official source details before writing numerical rules or worked entry solutions. Any departure detail not adequately covered by these pages requires an explicit supplementary reference.

If a visual is added later, it must depict a real racetrack, the fix, direction arrows, inbound course, arrival direction and relevant departure track. It must support the worked problem. Entry boundaries, left/right mirroring and course wraparound require independent checked examples before implementation is accepted. Generated raster images are unsuitable for that exact geometry.

## Simplified learner experience

A contents page follows the cheat sheet's chapter/subtopic hierarchy and offers search. Selecting a topic opens the lesson directly. A compact contents control and previous/next links support movement through the syllabus. Show full meaningful topic titles; avoid nested grids and repeated descriptions. Saved topics can be added without creating a competing syllabus.

Do not carry dashboards, separate visual libraries, traps collections, quick-fire collections, multiple preparation modes or airline extensions into the initial rebuild. Existing material is a candidate reference for comparison, not approved content for automatic migration. Preserve the old implementation for recovery.

## Delivery and evidence

1. Complete the topic-level source map, including gaps and duplicate candidates.
2. Write the holding lesson in text and review it against its sources.
3. Obtain owner feedback on that concrete lesson and a simple contents/reader example before broad rollout, as proposed in the curriculum-reset discussion.
4. Implement the minimal reader and inspect rendered desktop/mobile layouts and keyboard navigation under applicable tool permissions. In particular, verify complete titles, readable text and a direct path from contents to useful learning material.
5. Expand only the reviewed lesson pattern, in source order. Add instructional enhancements against specific demonstrated needs.

Completion reports must distinguish technical checks, aviation source review, instructional review and rendered UX checks. Unperformed checks remain unverified. A plan or automated test is not evidence that a pilot can use the site effectively.

For this documentation-only change, no runtime tests, production build, dependency audit or browser checks were rerun. No application code or aviation rules changed.
