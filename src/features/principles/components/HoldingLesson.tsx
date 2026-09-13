"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { bearingLabel } from "../model/geometry";
import { DiagramFrame, ThinkThrough, LessonSources } from "./LessonParts";

const segments = ["M180 250 L180 110", "M180 110 A60 60 0 0 1 300 110", "M300 110 L300 250", "M300 250 A60 60 0 0 1 180 250"];
const steps = [
  { label: "Inbound", description: "Track towards the holding fix on the prescribed inbound track." },
  { label: "First turn", description: "At the fix, turn in the published direction towards the outbound leg." },
  { label: "Outbound", description: "The nominal outbound leg is parallel to the inbound leg. Wind correction changes the heading you need." },
  { label: "Second turn", description: "Turn back to intercept the inbound track. Published limits and the clearance govern the actual pattern." },
];

export function HoldingLesson() {
  const [inbound, setInbound] = useState(0);
  const [left, setLeft] = useState(false);
  const [step, setStep] = useState(0);
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <DiagramFrame title="Plan view" description={`${left ? "Left" : "Right"}-turn pattern. Inbound ${bearingLabel(inbound)}; nominal outbound ${bearingLabel(inbound + 180)}. The blue segment is ${steps[step]!.label.toLowerCase()}. No wind is drawn.`}>
          <svg viewBox="0 0 480 360" role="img" aria-label="Holding pattern with a highlighted leg or turn" className="principle-svg">
            <circle cx="240" cy="180" r="155" fill="none" stroke="var(--ifr-diagram-grid)" />
            <path d="M240 35V325 M95 180H385" stroke="var(--ifr-diagram-grid)" strokeDasharray="4 6" />
            <text x="240" y="20" textAnchor="middle">N</text><text x="240" y="353" textAnchor="middle">S</text><text x="407" y="186">E</text><text x="54" y="186">W</text>
            <g transform={`rotate(${inbound} 240 180)`}>
              <g transform={left ? "translate(480 0) scale(-1 1)" : undefined}>
                {segments.map((d, index) => <path key={d} d={d} fill="none" stroke={index === step ? "var(--ifr-accent)" : "var(--ifr-border)"} strokeWidth={index === step ? 7 : 4} strokeLinecap="round" />)}
                <path d="M171 187 L180 173 L189 187 M291 173 L300 187 L309 173" fill="none" stroke="var(--ifr-text)" strokeWidth="3" strokeLinejoin="round" />
                <path d="M230 43 L244 50 L230 58 M250 303 L236 310 L250 317" fill="none" stroke="var(--ifr-text)" strokeWidth="3" strokeLinejoin="round" />
                <circle cx="180" cy="110" r="7" fill="var(--ifr-surface)" stroke="var(--ifr-text)" strokeWidth="3" />
              </g>
            </g>
          </svg>
        </DiagramFrame>
        <div className="space-y-5">
          <div><label htmlFor="holding-track" className="flex items-center justify-between font-semibold">Inbound track <output className="workbook-number text-xl">{bearingLabel(inbound)}</output></label><input id="holding-track" className="principle-control" type="range" min="0" max="350" step="10" value={inbound} onChange={(e) => setInbound(Number(e.target.value))} /></div>
          <fieldset><legend className="mb-2 font-semibold">Turn direction</legend><div className="grid grid-cols-2 gap-2"><button type="button" className="principle-segment" aria-pressed={!left} onClick={() => setLeft(false)}>Right turns</button><button type="button" className="principle-segment" aria-pressed={left} onClick={() => setLeft(true)}>Left turns</button></div></fieldset>
          <div><p className="mb-2 font-semibold">Walk around the pattern</p><div className="grid grid-cols-2 gap-2">{steps.map((item, i) => <button type="button" key={item.label} className="principle-segment" aria-pressed={step === i} onClick={() => setStep(i)}>{i + 1}. {item.label}</button>)}</div></div>
          <p className="min-h-24 border-l-2 border-[var(--ifr-accent)] pl-4 text-[var(--ifr-text-muted)]" aria-live="polite">{steps[step]!.description}</p>
          <button type="button" onClick={() => { setInbound(0); setLeft(false); setStep(0); }} className="workbook-link min-h-11"><RotateCcw size={16} aria-hidden="true" />Reset example</button>
        </div>
      </div>
      <p className="mt-4 text-sm text-[var(--ifr-text-muted)]">The open circle marks the holding fix. Geometry only: this does not select an entry, define protected airspace, or calculate wind correction, timing or DME limits.</p>
      <ThinkThrough question="If the inbound track changes, does that tell you to change the turn direction?">No. The track orients the pattern; the published procedure or clearance specifies the turn direction. Use both pieces of information. Rotate the track above, then switch turn direction to see the difference.</ThinkThrough>
      <LessonSources pages="38–40" primaryTitle="Airservices AIP — holding procedures, ENR 1.5" primaryUrl="https://www.airservicesaustralia.com/aip/current/aip/complete_19MAR2026.pdf" />
    </>
  );
}
