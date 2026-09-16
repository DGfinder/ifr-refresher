# Practice items

Practice, quiz, radio and insights all read from one corpus: `items.generated.json`,
derived from the captured baseline source.

```
docs/curriculum/baseline/topics.json     captured source text, per topic
docs/curriculum/baseline/layout.json     the same PDF re-read with coordinates
src/content/practice/overrides.json      hand-written items, where extraction cannot work
        │
        ▼  npm run practice:build
src/content/practice/items.generated.json      committed
        │
        ▼  index.ts adapts to Section[]
  practice  │  quiz  │  radio  │  insights
```

## Commands

| | |
|---|---|
| `npm run practice:build` | regenerate `items.generated.json` |
| `npm run practice:check` | fail if the committed output is stale (runs in CI) |
| `npm run source:extract-layout` | re-read the PDF into `layout.json` (only if the PDF changes) |

The output is committed on purpose, so a change to the items shows up in a diff
and can be read before it reaches a card.

## Why there are two paths

The original text extraction flattened every table: page 18's VMC minima arrive
as `Class G Class E` then `5000M 5000M`, with the row structure gone. Those
tables hold the numbers most worth drilling, so `extract-source-layout.mjs`
re-reads the PDF keeping each text run's coordinates and rebuilds rows and
columns from the geometry.

Some tables still cannot be read at all. Page 18's VMC rows are distinguished
only by arrow glyphs — `1500M ⇔` horizontal, `1000FT ⇕` vertical, `500FT ⇩`
below — and those glyphs are symbol-font characters with no Unicode mapping, so
the text layer contains `1500M` and nothing else. No extraction recovers them.

## Fixing a heuristic vs adding an override

**Fix the generator** when the source has the structure and the extractor is
misreading it. Those bugs repeat across topics, so a fix pays for itself.

**Add an override** when the meaning is not in the text at all — glyph-borne
table rows, or a layout whose columns carry the sense. Transcribe from the page
image under `public/source/reference-v7-1/`, record which page in
`sourceNote`, and the items are tagged `source: "transcribed"` so their
provenance stays visible. An override replaces the extractor's output for that
topic rather than adding to it.

An unknown topic id in `overrides.json` fails the build. Silently falling back
to the extractor for a topic known to need an override is the failure this file
exists to prevent.

## The well-formed gate

Everything passes a final check before serialisation. An item is dropped if its
answer is severed mid-sentence, has an unclosed parenthesis, is given away by
its own prompt, or if its prompt is a bare stem, a paragraph-long lead-in, or
one of the source's author notes describing a rescinded rule.

The generator reports how many it suppressed. That number going up after a
change is the signal to look at the diff, not to loosen the gate — a wrong
answer reaches someone studying for a flight test, and a missing item does not.

## Question ids and your revision schedule

Ids are derived from the prompt (`features/drill/model/questionIds.ts` hashes
it), so regenerating does not disturb FSRS scheduling **as long as prompts do
not change**. A generator change that rewords prompts silently resets the
schedule for every affected card. Read the regenerated diff before committing.

## Quiz options

Only items with three valid distractors are scored, and distractors come from
sibling rows of the same table — Category B is the plausible wrong answer to
Category A. Answers are never borrowed between unrelated questions: a fact that
is true elsewhere is not a safe wrong answer here. Radio calls are excluded
entirely; four multi-line scripts as options tests nothing.
