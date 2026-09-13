"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { climbRelationship } from "../model/geometry";
import { DiagramFrame, ThinkThrough, LessonSources } from "./LessonParts";

export function GradientLesson() {
  const [gradient, setGradient] = useState(5);
  const [speed, setSpeed] = useState(120);
  const result = climbRelationship(gradient, speed);
  const reference = climbRelationship(gradient, 120);
  const plotX = (knots: number) => 55 + (knots - 40) / 180 * 370;
  const plotY = (rate: number) => 250 - rate / 2000 * 210;
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <DiagramFrame title="Rate against groundspeed" description={`At an illustrative ${gradient.toFixed(1)}% gradient, ${speed} kt requires approximately ${Math.round(result.feetPerMinute)} ft/min geometrically. The line shows why rate increases as groundspeed increases.`}>
          <svg viewBox="0 0 480 320" role="img" aria-label="Graph of vertical rate increasing linearly with groundspeed for a fixed gradient" className="principle-svg">
            {[0, 500, 1000, 1500, 2000].map((n) => <g key={n}><path d={`M55 ${plotY(n)}H430`} stroke="var(--ifr-diagram-grid)" /><text x="47" y={plotY(n) + 6} textAnchor="end">{n}</text></g>)}
            <text x="55" y="25">ft/min</text>
            {[40, 120, 220].map((n) => <text key={n} x={plotX(n)} y="278" textAnchor="middle">{n}</text>)}
            <text x="240" y="310" textAnchor="middle">Groundspeed · kt</text>
            <path d={`M${plotX(40)} ${plotY(climbRelationship(gradient, 40).feetPerMinute)} L${plotX(220)} ${plotY(climbRelationship(gradient, 220).feetPerMinute)}`} stroke="var(--ifr-accent)" strokeWidth="4" fill="none" />
            <path d={`M${plotX(speed)} 250 V${plotY(result.feetPerMinute)} H55`} stroke="var(--ifr-text-muted)" strokeDasharray="4 5" fill="none" />
            <circle cx={plotX(speed)} cy={plotY(result.feetPerMinute)} r="7" fill="var(--ifr-surface)" stroke="var(--ifr-accent)" strokeWidth="4" />
          </svg>
        </DiagramFrame>
        <div className="space-y-4">
          <div><label htmlFor="gradient-percent" className="flex justify-between gap-3 font-semibold">Illustrative gradient <output className="workbook-number">{gradient.toFixed(1)}%</output></label><input id="gradient-percent" className="principle-control" type="range" min="2" max="8" step="0.1" value={gradient} onChange={(e) => setGradient(Number(e.target.value))} /></div>
          <div><label htmlFor="groundspeed" className="flex justify-between gap-3 font-semibold">Groundspeed <output className="workbook-number">{speed} kt</output></label><input id="groundspeed" className="principle-control" type="range" min="40" max="220" step="5" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} /></div>
          <div className="rounded-xl bg-[var(--ifr-accent-soft)] p-5" aria-live="polite"><p className="text-sm font-semibold text-[var(--ifr-text-muted)]">Geometric rate</p><p className="mt-1"><output className="workbook-number text-3xl font-medium text-[var(--ifr-accent)]">{Math.round(result.feetPerMinute)}</output><span className="ml-2 text-[var(--ifr-text-muted)]">ft/min</span></p><p className="mt-2 text-sm text-[var(--ifr-text-muted)]">{Math.round(result.feetPerNauticalMile)} ft/NM · at {gradient.toFixed(1)}%</p></div>
          <button type="button" onClick={() => { setGradient(5); setSpeed(120); }} className="workbook-link min-h-11"><RotateCcw size={16} aria-hidden="true" />Reset example</button>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2"><div className="workbook-panel p-5"><h3 className="font-semibold">Distance versus time</h3><p className="mt-2 text-[var(--ifr-text-muted)]">Gradient is height gained per distance travelled. Rate is height gained per minute. Groundspeed connects the two.</p></div><div className="workbook-panel p-5"><h3 className="font-semibold">Worked relationship</h3><p className="mt-2 font-mono text-sm leading-loose">ft/min = ft/NM × kt ÷ 60</p><p className="mt-1 text-[var(--ifr-text-muted)]">At 120 kt and {gradient.toFixed(1)}%: approximately {Math.round(reference.feetPerNauticalMile)} × 120 ÷ 60 = {Math.round(reference.feetPerMinute)} ft/min. Display values are rounded; calculations retain precision.</p></div></div>
      <p className="mt-4 text-sm text-[var(--ifr-text-muted)]">Training relationship only. This does not calculate aircraft climb capability, obstacle clearance, net performance or regulatory margins. Values are illustrative, not a published procedure requirement.</p>
      <ThinkThrough question="Keep the gradient fixed and double the groundspeed. What happens to the required rate?">It doubles. You cover twice the horizontal distance in each minute, so you must gain twice the height each minute to maintain the same gradient. Change 80 kt to 160 kt above and compare the outputs.</ThinkThrough>
      <LessonSources pages="57" primaryTitle="Airservices — Aeronautical Chart User Guide, gradient/rate nomograph" primaryUrl="https://www.airservicesaustralia.com/aip/current/iaipchart/Aeronauticalchartuserguide.pdf" />
    </>
  );
}
