import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-5xl tracking-tight">Nothing here</h1>
      <p className="text-ink-soft">That page must have dozed off.</p>
      <Link
        href="/"
        className="mt-2 rounded-full border border-ink/15 px-6 py-2.5 text-sm transition-colors hover:bg-ink hover:text-ivory"
      >
        Browse the collection
      </Link>
    </main>
  );
}
