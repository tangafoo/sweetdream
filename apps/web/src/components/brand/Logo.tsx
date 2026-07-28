import Link from "next/link";

/**
 * PLACEHOLDER LOGO — swap the SVG mark + wordmark for the real brand asset.
 * Everything routes through this one component.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="sweetdream — home"
      className={`group inline-flex items-center gap-2.5 text-ink ${className}`}
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-7 w-7 transition-transform duration-500 group-hover:-rotate-12"
      >
        <path
          d="M21.5 4.5a12 12 0 1 0 6 16.5A10 10 0 1 1 21.5 4.5Z"
          fill="currentColor"
        />
      </svg>
      <span className="font-display text-xl tracking-tight">sweetdream</span>
    </Link>
  );
}
