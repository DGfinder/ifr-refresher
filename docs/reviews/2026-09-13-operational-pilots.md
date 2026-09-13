# Australian operational pilots

Owner authorisation: “try it out please. examples should be relevant to australia only”.

Three examples are attached to existing baseline topics, without modifying captured source text:

| Parent | Source pages | Learning decision |
|---|---|---|
| preflight-fuel | 25 | Reassess alternate and fuel after an amended TAF |
| admin-equipment | 11–13 | Separate defect permission from required navigation capability |
| approach-landing-minima | 53–54 | Compare applicable chart, aircraft and operator minima |

Australian locations and terminology are used throughout. Weather, fuel worksheet inputs, aircraft capability and company minima are explicitly fictional. No actual TAF, aircraft performance or published approach minima are represented. Each example includes assumptions, revealable reasoning, operation-specific notes and a changed-fact question. No separate scenario library, scoring or dependencies were added.

## Targeted official-source review

Accessed 13 September 2026. Terra and Luna provided bounded research; root reviewed the final wording and corrected the Part 91 compilation date and Part 135 alternate hierarchy.

- [CASR](https://www.legislation.gov.au/F1998B00220/latest): F2026C00560, 30 June 2026. Applicability 91.035; operator minima 121.185/135.155; stabilised approaches 121.200/135.175; MEL applicability 135.045.
- [Part 91 MOS](https://www.legislation.gov.au/F2020L01514/latest): F2026C00587, 9 July 2026. Chapters 8/19, equipment 26.04, minima 15.09–15.11.
- [Part 135 MOS](https://www.legislation.gov.au/F2020L01622/latest): F2026C00600, 9 July 2026. Chapters 5/7 and serviceability 11.04. Chapter 5 is not presented as a complete replacement for applicable Part 91 alternate rules.
- [Part 121 MOS](https://www.legislation.gov.au/F2020L01561/latest): F2026C00215, 14 March 2026. Chapters 4/5/7 and serviceability 11.06.
- [CASA MEL guidance](https://www.casa.gov.au/rules/changing-rules/flight-operations-regulations-transition/minimum-equipment-list-mel): Part 121 MEL requirement. No aircraft-specific defect permission is inferred.

The minima example explicitly limits itself to the no-approach-lighting straight-in NPA case under 15.10(5)–(6). It flags that current provisions differ from the retained 2024 extract. This is not a currency review of the complete baseline or other lighting/approach cases.

## Verification scope

Technical results are recorded after checks below. Rendered desktop/mobile, keyboard, Playwright and Lighthouse checks remain unperformed: the applicable Sites skill prohibits browser QA unless explicitly requested. Aviation source review above is targeted; it is not independent instructor acceptance or operational approval. No service-worker or dependency changes.

- Typecheck, ESLint, 294 unit tests and production build passed (65 static pages).
- All three parent topic IDs and their source-page mappings resolved; `git diff --check` passed.
- Production dependency audit still reports eight existing findings: one critical, six high and one moderate. Dependencies were not changed in this trial.
- Both advisory scripts were attempted but failed to start because Windows Bash returned E_ACCESSDENIED. No passing advisory result is claimed.
