import Link from "next/link";

export function ContentDisclaimer() {
  return (
    <aside aria-label="Aviation content disclaimer" className="mx-auto mt-8 max-w-[1100px] px-6 pb-6 text-xs leading-relaxed text-[var(--ifr-text-muted)]">
      <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] px-4 py-3">
        <strong className="text-[var(--ifr-text)]">Study aid only.</strong>{" "}
        Verify requirements against current CASA, AIP, ERSA, aircraft manuals, operator procedures, and charts before flight. Offline content may be stale.
        <Link href="/about" className="ml-1 text-[var(--ifr-accent)] hover:underline">
          Content notes
        </Link>
      </div>
    </aside>
  );
}
