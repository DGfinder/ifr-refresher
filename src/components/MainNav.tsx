"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Layers, Brain, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/study", label: "Study", Icon: BookOpen },
  { href: "/flashcard", label: "Cards", Icon: Layers },
  { href: "/quiz", label: "Quiz", Icon: Brain },
  { href: "/insights", label: "Insights", Icon: BarChart2 },
];

export function MainNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--ifr-border)] bg-[var(--ifr-surface)] md:static md:border-b md:border-t-0">
      <div className="mx-auto flex max-w-[1100px] items-center justify-around px-2 md:justify-start md:gap-1 md:px-6">
        {navItems.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 text-center transition-colors md:flex-none md:flex-row md:gap-2 md:px-3 md:py-3",
                active
                  ? "bg-[var(--ifr-accent)]/10 text-[var(--ifr-accent)]"
                  : "text-[var(--ifr-text-muted)] hover:bg-[var(--ifr-surface-muted)] hover:text-[var(--ifr-text)]"
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[11px] font-medium md:text-sm">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
