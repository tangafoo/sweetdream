"use client";

import { useRef, useState } from "react";
import { processImageFile, type ProcessedImage } from "@/lib/client-image";
import { MAX_REVIEW_IMAGES } from "@/lib/validation";

interface Props {
  images: ProcessedImage[];
  onChange: (images: ProcessedImage[]) => void;
  disabled?: boolean;
}

export function ImageDropzone({ images, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropError, setDropError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const room = MAX_REVIEW_IMAGES - images.length;
    const picked = Array.from(fileList).slice(0, room);
    const processed = (await Promise.all(picked.map(processImageFile))).filter(
      (img): img is ProcessedImage => img !== null,
    );
    const dropped = picked.length - processed.length;
    setDropError(
      dropped > 0
        ? `Couldn't read ${dropped === 1 ? "that photo" : `${dropped} of those photos`} — try a JPEG or PNG under 5 MB.`
        : null,
    );
    if (processed.length > 0) onChange([...images, ...processed]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(id: string) {
    const img = images.find((i) => i.id === id);
    if (img) URL.revokeObjectURL(img.previewUrl);
    onChange(images.filter((i) => i.id !== id));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={img.id} className="relative h-20 w-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.previewUrl}
              alt={`Photo ${i + 1}`}
              className="h-full w-full rounded-lg object-cover"
            />
            <button
              type="button"
              aria-label={`Remove photo ${i + 1}`}
              disabled={disabled}
              onClick={() => remove(img.id)}
              className="absolute -right-1.5 -top-1.5 rounded-full bg-ink p-1 text-ivory transition-transform hover:scale-110"
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}

        {images.length < MAX_REVIEW_IMAGES && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink/25 text-ink-soft transition-colors hover:border-ink/50 hover:text-ink disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            <span className="text-[10px]">Photo</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {dropError && (
        <p role="alert" className="mt-2 text-xs text-clay-deep">
          {dropError}
        </p>
      )}
      <p className="mt-2 text-xs text-ink-soft">
        Up to {MAX_REVIEW_IMAGES} photos. They're resized before upload.
      </p>
    </div>
  );
}
