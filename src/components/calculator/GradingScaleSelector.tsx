import { Scale } from "lucide-react";
import { GRADING_SCALES, type ScaleKey } from "@/lib/gradingScales";
import { PillSelect } from "./PillSelect";

const OPTIONS = Object.values(GRADING_SCALES).map((scale) => ({
  value: scale.key,
  label: scale.label,
}));

interface GradingScaleSelectorProps {
  scaleKey: ScaleKey;
  onChange: (scaleKey: ScaleKey) => void;
}

export function GradingScaleSelector({ scaleKey, onChange }: GradingScaleSelectorProps) {
  return (
    <PillSelect
      id="grading-scale-selector"
      label="Grading scale"
      icon={<Scale size={16} aria-hidden="true" />}
      value={scaleKey}
      options={OPTIONS}
      onChange={(value) => onChange(value as ScaleKey)}
    />
  );
}
