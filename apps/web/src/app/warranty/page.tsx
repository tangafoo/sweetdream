import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/brand/Footer";

export const metadata: Metadata = {
  title: "Warranty request",
  description: "Submit a warranty request for your sweetdream mattress.",
};

// TODO: replace the placeholder email/terms below with the real ones.
const WARRANTY_EMAIL = "warranty@sweetdream.example";

export default function WarrantyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-24 md:pt-28">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span> All mattresses
      </Link>

      <h1 className="mt-6 font-display text-4xl tracking-tight md:text-5xl">
        Warranty request
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft">
        Every sweetdream mattress is covered against manufacturing defects.
        If something isn&apos;t right, we&apos;ll make it right.
      </p>

      <ol className="mt-10 space-y-6 border-t border-line pt-8">
        {[
          ["Find your order details", "Your order number or receipt, and roughly when the mattress was delivered."],
          ["Take a few photos", "A wide shot of the mattress and close-ups of the issue — sagging, seams, zippers."],
          ["Send them to us", "Email the details and photos to the address below. We reply within 2 working days."],
        ].map(([title, body], i) => (
          <li key={title} className="flex gap-5">
            <span className="font-display text-2xl text-clay">{i + 1}</span>
            <div>
              <h2 className="font-display text-xl tracking-tight">{title}</h2>
              <p className="mt-1 leading-relaxed text-ink-soft">{body}</p>
            </div>
          </li>
        ))}
      </ol>

      <a
        href={`mailto:${WARRANTY_EMAIL}?subject=Warranty%20request`}
        className="mt-10 inline-block rounded-full bg-ink px-8 py-3.5 text-sm text-ivory transition-opacity hover:opacity-90"
      >
        Email a warranty request
      </a>
      <p className="mt-3 text-sm text-ink-soft">{WARRANTY_EMAIL}</p>

      <Footer />
    </main>
  );
}
