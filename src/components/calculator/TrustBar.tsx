import { CheckCircle2 } from "lucide-react";

const STATEMENTS = [
  "No account needed",
  "Calculations stay on your device",
  "Built for every grading scale",
];

export function TrustBar() {
  return (
    <ul className="flex flex-col flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-graphite-muted sm:flex-row">
      {STATEMENTS.map((statement) => (
        <li key={statement} className="flex items-center gap-2">
          <CheckCircle2 size={16} aria-hidden="true" className="text-pine-800" />
          {statement}
        </li>
      ))}
    </ul>
  );
}
