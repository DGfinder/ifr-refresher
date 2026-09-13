import Link from "next/link";

export default function SourceNotesPage() {
  return <div className="baseline-contents">
    <header className="baseline-heading"><p className="baseline-kicker">Source notes</p><h1>Source notes</h1><p className="baseline-byline">Ben Montgomery-Schinkel · V7.1 · 30 March 2024</p></header>
    <div className="mt-6 space-y-5 text-lg leading-relaxed">
      <p>This reader follows the reference material&apos;s topic order and retains its source wording. Text extraction can flatten tables and omit diagrams; use Original page to see the source layout.</p>
      <p>The original PDF includes all 58 pages, its introduction, edition notes and author credits. This is the supplied 2024 edition.</p>
      <a className="baseline-source-link" href="/source/reference-v7-1/original.pdf" target="_blank" rel="noreferrer">Open original PDF<span className="sr-only"> (new tab)</span></a>
      <p><Link href="/study" className="baseline-source-link">Back to contents</Link></p>
    </div>
  </div>;
}
