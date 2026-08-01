import Image from "next/image";
import Link from "next/link";
import { imageUrl } from "@/lib/images";

/**
 * Brand wordmark — "SweetDream, take a rest" with the shooting-star swoosh,
 * served from the R2 bucket like every other image. Renders both colorways;
 * globals.css shows the white artwork whenever the carousel flags the body
 * with `data-stage-dark` (a full-bleed hero photo holding the stage) and the
 * ink artwork otherwise. Falls back to a text wordmark when no bucket is
 * configured. Everything routes through this one component.
 */
export function Logo({ className = "" }: { className?: string }) {
  const light = imageUrl("sd-logo.webp");
  const dark = imageUrl("sd-logo-darktheme.webp");

  return (
    <Link
      href="/"
      aria-label="SweetDream — home"
      className={`inline-flex items-center transition-opacity hover:opacity-80 ${className}`}
    >
      {light && dark ? (
        <>
          <Image
            src={light}
            alt="SweetDream — Take a rest"
            width={700}
            height={252}
            priority
            className="logo-light h-11 w-auto md:h-12"
          />
          <Image
            src={dark}
            alt="SweetDream — Take a rest"
            width={700}
            height={264}
            priority
            className="logo-dark h-11 w-auto md:h-12"
          />
        </>
      ) : (
        <span className="font-display text-xl tracking-tight">sweetdream</span>
      )}
    </Link>
  );
}
