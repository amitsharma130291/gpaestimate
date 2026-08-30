import { Plus } from "lucide-react";

interface AddCourseButtonProps {
  onClick: () => void;
  label?: string;
}

export function AddCourseButton({ onClick, label = "Add another course" }: AddCourseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-card border border-dashed border-border-strong px-5 py-2.5 text-[15px] font-medium text-pine-800 transition-colors duration-140 hover:bg-mist active:translate-y-0"
    >
      <Plus size={18} aria-hidden="true" />
      {label}
    </button>
  );
}
