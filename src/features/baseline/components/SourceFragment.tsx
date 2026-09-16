"use client";

import { useState } from "react";
import Image from "next/image";
import type { ReadingDocument } from "../model/readingDocument";
import { ReadingText } from "./ReadingText";

export function SourceFragment({ page, text, showOriginalFirst, document }: { page: number; text: string; showOriginalFirst: boolean; document?: ReadingDocument | undefined }) {
  const [original, setOriginal] = useState(showOriginalFirst && !document);
  const pdfPage = `/source/reference-v7-1/original.pdf#page=${page}`;
  return (
    <section className="baseline-fragment" aria-label={`Source page ${page}`}>
      <div className="baseline-fragment-toolbar">
        <div className="baseline-view-toggle" aria-label={`Page ${page} view`}>
          <button type="button" aria-pressed={!original} onClick={() => setOriginal(false)}>{document ? "Reading view" : "Text"}</button>
          <button type="button" aria-pressed={original} onClick={() => setOriginal(true)}>Original page</button>
        </div>
      </div>
      {original ? (
        <figure className="baseline-original">
          <a href={pdfPage} target="_blank" rel="noreferrer" aria-label={`Open source page ${page} in PDF, new tab`}>
            <Image src={`/source/reference-v7-1/page-${page}.webp`} width={1012} height={1432} alt={`Original source page ${page}. Text transcription is available using the reading controls above.`} unoptimized />
          </a>
          <figcaption>Original full page · <a href={pdfPage} target="_blank" rel="noreferrer">Open PDF to zoom<span className="sr-only"> (new tab)</span></a></figcaption>
        </figure>
      ) : (
        <>
          {showOriginalFirst && !document && <p className="baseline-transcription-note">This page includes a table or diagram. Use Original page for its layout.</p>}
          {document ? <ReadingText document={document} /> : <div className="baseline-source-text">{text}</div>}
        </>
      )}
    </section>
  );
}