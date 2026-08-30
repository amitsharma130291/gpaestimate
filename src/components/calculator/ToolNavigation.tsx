import { BarChart3, PieChart, GraduationCap, Landmark, ArrowRight } from "lucide-react";

const TOOLS = [
  {
    label: "Weighted GPA",
    href: "/weighted-gpa-calculator",
    icon: BarChart3,
    description: "Factor in AP, IB, and honors credit.",
  },
  {
    label: "Cumulative GPA",
    href: "/cumulative-gpa-calculator",
    icon: PieChart,
    description: "Combine every saved semester.",
  },
  {
    label: "High School GPA",
    href: "/high-school-gpa-calculator",
    icon: GraduationCap,
    description: "Built for high-school scales.",
  },
  {
    label: "University Calculators",
    href: "/university-calculators",
    icon: Landmark,
    description: "Match your school's exact scale.",
  },
];

export function ToolNavigation() {
  return (
    <nav aria-label="Other GPA tools" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {TOOLS.map(({ label, href, icon: Icon, description }) => (
        <a
          key={href}
          href={href}
          className="group flex flex-col gap-2 rounded-card border border-border bg-white px-4 py-3.5 text-sm font-medium text-graphite transition-colors duration-140 hover:border-border-strong hover:bg-mist"
        >
          <span className="flex items-center justify-between">
            <Icon size={18} aria-hidden="true" className="shrink-0 text-pine-800" />
            <ArrowRight
              size={15}
              aria-hidden="true"
              className="shrink-0 text-graphite-soft transition-transform duration-160 group-hover:translate-x-1 group-hover:text-pine-800"
            />
          </span>
          <span>
            <span className="block">{label}</span>
            <span className="mt-0.5 hidden text-xs font-normal text-graphite-muted sm:block">
              {description}
            </span>
          </span>
        </a>
      ))}
    </nav>
  );
}
