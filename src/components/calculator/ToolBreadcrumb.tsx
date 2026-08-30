interface ToolBreadcrumbProps {
  current: string;
}

export function ToolBreadcrumb({ current }: ToolBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-10">
      <ol className="flex items-center gap-1.5 text-sm text-graphite-muted">
        <li className="flex items-center gap-1.5">
          <a href="/" className="transition-colors duration-140 hover:text-pine-800">
            GPA Calculator
          </a>
          <span aria-hidden="true" className="text-graphite-soft">
            /
          </span>
        </li>
        <li>
          <span aria-current="page" className="font-medium text-graphite">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}
