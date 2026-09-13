"use client";

import { useState, type ReactNode } from "react";
import { BookOpen, Moon, Monitor, Smartphone } from "lucide-react";
import "../brand-mockups.css";

const directions = [
  { id: "technical", number: "01", name: "Technical manual", Icon: BookOpen, description: "White paper, navy text and precise blue accents. Source Sans 3 throughout; numbers in IBM Plex Mono.", tradeoff: "The light theme used throughout IFR Quick Study." },
  { id: "night", number: "02", name: "Night reading", Icon: Moon, description: "Deep navy surfaces, soft light text and restrained cyan. A compact heading and generous body spacing.", tradeoff: "The dark theme used throughout IFR Quick Study." },
] as const;

export function BrandMockups({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<typeof directions[number]["id"]>("technical");
  const [phone, setPhone] = useState(false);
  const direction = directions.find((item) => item.id === selected)!;
  return (
    <div className="brand-lab">
      <header><p className="baseline-kicker">Design system</p><h1>One reader. Light and dark.</h1><p>Technical manual for light mode. Night reading for dark mode.</p></header>
      <div className="brand-options" aria-label="Brand directions">{directions.map(({ id, number, name, Icon, description }) => (
        <button key={id} type="button" className={`brand-option brand-${id}`} aria-pressed={selected === id} onClick={() => setSelected(id)}>
          <span className="brand-option-top"><span>{number}</span><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
          <strong>{name}</strong><span className="brand-option-description">{description}</span>
          <span className="brand-swatches" aria-hidden="true"><i /><i /><i /></span>
        </button>
      ))}</div>
      <div className="brand-preview-toolbar">
        <div aria-live="polite"><h2>{direction.name}</h2><p>{direction.tradeoff}</p></div>
        <div className="baseline-view-toggle" aria-label="Mockup width"><button type="button" aria-pressed={!phone} onClick={() => setPhone(false)}><Monitor size={17} aria-hidden="true" />Wide</button><button type="button" aria-pressed={phone} onClick={() => setPhone(true)}><Smartphone size={17} aria-hidden="true" />Narrow</button></div>
      </div>
      <div className={`brand-preview brand-${selected} ${phone ? "brand-phone" : ""}`}>
        <div className="brand-masthead"><span className="brand-wordmark">IFR<span>Quick Study</span></span><span className="brand-masthead-meta">Australian IFR<br />Source reader</span></div>
        {children}
      </div>
      <p className="brand-footnote">These controls change this preview only. Reading links open the baseline site; source wording is unchanged.</p>
    </div>
  );
}
