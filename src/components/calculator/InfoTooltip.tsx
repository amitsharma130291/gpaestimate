import { useId, useState, type ReactNode } from "react";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  label: string;
  children: ReactNode;
  tone?: "dark" | "light";
}

export function InfoTooltip({ label, children, tone = "light" }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  const iconClass =
    tone === "dark"
      ? "text-cream-muted hover:text-cream focus-visible:text-cream"
      : "text-graphite-soft hover:text-graphite focus-visible:text-graphite";
  const bubbleClass = tone === "dark" ? "bg-pine-800 text-cream" : "bg-graphite text-white";

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={id}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors duration-140 ${iconClass}`}
      >
        <Info size={14} aria-hidden="true" />
      </button>
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-control px-3 py-2 text-left text-xs font-normal leading-snug shadow-panel transition-opacity duration-140 ${bubbleClass} ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </span>
    </span>
  );
}
