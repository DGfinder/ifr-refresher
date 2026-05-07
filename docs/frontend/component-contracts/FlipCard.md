# Component Contract — FlipCard

Component: `FlipCard`
Layer: pattern
Owner: Hayden / Hermes

## Purpose
Supports flashcard study by showing question/front and answer/back with a tap/click flip interaction and optional regulation context.

## API / props
| Prop | Type | Required | Notes |
|---|---|---:|---|
| `front` | `React.ReactNode` | yes | Front face content. |
| `back` | `React.ReactNode` | yes | Back face content. |
| `isFlipped` | `boolean` | yes | Controls face visibility. |
| `onFlip` | `() => void` | yes | Called when front face is clicked. |
| `dragX` | `number` | no | Swipe/drag offset. |
| `dragRotate` | `number` | no | Swipe/drag rotation. |
| `isDragging` | `boolean` | no | Disables transition while dragging. |
| `moduleContext` | `string[]` | no | Optional regulation/context list. |

## Accessibility contract
- Front face click should remain backed by surrounding flashcard controls/keyboard flow.
- Regulation context uses native `<details>/<summary>`.
- Future keyboard enhancement: Enter/Space on focused card should flip.

## Token/style contract
- Colours use IFR tokens.
- Dynamic transform is provided through CSS variables (`--card-transform`, `--card-transition`) as the approved inline-style escape hatch.
- 3D CSS is intentionally local to this component.

## Tests
- Playwright flashcard journey should verify flip reveals answer.
- Future visual snapshot should cover front/back states.
