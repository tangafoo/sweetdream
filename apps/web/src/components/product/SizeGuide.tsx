import { formatPrice } from "@/lib/format";
import { DIM_PLACEHOLDER, SIZE_DIMENSIONS } from "@/lib/size-guide";
import type { SizePricing } from "@sd/db/types";

export function SizeGuide({ sizes }: { sizes: SizePricing }) {
  const rows = sizes.map((size) => ({
    ...size,
    dims: SIZE_DIMENSIONS[size.label] ?? { width: null, length: null },
  }));
  const incomplete = rows.some((r) => !r.dims.width || !r.dims.length);

  return (
    <div className="overflow-x-auto">
      <table className="w-full max-w-2xl border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-ink-soft">
            <th scope="col" className="py-3 pr-4 font-normal">Size</th>
            <th scope="col" className="py-3 pr-4 font-normal">Width</th>
            <th scope="col" className="py-3 pr-4 font-normal">Length</th>
            <th scope="col" className="py-3 text-right font-normal">Price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-line/60 last:border-b-0">
              <th scope="row" className="py-3.5 pr-4 text-left font-medium">
                {row.label}
              </th>
              <td className="py-3.5 pr-4 tabular-nums text-ink/85">
                {row.dims.width ?? DIM_PLACEHOLDER}
              </td>
              <td className="py-3.5 pr-4 tabular-nums text-ink/85">
                {row.dims.length ?? DIM_PLACEHOLDER}
              </td>
              <td className="py-3.5 text-right tabular-nums">
                {formatPrice(row.priceCents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {incomplete && (
        <p className="mt-3 text-xs text-ink-soft">Exact measurements coming soon.</p>
      )}
    </div>
  );
}
