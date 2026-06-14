# PDF extraction workflow

IFR Refresher can use [`@opendataloader/pdf`](https://github.com/opendataloader-project/opendataloader-pdf) to turn source PDFs into Markdown and JSON for review, search, and draft content work.

This is an extraction aid only. Extracted Markdown/JSON is not authoritative aviation content until a human verifies the rule text, source version, and access date.

## Prerequisites

- Node dependencies installed with `npm install`.
- Java 11+ available on `PATH` (`java -version`). The Node package shells out to the bundled Java CLI.

## Default extraction

```bash
npm run content:extract-pdf
```

Default inputs:

- `docs/content/IFR-Cheat-Sheet (1).pdf`
- `docs/content/multipart-ac-64b-02-ac-91-35-and-ac-172-05-radiotelephony-manual-for-flight-operations.pdf`

Default output:

- `docs/content/extracted/*.md`
- `docs/content/extracted/*.json`

## Custom extraction

```bash
npm run content:extract-pdf -- --output-dir docs/content/extracted docs/content/source.pdf
```

The script batches all PDFs in one OpenDataLoader call where possible. Avoid looping one PDF per command because each conversion starts a JVM.

## Review rules

Before copying extracted text into `src/content/data/**`:

1. Check the extracted Markdown against the PDF page(s).
2. Confirm current authoritative source/version/date.
3. Add/update references/provenance in the affected content module.
4. Run `npm run content:check` and the normal quality gates.
5. Update `docs/content/content-verification.md` if the source/review status changes.
