import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[820px] px-6 py-8">
      <h1 className="text-3xl font-bold text-[var(--ifr-text)]">About IFR Refresher</h1>
      <p className="mt-4 text-[var(--ifr-text-muted)]">
        IFR Refresher is a private study aid for refreshing instrument-flight knowledge. It is designed for quick study, flashcards, and quiz practice, including offline use after first load.
      </p>

      <section className="mt-8 rounded-xl border border-[var(--ifr-warning)]/40 bg-[var(--ifr-warning)]/10 p-5">
        <h2 className="text-lg font-semibold text-[var(--ifr-warning)]">Operational disclaimer</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ifr-text)]">
          This app is not legal, operational, or company-approved flight guidance. Always verify requirements against current CASA, AIP, ERSA, aircraft flight manual, operator procedures, current charts, NOTAMs, and ATC instructions before flight.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ifr-text-muted)]">
          Offline content may be stale. Treat it as memory-refresh support only.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-5">
          <h2 className="font-semibold text-[var(--ifr-text)]">Current content status</h2>
          <p className="mt-2 text-sm text-[var(--ifr-text-muted)]">
            Structural content checks are automated, but aviation source verification is still a human review task before public or external pilot use.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-5">
          <h2 className="font-semibold text-[var(--ifr-text)]">Offline/PWA status</h2>
          <p className="mt-2 text-sm text-[var(--ifr-text-muted)]">
            The app is intended to keep study routes available offline after first load. Progress is local-only browser data.
          </p>
        </div>
      </section>

      <Link href="/study" className="mt-8 inline-flex rounded-xl bg-[var(--ifr-accent)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--ifr-accent)]/90">
        Back to study
      </Link>
    </div>
  );
}
