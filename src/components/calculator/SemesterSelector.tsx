import { Calendar } from "lucide-react";
import { PillSelect } from "./PillSelect";

const SEMESTER_OPTIONS = [
  "Fall 2026",
  "Spring 2026",
  "Fall 2025",
  "Spring 2025",
  "Fall 2024",
].map((s) => ({ value: s, label: s }));

interface SemesterSelectorProps {
  semester: string;
  onChange: (semester: string) => void;
}

export function SemesterSelector({ semester, onChange }: SemesterSelectorProps) {
  const options = SEMESTER_OPTIONS.some((o) => o.value === semester)
    ? SEMESTER_OPTIONS
    : [{ value: semester, label: semester }, ...SEMESTER_OPTIONS];

  return (
    <PillSelect
      id="semester-selector"
      label="Semester"
      icon={<Calendar size={16} aria-hidden="true" />}
      value={semester}
      options={options}
      onChange={onChange}
    />
  );
}
