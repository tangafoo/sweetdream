import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/brand/Footer";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with sweetdream — showroom, phone, and email.",
};

// TODO: replace every placeholder below with the real details.
const CONTACT = {
  email: "hello@sweetdream.example",
  phone: "+60 12-345 6789",
  whatsapp: "+60 12-345 6789",
  address: "123 Placeholder Street, 50000 Kuala Lumpur",
  hours: "Mon–Sun, 10am–7pm",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-24 md:pt-28">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span> All mattresses
      </Link>

      <h1 className="mt-6 font-display text-4xl tracking-tight md:text-5xl">
        Contact us
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft">
        Questions about a mattress, a size, or an order — we&apos;re easy to reach.
      </p>

      <dl className="mt-10 space-y-6 border-t border-line pt-8">
        {[
          ["Email", <a key="e" href={`mailto:${CONTACT.email}`} className="underline decoration-line underline-offset-4 transition-colors hover:text-clay">{CONTACT.email}</a>],
          ["Phone", CONTACT.phone],
          ["WhatsApp", CONTACT.whatsapp],
          ["Showroom", CONTACT.address],
          ["Hours", CONTACT.hours],
        ].map(([label, value]) => (
          <div key={label as string} className="flex flex-col gap-1 sm:flex-row sm:gap-8">
            <dt className="w-28 shrink-0 text-sm uppercase tracking-widest text-ink-soft">
              {label}
            </dt>
            <dd className="text-lg">{value}</dd>
          </div>
        ))}
      </dl>

      <Footer />
    </main>
  );
}
