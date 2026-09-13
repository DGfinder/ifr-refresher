import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { baselineTopics, pageLabel, sourcePdf, originalPageFirst } from "../model/baseline";
import { SourceFragment } from "./SourceFragment";
import { readingDocument } from "../model/readingDocument";

export function BaselineReader({ topic }: { topic: typeof baselineTopics[number] }) {
  const index = baselineTopics.findIndex((item) => item.id === topic.id);
  const previous = baselineTopics[index - 1];
  const next = baselineTopics[index + 1];
  const siblings = baselineTopics.filter((item) => item.chapter === topic.chapter);
  const first = topic.fragments[0];
  const sourceTitle = first ? readingDocument(topic.id, first.page, first.text)?.title : undefined;
  return (
    <div className="baseline-reader">
      <aside className="baseline-outline">
        <Link href="/study" className="baseline-back"><ArrowLeft size={16} aria-hidden="true" />All contents</Link>
        <details><summary>{topic.chapter}</summary><nav aria-label="Chapter topics"><ul>{siblings.map((item) => <li key={item.id}><Link href={`/study/${item.id}`} aria-current={item.id === topic.id ? "page" : undefined}>{item.title}</Link></li>)}</ul></nav></details>
      </aside>
      <article className="baseline-article">
        <header className="baseline-heading"><p className="baseline-kicker">{topic.parent ?? topic.chapter}</p><h1>{sourceTitle || topic.title}</h1><p className="baseline-byline">{pageLabel(topic.source_pages)}</p></header>
        {topic.fragments.map((fragment) => <SourceFragment key={fragment.page} page={fragment.page} text={fragment.text} showOriginalFirst={originalPageFirst.has(fragment.page)} document={readingDocument(topic.id, fragment.page, fragment.text)} />)}
        <p className="baseline-attribution">Source: Ben Montgomery-Schinkel · 30 March 2024. Source wording retained; tables and diagrams are available in Original page view.</p>
        <a className="baseline-source-link" href={`${sourcePdf}#page=${topic.source_pages[0]}`} target="_blank" rel="noreferrer">Open this topic in the original PDF<span className="sr-only"> (new tab)</span></a>
        <nav className="baseline-pagination" aria-label="Previous and next topic">
          {previous ? <Link href={`/study/${previous.id}`}><span><ArrowLeft size={16} aria-hidden="true" />Previous</span>{previous.title}</Link> : <span />}
          {next && <Link href={`/study/${next.id}`}><span>Next<ArrowRight size={16} aria-hidden="true" /></span>{next.title}</Link>}
        </nav>
      </article>
    </div>
  );
}
