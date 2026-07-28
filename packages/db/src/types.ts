import { z } from "zod";

export const sizePricingSchema = z.array(
  z.object({
    label: z.string().min(1),
    priceCents: z.number().int().positive(),
  }),
);
export type SizePricing = z.infer<typeof sizePricingSchema>;

export const featuresSchema = z.array(z.string().min(1));
export type Features = z.infer<typeof featuresSchema>;

/** Parse the `sizes` Json column into a typed, validated shape. */
export function parseSizes(value: unknown): SizePricing {
  return sizePricingSchema.parse(value);
}

/** Parse the `features` Json column into a typed, validated shape. */
export function parseFeatures(value: unknown): Features {
  return featuresSchema.parse(value);
}
