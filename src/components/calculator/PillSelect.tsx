import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface PillSelectProps {
  id: string;
  label: string;
  icon: ReactNode;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function PillSelect({ id, label, icon, value, options, onChange }: PillSelectProps) {
  return (
    <div className="group relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-graphite-muted">
        {icon}
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-[9.5rem] truncate appearance-none rounded-pill border border-border bg-white py-2.5 pl-10 pr-9 text-[15px] font-medium text-graphite transition-colors duration-140 hover:bg-mist focus:border-pine-700 sm:w-44"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-graphite-muted transition-transform duration-180 group-focus-within:rotate-180"
      />
    </div>
  );
}
