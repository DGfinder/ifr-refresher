"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { House, BookOpen, Layers, ClipboardCheck, Radio, ChartNoAxesColumn, ScanLine, Ellipsis, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

const items = [
  { href: "/", label: "Home", Icon: House },
  { href: "/study", label: "Study", Icon: BookOpen },
  { href: "/principles", label: "Visuals", Icon: ScanLine },
  { href: "/quiz", label: "Quiz", Icon: ClipboardCheck },
  { href: "/flashcard", label: "Cards", Icon: Layers },
  { href: "/radio", label: "Radio", Icon: Radio },
  { href: "/insights", label: "Insights", Icon: ChartNoAxesColumn },
];

export function MainNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <nav onKeyDown={(event) => { if (event.key === "Escape") { setMoreOpen(false); document.getElementById("more-navigation-toggle")?.focus(); } }} aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--ifr-border)] bg-[var(--ifr-surface)] pb-[env(safe-area-inset-bottom)] md:static md:border-b md:border-t-0 md:pb-0">
      {moreOpen && (
        <div id="more-navigation" className="absolute inset-x-3 bottom-full mb-2 rounded-2xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-2 shadow-lg md:hidden">
          {items.slice(4).map(({ href, label, Icon }) => (
            <Link key={href} href={href} onClick={() => setMoreOpen(false)} aria-current={active(href) ? "page" : undefined} className="flex min-h-12 items-center gap-3 rounded-lg px-4 hover:bg-[var(--ifr-surface-muted)]"><Icon size={20} aria-hidden="true" />{label}</Link>
          ))}
        </div>
      )}
      <div className="mx-auto flex max-w-[1100px] items-center justify-around px-2 md:justify-start md:gap-1 md:px-8">
        {items.map(({ href, label, Icon }, index) => (
          <Link key={href} href={href} onClick={() => setMoreOpen(false)} aria-current={active(href) ? "page" : undefined}
            className={cn("flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 border-t-2 px-1 py-2 text-center md:min-h-12 md:flex-none md:flex-row md:gap-2 md:border-t-0 md:px-4", index >= 4 && "hidden md:flex", active(href) ? "border-[var(--ifr-accent)] text-[var(--ifr-accent)] md:bg-[var(--ifr-accent-soft)]" : "border-transparent text-[var(--ifr-text-muted)] hover:bg-[var(--ifr-surface-muted)]")}>
            <Icon size={20} strokeWidth={1.8} aria-hidden="true" /><span className="text-xs font-semibold md:text-base">{label}</span>
          </Link>
        ))}
        <button id="more-navigation-toggle" type="button" aria-expanded={moreOpen} aria-controls="more-navigation" onClick={() => setMoreOpen(!moreOpen)} className={cn("flex min-h-16 flex-1 flex-col items-center justify-center gap-1 border-t-2 text-xs font-semibold md:hidden", moreOpen || items.slice(4).some((item) => active(item.href)) ? "border-[var(--ifr-accent)] text-[var(--ifr-accent)]" : "border-transparent text-[var(--ifr-text-muted)]")}>
          {moreOpen ? <X size={20} aria-hidden="true" /> : <Ellipsis size={20} aria-hidden="true" />}More
        </button>
      </div>
    </nav>
  );
}
