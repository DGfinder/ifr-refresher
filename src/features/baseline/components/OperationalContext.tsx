import { operationalSources, operationalReviewDate, type OperationalExample } from "../model/operationalExamples";
import type { BriefExample } from "../model/briefExamples";

function References({ references }: { references: OperationalExample["references"] }) {
  return <ul className="operational-references">{references.map(({ source, sections }) => <li key={`${source}-${sections}`}>
    <a href={operationalSources[source].url} target="_blank" rel="noreferrer">{operationalSources[source].label}: {sections}<span className="sr-only"> (new tab)</span></a>
  </li>)}</ul>;
}

export function OperationalContext({ example }: { example: OperationalExample | BriefExample }) {
  if ("situation" in example) return <section id="operational-context" className="operational-context" aria-labelledby="operational-title">
    <p className="baseline-kicker">Worked example · Australia</p>
    <h2 id="operational-title">{example.title}</h2>
    <p>{example.situation}</p>
    <p>{example.action}</p>
    <p>{example.reason}</p>
    <details className="operational-assumptions"><summary>Reference</summary>
      <p className="operational-meta">Illustrative scenario · source checked {operationalReviewDate}</p>
      <a href={example.sourceUrl} target="_blank" rel="noreferrer">{example.sourceLabel}<span className="sr-only"> (new tab)</span></a>
    </details>
  </section>;
  if (example.compact) return <section id="operational-context" className="operational-context" aria-labelledby="operational-title">
    <p className="baseline-kicker">Worked example · Part 91</p>
    <h2 id="operational-title">{example.title}</h2>
    <p>{example.principle}</p>
    <p>{example.setting}</p>
    <dl className="operational-facts">{example.facts.map(([label, value, definition]) => <div key={label}><dt>{label}</dt><dd>{value}{definition && <p className="operational-definition">{definition}</p>}</dd></div>)}</dl>
    <p className="operational-decision">{example.decision}</p>
    <p>{example.variation.answer}</p>
    <details className="operational-assumptions"><summary>Calculation notes & references</summary>
      <ul>{example.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
      <p className="operational-meta">Sources checked {operationalReviewDate}</p>
      <References references={example.references} />
    </details>
  </section>;
  return <section id="operational-context" className="operational-context" aria-labelledby="operational-title">
    <header>
      <p className="baseline-kicker">Apply the knowledge · Australia</p>
      <h2 id="operational-title">{example.title}</h2>
      <p>{example.principle}</p>
      <p className="operational-meta">New worked example · official sources checked {operationalReviewDate}</p>
    </header>
    {example.sourceNote && <p className="operational-source-note">{example.sourceNote}</p>}
    <h3>The situation</h3>
    <p>{example.setting}</p>
    <details className="operational-assumptions" open>
      <summary>Scenario assumptions</summary>
      <ul>{example.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
    </details>
    <dl className="operational-facts">{example.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <h3>Your decision</h3>
    <p>{example.question}</p>
    <details className="operational-answer">
      <summary>Show the reasoning</summary>
      <p className="operational-decision">{example.decision}</p>
      <ol>{example.reasoning.map((step) => <li key={step}>{step}</li>)}</ol>
      <References references={example.references} />
    </details>
    <h3>How the operation changes the assessment</h3>
    <p>Part 91 provides general rules. Some provisions are displaced for specialised operations; identify the applicable combination before using a rule. <a href={operationalSources.casr.url} target="_blank" rel="noreferrer">CASR 91.035<span className="sr-only"> (new tab)</span></a></p>
    <div className="operational-parts">{example.operations.map((operation) => <section key={operation.part}>
      <h4>{operation.part}</h4><p>{operation.text}</p><References references={operation.references} />
    </section>)}</div>
    <h3>Change one fact</h3>
    <p>{example.variation.question}</p>
    <details className="operational-answer"><summary>Explore the change</summary><p>{example.variation.answer}</p></details>
  </section>;
}
