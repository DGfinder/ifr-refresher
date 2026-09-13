import Link from "next/link";
import { ArrowRight, BookOpen, Bookmark, CheckCircle2, CircleAlert, Layers, Radio, Route } from "lucide-react";
import { Button } from "@/shared/ui/button";

export const metadata = { title: "Design system · IFR Quick Study" };

const swatches = [
  { name: "Paper", use: "Reading surfaces", className: "bg-[var(--ifr-surface)]" },
  { name: "Ink", use: "Primary text", className: "bg-[var(--ifr-text)]" },
  { name: "Blue", use: "Actions and selected states", className: "bg-[var(--ifr-accent)]" },
  { name: "Amber", use: "Cautions and review", className: "bg-[var(--ifr-warning)]" },
  { name: "Green", use: "Completed actions", className: "bg-[var(--ifr-success)]" },
  { name: "Red", use: "Errors needing attention", className: "bg-[var(--ifr-danger)]" },
];

export default function DesignSystemPage() {
  return <div className="workbook-page space-y-8">
    <header><p className="eyebrow-accent">Design direction · 01</p><h1 className="workbook-title mt-2">The flight-training workbook</h1><p className="workbook-lead">Calm pages, legible explanations and controls with a clear purpose. Use the theme button above to compare light and dark.</p></header>
    <section className="workbook-panel p-6"><h2 className="text-2xl font-semibold">Colour carries meaning</h2><p className="mt-2 text-[var(--ifr-text-muted)]">Blue tells you where to act. Status colours always come with words or an icon.</p><div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">{swatches.map((swatch) => <div key={swatch.name}><div className={`mb-2 h-16 rounded-lg border border-[var(--ifr-border)] ${swatch.className}`} /><p className="font-semibold">{swatch.name}</p><p className="text-sm text-[var(--ifr-text-muted)]">{swatch.use}</p></div>)}</div></section>
    <section className="workbook-panel grid gap-6 p-6 md:grid-cols-2"><div><h2 className="text-2xl font-semibold">Type made for reading</h2><p className="mt-3 text-[var(--ifr-text-muted)]">Source Sans 3 handles explanations and navigation. IBM Plex Mono keeps numerical values easy to compare. Sentence case and short paragraphs reduce scanning effort.</p></div><div className="rounded-lg bg-[var(--ifr-surface-muted)] p-5"><p className="eyebrow mb-3">Example lesson</p><h3 className="text-2xl font-semibold">Follow the inbound track</h3><p className="mt-3">The track describes your path over the ground. The heading is where the aircraft points.</p><p className="workbook-number mt-4 text-2xl">360° &nbsp; 120 kt</p><p className="mt-1 text-sm text-[var(--ifr-text-muted)]">Illustrative values</p></div></section>
    <section className="workbook-panel p-6"><h2 className="text-2xl font-semibold">Clear actions, consistent icons</h2><p className="mt-2 text-[var(--ifr-text-muted)]">One line-icon family, visible labels and generous targets. Strong colour belongs to the next useful action.</p><div className="my-5 flex flex-wrap gap-3"><Button asChild><Link href="/principles">Try a visual lesson <ArrowRight aria-hidden="true" /></Link></Button><Button variant="outline" asChild><Link href="/study">Browse lessons</Link></Button><Button disabled>Unavailable</Button></div><div className="grid grid-cols-3 gap-3 sm:grid-cols-6">{[{ Icon: BookOpen, label: "Study" }, { Icon: Layers, label: "Cards" }, { Icon: Route, label: "Holding" }, { Icon: Radio, label: "Radio" }, { Icon: Bookmark, label: "Saved" }, { Icon: CheckCircle2, label: "Read" }].map(({ Icon, label }) => <div key={label} className="flex flex-col items-center gap-2 rounded-lg bg-[var(--ifr-surface-muted)] p-4"><Icon size={24} strokeWidth={1.8} aria-hidden="true" /><span className="text-sm">{label}</span></div>)}</div></section>
    <section className="workbook-panel p-6"><h2 className="text-2xl font-semibold">A useful caution</h2><div className="mt-4 flex gap-3 rounded-lg border border-[var(--ifr-warning)] bg-[var(--ifr-warning-soft)] p-4"><CircleAlert className="shrink-0 text-[var(--ifr-warning)]" size={22} aria-hidden="true" /><div><h3 className="font-semibold">Check the published procedure</h3><p className="mt-1">A training diagram explains the principle. Use the published procedure for the actual flight.</p></div></div><p className="mt-4 text-sm text-[var(--ifr-text-muted)]">No decorative gradients, simulated cockpit instruments or confetti are needed to make the lesson useful.</p></section>
    <Link href="/" className="workbook-link min-h-11">Back to your workbook <ArrowRight size={18} aria-hidden="true" /></Link>
  </div>;
}
