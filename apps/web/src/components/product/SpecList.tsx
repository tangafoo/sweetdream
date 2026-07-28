interface Props {
  firmness: number; // 1–10
  heightInches: number;
  features: string[];
}

export function SpecList({ firmness, heightInches, features }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-ink-soft">Firmness</span>
          <span className="tabular-nums">{firmness}/10</span>
        </div>
        <div className="mt-2 flex gap-1" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < firmness ? "bg-clay" : "bg-line"}`}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-ink-soft">
          <span>Plush</span>
          <span>Firm</span>
        </div>
      </div>

      <p className="text-sm">
        <span className="text-ink-soft">Profile height</span>{" "}
        <span className="ml-2 tabular-nums">{heightInches}&Prime;</span>
      </p>

      <ul className="space-y-2.5 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-[0.55em] h-px w-4 shrink-0 bg-clay" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
