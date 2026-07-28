"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-5xl tracking-tight">Something went sideways</h1>
      <p className="text-ink-soft">An unexpected error woke us up. Try again in a moment.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-2 rounded-full border border-ink/15 px-6 py-2.5 text-sm transition-colors hover:bg-ink hover:text-ivory"
      >
        Try again
      </button>
    </main>
  );
}
