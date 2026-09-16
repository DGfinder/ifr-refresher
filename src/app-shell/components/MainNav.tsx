"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/study", label: "Contents", match: (path: string) => path === "/" || path.startsWith("/study") },
  { href: "/flashcard", label: "Practice", match: (path: string) => path.startsWith("/flashcard") || path.startsWith("/drill") },
  { href: "/radio", label: "Radio", match: (path: string) => path.startsWith("/radio") },
  { href: "/quiz", label: "Quiz", match: (path: string) => path.startsWith("/quiz") },
  { href: "/insights", label: "Insights", match: (path: string) => path.startsWith("/insights") },
];

export function MainNav() {
  const pathname = usePathname();
  return <nav aria-label="Main navigation" className="baseline-main-nav">
    <div>
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} aria-current={link.match(pathname) ? "page" : undefined}>
          {link.label}
        </Link>
      ))}
      <a href="/source/reference-v7-1/original.pdf" target="_blank" rel="noreferrer">Source PDF<span className="sr-only"> (new tab)</span></a>
    </div>
  </nav>;
}
