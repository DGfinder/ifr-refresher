import type { ReadingDocument, ReadingItem } from "../model/readingDocument";
import Image from "next/image";

function ReadingList({ items }: { items: ReadingItem[] }) {
  return <ol className="reading-list" role="list">{items.map((item, index) => {
    const marker = item.text.match(/^(?:\([^)]*\)|[a-zA-Z0-9]+[.)]|[•●▪–-])\s+/)?.[0] ?? "";
    return <li key={index}><span className="reading-marker">{marker}</span><div>{item.text.slice(marker.length)}{item.children && <ReadingList items={item.children} />}</div></li>;
  })}</ol>;
}

export function ReadingText({ document }: { document: ReadingDocument }) {
  return <div className="reading-prose prose">
    {document.blocks.map((block, index) => {
      if (block.kind === "list") return <ReadingList key={index} items={block.items} />;
      if (block.kind === "heading") return <h2 key={index}>{block.text}</h2>;
      if (block.kind === "table" && block.rows.every((row) => row.length === 1)) return <section key={index} className="reading-requirements">
        {block.headers[0] && <h2>{block.headers[0]}</h2>}
        <ul>{block.rows.map((row, rowIndex) => <li key={rowIndex}>{row[0]}</li>)}</ul>
      </section>;
      if (block.kind === "figure") return <figure key={index} className="reading-figure">
        <a href={`/source/reference-v7-1/original.pdf#page=${block.page}`} target="_blank" rel="noreferrer" aria-label={`Open original diagram on page ${block.page} in PDF, new tab`}>
          <Image src={block.image.src} width={block.image.width} height={block.image.height} alt={`Original source layout, page ${block.page}. ${block.text}`} unoptimized />
        </a>
        <figcaption>Original source layout · page {block.page}</figcaption>
      </figure>;
      if (block.kind === "table") return <div key={index} className="reading-table-scroll" role="region" aria-label={document.title || "Source table"} tabIndex={0}>
        <table>
          <caption className="sr-only">{document.title || "Source table"}</caption>
          {block.headers.length > 0 && <thead><tr>{block.headers.map((header, column) => <th key={column} scope="col">{header}</th>)}</tr></thead>}
          <tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>
            {block.sharedRows?.includes(rowIndex)
              ? <td className="reading-shared-row" colSpan={row.length}>{row.join(" ").trim()}</td>
              : row.map((cell, cellIndex) => {
                if (cellIndex !== 0) return <td key={cellIndex}>{cell}</td>;
                const span = block.firstColumnSpans?.[rowIndex] ?? 1;
                if (span === 0) return null;
                return <th scope={span > 1 ? "rowgroup" : "row"} rowSpan={span} key={cellIndex}>{cell}</th>;
              })}
          </tr>)}</tbody>
        </table>
      </div>;
      return <p key={index} className={`reading-${block.kind}`}>{block.text}</p>;
    })}
  </div>;
}
