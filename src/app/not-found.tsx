import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-5xl">🗺️</span>
      <h1 className="text-xl font-bold text-[var(--ifr-text)]">Page not found</h1>
      <p className="max-w-sm text-sm text-[var(--ifr-text-muted)]">
        This route doesn&apos;t exist. Check your bearing and try again.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-[var(--ifr-accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
      >
        Back to study
      </Link>
    </div>
  );
}
