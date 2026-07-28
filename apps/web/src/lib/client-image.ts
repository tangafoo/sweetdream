import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "./validation";

export interface ProcessedImage {
  id: string;
  blob: Blob;
  contentType: string;
  previewUrl: string;
}

const MAX_EDGE = 1600;

/**
 * Downscale + re-encode a picked file to webp (~200–400 KB) before upload,
 * so review photos stay well under the 5 MB cap and load fast for readers.
 * Falls back to the original file when canvas encoding isn't available.
 */
export async function processImageFile(file: File): Promise<ProcessedImage | null> {
  if (!file.type.startsWith("image/")) return null;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(bitmap, 0, 0, width, height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.82),
      );
      bitmap.close();
      if (blob && blob.size <= MAX_IMAGE_BYTES) {
        return {
          id: crypto.randomUUID(),
          blob,
          contentType: "image/webp",
          previewUrl: URL.createObjectURL(blob),
        };
      }
    }
  } catch {
    // fall through to the original-file path
  }

  if (file.type in ALLOWED_IMAGE_TYPES && file.size <= MAX_IMAGE_BYTES) {
    return {
      id: crypto.randomUUID(),
      blob: file,
      contentType: file.type,
      previewUrl: URL.createObjectURL(file),
    };
  }
  return null;
}
