"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { imageUrl } from "@/lib/images";

export function ReviewImageStrip({ imageKeys }: { imageKeys: string[] }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const urls = imageKeys
    .map((key) => imageUrl(key))
    .filter((u): u is string => u !== null);
  if (urls.length === 0) return null;

  return (
    <>
      <div className="mt-3 flex gap-2">
        {urls.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`View review photo ${i + 1}`}
            className="relative h-20 w-20 overflow-hidden rounded-lg bg-sand transition-opacity hover:opacity-85"
          >
            <Image src={url} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Review photo"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urls[open]}
            alt={`Review photo ${open + 1}`}
            className="max-h-full max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(null)}
            className="absolute right-5 top-5 rounded-full bg-ivory/15 p-2.5 text-ivory transition-colors hover:bg-ivory/30"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
