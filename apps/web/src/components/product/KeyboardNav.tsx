"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Props {
  prevSlug: string | null;
  nextSlug: string | null;
}

/**
 * Page-level arrow keys for the product page, mirroring the landing carousel:
 * ←/→ move to the previous/next mattress, ↓/↑ step between the page's
 * sections (overview → sizes & measurements → reviews). Renders nothing.
 */
export function KeyboardNav({ prevSlug, nextSlug }: Props) {
  const router = useRouter();

  useEffect(() => {
    // Section anchors in page order; 0 represents the top (overview).
    // Offset matches the sections' scroll-mt-24 (6rem).
    const sectionTops = () => [
      0,
      ...["sizes", "reviews"].flatMap((id) => {
        const el = document.getElementById(id);
        return el ? [el.getBoundingClientRect().top + window.scrollY - 96] : [];
      }),
    ];

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if ((e.target as HTMLElement | null)?.closest("button, a, input, textarea, select")) {
        return; // don't fight focused interactive elements (e.g. the review form)
      }
      if (e.key === "ArrowLeft" && prevSlug) {
        e.preventDefault();
        router.push(`/products/${prevSlug}`);
      } else if (e.key === "ArrowRight" && nextSlug) {
        e.preventDefault();
        router.push(`/products/${nextSlug}`);
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const tops = sectionTops();
        const y = window.scrollY;
        // next section below, or previous one above; ↓ past the last section
        // lands on the neighbor nav / footer at the bottom.
        const target =
          e.key === "ArrowDown"
            ? (tops.find((t) => t > y + 4) ?? document.documentElement.scrollHeight)
            : ([...tops].reverse().find((t) => t < y - 4) ?? 0);
        // no behavior option: html's scroll-behavior (smooth, with a
        // prefers-reduced-motion override) decides how we get there
        window.scrollTo({ top: target });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, prevSlug, nextSlug]);

  return null;
}
