import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-8 text-sm text-ink-soft">
      <p>© 2026 sweetdream</p>
      <p className="text-ink-soft/70">
        <span title="placeholder — no page yet">Shipping</span> ·{" "}
        <Link href="/warranty" className="transition-colors hover:text-ink">
          Warranty
        </Link>{" "}
        ·{" "}
        <Link href="/contact" className="transition-colors hover:text-ink">
          Contact
        </Link>
      </p>
    </footer>
  );
}
