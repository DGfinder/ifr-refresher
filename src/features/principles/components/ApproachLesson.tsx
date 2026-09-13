"use client";

import { useState } from "react";
import { DiagramFrame, ThinkThrough, LessonSources } from "./LessonParts";

export function ApproachLesson() {
  const [threeD, setThreeD] = useState(false);
  const [stage, setStage] = useState(0);
  const stages = ["Lateral path", "Vertical path", "Published limits"];
  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2" aria-label="Guidance type"><button type="button" className="principle-segment" aria-pressed={!threeD} onClick={() => setThreeD(false)}>2D · lateral guidance</button><button type="button" className="principle-segment" aria-pressed={threeD} onClick={() => setThreeD(true)}>3D · lateral + vertical guidance</button></div>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <DiagramFrame title={stage === 0 ? "Plan view" : "Profile view"} description={stage === 0 ? "Both types provide lateral guidance. The line shows an illustrative path towards the aerodrome." : threeD ? "3D guidance includes a vertical path. Equipment, procedure and authorisation determine what can be flown." : "In a 2D operation the pilot manages the vertical path against published constraints. A continuous descent may be used where appropriate; the path here is schematic."}>
          <svg viewBox="0 0 480 320" role="img" aria-label={`${threeD ? "3D" : "2D"} approach ${stage === 0 ? "lateral" : "vertical"} guidance concept`} className="principle-svg">
            <path d="M40 60H440 M40 130H440 M40 200H440 M40 270H440 M100 40V280 M200 40V280 M300 40V280 M400 40V280" stroke="var(--ifr-diagram-grid)" strokeWidth="1" />
            {stage === 0 ? <><path d="M70 250 L220 160 L400 160" fill="none" stroke="var(--ifr-accent)" strokeWidth="6" strokeLinecap="round" /><circle cx="220" cy="160" r="6" fill="var(--ifr-surface)" stroke="var(--ifr-accent)" strokeWidth="3" /><path d="M280 152 L294 160 L280 168" stroke="var(--ifr-accent)" strokeWidth="3" fill="none" /><text x="65" y="55">Lateral guidance</text></> : <><path d="M65 65 L395 240" fill="none" stroke="var(--ifr-accent)" strokeWidth="6" strokeDasharray={threeD ? undefined : "10 8"} /><path d="M110 145 H195 M195 192H282 M282 239H352" stroke="var(--ifr-text-muted)" strokeWidth="3" opacity={threeD ? 0.35 : 1} /><text x="50" y="30">Height</text><text x="230" y="306">Along the approach →</text>{stage === 2 && <><circle cx="195" cy="145" r="10" fill="var(--ifr-warning-soft)" stroke="var(--ifr-warning)" strokeWidth="3" /><circle cx="282" cy="192" r="10" fill="var(--ifr-warning-soft)" stroke="var(--ifr-warning)" strokeWidth="3" /></>}</>}
            <path d={stage === 0 ? "M408 137V183 M420 137V183" : "M395 265H445 M395 273H445"} stroke="var(--ifr-text)" strokeWidth="4" />
          </svg>
        </DiagramFrame>
        <div>
          <h3 className="text-xl font-semibold">Read the picture in three parts</h3>
          <div className="mt-4 space-y-2">{stages.map((name, i) => <button type="button" key={name} className="principle-segment w-full text-left" aria-pressed={stage === i} onClick={() => setStage(i)}>{i + 1}. {name}</button>)}</div>
          <div className="mt-5 border-l-2 border-[var(--ifr-accent)] pl-4 text-[var(--ifr-text-muted)]" aria-live="polite">
            {stage === 0 ? "Start with the lateral path: where must the aircraft track? Both 2D and 3D operations provide lateral guidance." : stage === 1 ? threeD ? "Now add vertical guidance: a 3D operation provides both lateral and vertical guidance. Follow the approved procedure and its limitations." : "A 2D operation provides lateral guidance. The pilot must manage the vertical profile and respect the published vertical constraints." : "Guidance does not replace chart interpretation. Check applicable constraints, minima, equipment and authorisation. No operational altitudes or minima are represented here."}
          </div>
          <p className="mt-5 text-sm text-[var(--ifr-text-muted)]">Lines and highlighted constraints are illustrative and not to scale. This exercise explains guidance, not a procedure to fly.</p>
        </div>
      </div>
      <ThinkThrough question="Does advisory VNAV guarantee obstacle protection on a lateral-only procedure?">No. CASA states that advisory VNAV may not protect against all obstacles; the descent limitations still apply. CASA also distinguishes the operation from the procedure: using advisory VNAV to manage descent is a 3D operation and cannot satisfy the recent-experience requirement for a 2D operation. A displayed cue does not change the published minima.</ThinkThrough>
      <LessonSources pages="41, 44" primaryTitle="CASA — instrument approach operations" primaryUrl="https://www.casa.gov.au/licences-and-certificates/pilots/ratings-reviews-and-endorsements/instrument-ratings/instrument-approach-operations" />
    </>
  );
}
