"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/study", label: "Study" },
  { href: "/drill", label: "Drill" },
  { href: "/insights", label: "Insights" },
];

export function MainNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--ifr-border)] bg-[var(--ifr-surface)] md:static md:border-b md:border-t-0">
      <div className="mx-auto flex max-w-[1100px] items-center justify-around px-6 md:justify-start md:gap-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 py-3 text-center text-sm font-medium transition-colors md:flex-none md:py-4",
              isActive(item.href)
                ? "text-[var(--ifr-accent)]"
                : "text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
