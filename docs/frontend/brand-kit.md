# IFR workbook design system

Decision date: 13 September 2026. Status: implemented first direction for local review.

## Intent
A practical Australian flight-training workbook. Prioritise reading, recall and manipulating an example. Keep navigation labels literal and avoid decorative instrument panels, gradients and emoji navigation.

## Foundations
- Source Sans 3 for body, controls and headings; IBM Plex Mono for numerical values. Fonts are bundled by Next at build time.
- Light paper surfaces, navy ink, restrained blue actions. Dark mode uses the same semantic hierarchy.
- Amber means caution/review, green completed action, red error. Always accompany colour with text or an icon. Reading progress never implies pilot competence.
- Use existing IFR CSS tokens in globals.css. No page-level hex colours.
- Panels: 16px radius. Controls: 8px radius. Spacing follows 4/8px increments; content width 1100px.
- Body 16px with 1.6 line height; supporting text generally 14px. Titles in sentence case.
- Lucide line icons, typically 20–24px, decorative when adjacent to a visible label.
- New controls have at least 44px targets, visible keyboard focus and explicit selected states. Respect reduced motion.

## Working examples
`/design-system` is the live specimen. `/principles` demonstrates diagrams, segmented controls, range inputs, source notes and revealable explanations. The home page and shared shell adopt this direction. Existing deeper screens inherit fonts and tokens; their component-level cleanup is a follow-on, not claimed complete.

## Visual teaching
Use authored SVG for geometry and calculations. Text equivalents accompany diagrams. Use generated imagery only where atmosphere or visual recognition helps learning and exact geometry is unnecessary. No generated artwork is needed for these three lessons.
