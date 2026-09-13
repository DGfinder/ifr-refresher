"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import type { BaselineCatalogItem } from "../model/baseline";

export function BaselineContents({ topics }: { topics: BaselineCatalogItem[] }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLocaleLowerCase();
  const matches = topics.filter((topic) => `${topic.title} ${topic.chapter} ${topic.parent ?? ""}`.toLocaleLowerCase().includes(needle));
  const chapters = [...new Set(matches.map((topic) => topic.chapter))];

  return (
    <div className="baseline-contents">
      <header className="baseline-heading">
        <p className="baseline-kicker">IFR Cheat Sheet · V7.1</p>
        <h1>Contents</h1>
        <p className="baseline-byline">Ben Montgomery-Schinkel · 30 March 2024</p>
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
          <section key={chapter} aria-label={chapter}>
            <h2>{chapter}</h2>
            <ul>{matches.filter((topic) => topic.chapter === chapter).map((topic, index, group) => (
              <li key={topic.id}>
                {topic.parent && (index === 0 || group[index - 1]?.parent !== topic.parent) && <h3 className="baseline-subgroup">{topic.parent}</h3>}
                <Link href={`/study/${topic.id}`} className="baseline-topic-link">
                  <span>{topic.title}</span><span className="baseline-page-ref">{topic.pages.length === 1 ? topic.pages[0] : `${topic.pages[0]}–${topic.pages[topic.pages.length - 1]}`}</span>
                </Link>
              </li>
            ))}</ul>
          </section>
        ))}</div>
      )}
      <footer className="baseline-source-note">
        <a href="/source/ifr-cheat-sheet-v7-1/original.pdf" target="_blank" rel="noreferrer">Open original cheat sheet <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (new tab)</span></a>
        <span>58 source pages · front matter included in PDF</span>
      </footer>
    </div>
  );
}
