import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SaveSemesterButton } from "./SaveSemesterButton";

const TOOL_LINKS = [
  { label: "Weighted GPA", href: "/weighted-gpa-calculator" },
  { label: "Cumulative GPA", href: "/cumulative-gpa-calculator" },
  { label: "High School GPA", href: "/high-school-gpa-calculator" },
  { label: "University Calculators", href: "/university-calculators" },
];

const NAV_LINKS = [
  { label: "Predictor", href: "/gpa-predictor" },
  { label: "Universities", href: "/university-calculators" },
  { label: "Resources", href: "/resources" },
];

interface SiteHeaderProps {
  onSave: () => void;
  currentPath?: string;
}

function navLinkClass(isActive: boolean): string {
  return `relative rounded-pill px-3 py-2 text-sm font-medium transition-colors duration-140 hover:bg-mist ${
    isActive ? "text-pine-900 after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-pine-900" : "text-graphite"
  }`;
}

export function SiteHeader({ onSave, currentPath = "" }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toolsActive = TOOL_LINKS.some((link) => link.href === currentPath);

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-white/95 backdrop-blur transition-all duration-180 ${
        isScrolled
          ? "border-border py-2.5 shadow-[var(--shadow-header-scrolled)]"
          : "border-transparent py-4 shadow-[var(--shadow-header)]"
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <a href="/" className="site-logo">
          <img src="/logo.png" alt="GPA Estimate" width={2040} height={497} />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          <details className="group relative">
            <summary
              className={`flex cursor-pointer list-none items-center gap-1 marker:content-[''] [&::-webkit-details-marker]:hidden ${navLinkClass(toolsActive)}`}
            >
              GPA Tools
              <ChevronDown
                size={14}
                aria-hidden="true"
                className="transition-transform duration-180 group-open:rotate-180"
              />
            </summary>
            <ul className="absolute left-0 top-full z-10 mt-1 w-56 rounded-card border border-border bg-white p-1.5 shadow-panel">
              {TOOL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`block rounded-control px-3 py-2 text-sm transition-colors duration-140 hover:bg-mist ${
                      link.href === currentPath ? "font-semibold text-pine-900" : "text-graphite"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>

          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={link.href === currentPath ? "page" : undefined}
              className={navLinkClass(link.href === currentPath)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/how-gpa-works"
            aria-current={currentPath === "/how-gpa-works" ? "page" : undefined}
            className="hidden text-sm font-medium text-graphite transition-colors duration-140 hover:text-pine-800 md:inline"
          >
            How GPA works
          </a>
          <SaveSemesterButton onSave={onSave} />
        </div>
      </div>
    </header>
  );
}
