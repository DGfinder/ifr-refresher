"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MainNav() {
  const pathname = usePathname();
  return <nav aria-label="Main navigation" className="baseline-main-nav">
    <div>
      <Link href="/study" aria-current={pathname === "/" || pathname.startsWith("/study") ? "page" : undefined}>Contents</Link>
      <Link href="/design-system" aria-current={pathname === "/design-system" ? "page" : undefined}>Brand concepts</Link>
      <a href="/source/ifr-cheat-sheet-v7-1/original.pdf" target="_blank" rel="noreferrer">Source PDF<span className="sr-only"> (new tab)</span></a>
    </div>
  </nav>;
}
