import { z } from "zod";

export const MAX_REVIEW_IMAGES = 3;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const presignRequestSchema = z.object({
  files: z
    .array(
      z.object({
        contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
        sizeBytes: z.number().int().positive().max(MAX_IMAGE_BYTES),
      }),
    )
    .min(1)
    .max(MAX_REVIEW_IMAGES),
});

// reviews/incoming/<uuid>/<index>.<ext> — index bounded by MAX_REVIEW_IMAGES
export const INCOMING_KEY_PATTERN =
  /^reviews\/incoming\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/[0-2]\.(webp|jpg|png)$/;

export const reviewSubmissionSchema = z.object({
  productSlug: z.string().min(1).max(120),
  rating: z.number().int().min(1).max(5),
  authorName: z.string().trim().min(1).max(80),
  body: z.string().trim().min(10).max(2000),
  imageKeys: z
    .array(z.string().regex(INCOMING_KEY_PATTERN))
    .max(MAX_REVIEW_IMAGES)
    .default([]),
  turnstileToken: z.string().max(4096).optional(),
});

export type ReviewSubmission = z.infer<typeof reviewSubmissionSchema>;
