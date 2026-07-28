"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ProductImage } from "@/components/media/ProductImage";

interface Props {
  name: string;
  imageKeys: string[];
}

export function Gallery({ name, imageKeys }: Props) {
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={imageKeys[selected]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <ProductImage
              imageKey={imageKeys[selected]}
              alt={`${name} — photo ${selected + 1}`}
              sizes="(min-width: 1024px) 560px, 100vw"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-3">
        {imageKeys.map((key, i) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelected(i)}
            aria-label={`Show photo ${i + 1}`}
            aria-current={i === selected ? "true" : undefined}
            className={`relative aspect-square overflow-hidden rounded-xl transition-all ${
              i === selected
                ? "ring-2 ring-ink ring-offset-2 ring-offset-ivory"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <ProductImage imageKey={key} alt="" sizes="120px" />
          </button>
        ))}
      </div>
    </div>
  );
}
