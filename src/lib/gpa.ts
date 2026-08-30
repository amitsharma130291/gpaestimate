import { GRADING_SCALES, gradePoints, type GradingScale, type ScaleKey } from "./gradingScales";

export interface Course {
  id: string;
  name: string;
  grade: string;
  /** Raw string so the input can hold intermediate/invalid states while typing. */
  credits: string;
}

export interface CourseResult {
  id: string;
  qualityPoints: number | null;
  /** True when this row has enough data to contribute to the GPA total. */
  isCounted: boolean;
  error: string | null;
}

export interface GpaResult {
  gpa: number;
  totalCredits: number;
  totalQualityPoints: number;
  rows: CourseResult[];
}

export function createCourse(name: string, grade: string, credits: string): Course {
  return { id: crypto.randomUUID(), name, grade, credits };
}

/** Parses a credits field, returning null for empty/invalid/non-positive values. */
export function parseCredits(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

export function creditsError(raw: string): string | null {
  if (raw.trim() === "") return "Enter credits";
  const value = Number(raw);
  if (!Number.isFinite(value)) return "Credits must be a number";
  if (value < 0) return "Credits can't be negative";
  if (value > 12) return "That's a lot of credits for one course — double-check";
  return null;
}

export function calculateGpa(courses: Course[], scale: GradingScale): GpaResult {
  let totalCredits = 0;
  let totalQualityPoints = 0;

  const rows = courses.map((course): CourseResult => {
    const credits = parseCredits(course.credits);
    const points = gradePoints(scale, course.grade);

    if (credits === null || points === null || credits === 0) {
      return {
        id: course.id,
        qualityPoints: credits !== null && points !== null ? credits * points : null,
        isCounted: false,
        error: credits === null ? creditsError(course.credits) : null,
      };
    }

    const qualityPoints = credits * points;
    totalCredits += credits;
    totalQualityPoints += qualityPoints;

    return { id: course.id, qualityPoints, isCounted: true, error: null };
  });

  const gpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;

  return {
    gpa: roundTo(gpa, 2),
    totalCredits: roundTo(totalCredits, 2),
    totalQualityPoints: roundTo(totalQualityPoints, 2),
    rows,
  };
}

export function calculateGpaForScale(courses: Course[], scaleKey: ScaleKey): GpaResult {
  return calculateGpa(courses, GRADING_SCALES[scaleKey]);
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** Picks the next meaningful GPA milestone above the current GPA, for the predictor banner. */
export function nextMilestone(gpa: number): number | null {
  const milestones = [4.0, 3.9, 3.8, 3.7, 3.5, 3.3, 3.0, 2.5];
  const candidate = milestones
    .filter((m) => m > gpa)
    .sort((a, b) => a - b)[0];
  return candidate ?? null;
}

/**
 * GPA needed across `remainingCredits` future credits to reach `targetGpa`,
 * given credits/quality points already earned.
 */
export function neededGpaForTarget(
  currentCredits: number,
  currentQualityPoints: number,
  targetGpa: number,
  remainingCredits: number
): number | null {
  if (remainingCredits <= 0) return null;
  const needed =
    (targetGpa * (currentCredits + remainingCredits) - currentQualityPoints) / remainingCredits;
  return roundTo(needed, 2);
}
