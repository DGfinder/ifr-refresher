"use client";

import { useState } from "react";
import Image from "next/image";

export function SourceFragment({ page, text, showOriginalFirst }: { page: number; text: string; showOriginalFirst: boolean }) {
  const [original, setOriginal] = useState(showOriginalFirst);
  const pdfPage = `/source/ifr-cheat-sheet-v7-1/original.pdf#page=${page}`;
  return (
    <section className="baseline-fragment" aria-label={`Source page ${page}`}>
      <div className="baseline-fragment-toolbar">
        <span className="baseline-page-ref">Source page {page}</span>
        <div className="baseline-view-toggle" aria-label={`Page ${page} view`}>
          <button type="button" aria-pressed={!original} onClick={() => setOriginal(false)}>Text</button>
          <button type="button" aria-pressed={original} onClick={() => setOriginal(true)}>Original page</button>
        </div>
      </div>
      {original ? (
        <figure className="baseline-original">
          <a href={pdfPage} target="_blank" rel="noreferrer" aria-label={`Open source page ${page} in PDF, new tab`}>
            <Image src={`/source/ifr-cheat-sheet-v7-1/page-${page}.webp`} width={1012} height={1432} alt={`Original IFR Cheat Sheet page ${page}. Text transcription is available using the Text button above.`} unoptimized />
          </a>
          <figcaption>Original full page · <a href={pdfPage} target="_blank" rel="noreferrer">Open PDF to zoom<span className="sr-only"> (new tab)</span></a></figcaption>
        </figure>
      ) : (
        <>
          {showOriginalFirst && <p className="baseline-transcription-note">This page includes a table or diagram. Use Original page for its layout.</p>}
          <div className="baseline-source-text">{text}</div>
        </>
      )}
    </section>
  );
}
