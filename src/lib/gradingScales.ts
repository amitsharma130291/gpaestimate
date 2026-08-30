export type ScaleKey = "standard-4" | "standard-4-flat";

export interface GradingScale {
  key: ScaleKey;
  label: string;
  description: string;
  /** Ordered from highest to lowest, for use in <select> options. */
  grades: { grade: string; points: number }[];
}

const STANDARD_4_GRADES: { grade: string; points: number }[] = [
  { grade: "A+", points: 4.0 },
  { grade: "A", points: 4.0 },
  { grade: "A-", points: 3.7 },
  { grade: "B+", points: 3.3 },
  { grade: "B", points: 3.0 },
  { grade: "B-", points: 2.7 },
  { grade: "C+", points: 2.3 },
  { grade: "C", points: 2.0 },
  { grade: "C-", points: 1.7 },
  { grade: "D+", points: 1.3 },
  { grade: "D", points: 1.0 },
  { grade: "F", points: 0 },
];

const STANDARD_4_FLAT_GRADES: { grade: string; points: number }[] = [
  { grade: "A", points: 4.0 },
  { grade: "B", points: 3.0 },
  { grade: "C", points: 2.0 },
  { grade: "D", points: 1.0 },
  { grade: "F", points: 0 },
];

export const GRADING_SCALES: Record<ScaleKey, GradingScale> = {
  "standard-4": {
    key: "standard-4",
    label: "Standard 4.0",
    description: "Plus/minus scale used by most U.S. colleges.",
    grades: STANDARD_4_GRADES,
  },
  "standard-4-flat": {
    key: "standard-4-flat",
    label: "Standard 4.0 (whole letter)",
    description: "Whole-letter scale with no plus/minus grades.",
    grades: STANDARD_4_FLAT_GRADES,
  },
};

export const DEFAULT_SCALE_KEY: ScaleKey = "standard-4";

export function isScaleKey(value: string): value is ScaleKey {
  return value in GRADING_SCALES;
}

export function gradePoints(scale: GradingScale, grade: string): number | null {
  const entry = scale.grades.find((g) => g.grade === grade);
  return entry ? entry.points : null;
}

export type CourseLevel = "regular" | "honors" | "ap-ib";

export interface CourseLevelOption {
  key: CourseLevel;
  label: string;
  /** Added to the base grade point value for a passing grade; a common convention is that failing grades don't earn the weighting bonus. */
  bonus: number;
}

export const COURSE_LEVELS: CourseLevelOption[] = [
  { key: "regular", label: "Regular", bonus: 0 },
  { key: "honors", label: "Honors", bonus: 0.5 },
  { key: "ap-ib", label: "AP / IB / Dual Enrollment", bonus: 1.0 },
];

export const DEFAULT_COURSE_LEVEL: CourseLevel = "regular";

export function isCourseLevel(value: string): value is CourseLevel {
  return COURSE_LEVELS.some((l) => l.key === value);
}

export function courseLevelBonus(level: CourseLevel): number {
  return COURSE_LEVELS.find((l) => l.key === level)?.bonus ?? 0;
}
