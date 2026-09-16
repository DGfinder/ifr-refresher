"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, ChevronRight } from "lucide-react";
import type { BaselineCatalogItem } from "../model/baseline";

type ChapterNode =
  | { kind: "topic"; topic: BaselineCatalogItem }
  | { kind: "group"; parent: string; topics: BaselineCatalogItem[] };

// Source order is meaningful, so walk the list once and open a group when the parent changes
// rather than collecting all parented topics together.
function groupByChapter(topics: BaselineCatalogItem[]) {
  const chapters: { name: string; count: number; nodes: ChapterNode[] }[] = [];
  for (const topic of topics) {
    let chapter = chapters[chapters.length - 1];
    if (chapter?.name !== topic.chapter) {
      chapter = { name: topic.chapter, count: 0, nodes: [] };
      chapters.push(chapter);
    }
    chapter.count += 1;
    if (!topic.parent) {
      chapter.nodes.push({ kind: "topic", topic });
      continue;
    }
    const last = chapter.nodes[chapter.nodes.length - 1];
    if (last?.kind === "group" && last.parent === topic.parent) last.topics.push(topic);
    else chapter.nodes.push({ kind: "group", parent: topic.parent, topics: [topic] });
  }
  return chapters;
}

function TopicLink({ topic }: { topic: BaselineCatalogItem }) {
  return <Link href={`/study/${topic.id}`} className="baseline-topic-link">{topic.title}</Link>;
}

export function BaselineContents({ topics }: { topics: BaselineCatalogItem[] }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLocaleLowerCase();
  const matches = topics.filter((topic) => `${topic.title} ${topic.chapter} ${topic.parent ?? ""}`.toLocaleLowerCase().includes(needle));
  const chapters = groupByChapter(matches);
  const searching = needle.length > 0;

  return (
    <div className="baseline-contents">
      <header className="baseline-heading">
        <h1>Contents</h1>
      </header>
      <div className="baseline-search">
        <label htmlFor="topic-search">Find a topic</label>
        <div className="baseline-search-field">
          <Search size={19} aria-hidden="true" />
          <input id="topic-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search topic titles" />
        </div>
        {needle && <p role="status" className="baseline-byline">{matches.length} {matches.length === 1 ? "topic" : "topics"} found</p>}
      </div>
      {matches.length === 0 ? <div className="baseline-empty"><p>No topics match “{query}”.</p><button type="button" onClick={() => setQuery("")}>Clear search</button></div> : (
        <div className="baseline-chapters">{chapters.map((chapter) => (
          // Remount on search state change so the open default is reapplied after a manual toggle.
          <details key={`${chapter.name}:${searching}`} className="baseline-chapter" open={searching}>
            <summary>
              <ChevronRight size={18} aria-hidden="true" />
              <h2>{chapter.name}</h2>
              <span className="baseline-chapter-count">{chapter.count}</span>
            </summary>
            <ul className="baseline-topic-list">{chapter.nodes.map((node) => (node.kind === "topic" ? (
              <li key={node.topic.id}><TopicLink topic={node.topic} /></li>
            ) : (
              <li key={node.parent} className="baseline-subgroup">
                <h3>{node.parent}</h3>
                <ul className="baseline-topic-list">{node.topics.map((topic) => <li key={topic.id}><TopicLink topic={topic} /></li>)}</ul>
              </li>
            )))}</ul>
          </details>
        ))}</div>
      )}
      <footer className="baseline-source-note">
        <a href="/source/reference-v7-1/original.pdf" target="_blank" rel="noreferrer">Open source PDF <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (new tab)</span></a>
        <span>58 source pages · front matter included in PDF</span>
      </footer>
    </div>
  );
}
