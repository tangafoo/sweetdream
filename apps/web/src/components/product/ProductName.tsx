import { splitProductName } from "@/lib/format";

/**
 * Product name with its trailing height token ("16″", "40cm") typeset as a
 * lighter, smaller span — inherits the parent's font and scales with its
 * size, so it works from the carousel's text-6xl down to a neighbor card.
 */
export function ProductName({ name }: { name: string }) {
  const { base, size } = splitProductName(name);
  if (!size) return <>{name}</>;
  return (
    <>
      {base}{" "}
      <span className="text-[0.62em] font-light opacity-60">{size}</span>
    </>
  );
}
