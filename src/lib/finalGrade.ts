import { roundTo } from "./gpa";

export interface FinalGradeInput {
  currentGrade: number;
  desiredGrade: number;
  examWeightPercent: number;
}

/**
 * Score needed on the final exam to reach a desired overall grade, given the
 * grade held before the final and the final's weight in the overall grade.
 * `F = (desired − current × (1 − w)) ÷ w`, where w is the exam's weight as a fraction.
 */
export function neededFinalExamScore({
  currentGrade,
  desiredGrade,
  examWeightPercent,
}: FinalGradeInput): number | null {
  if (![currentGrade, desiredGrade, examWeightPercent].every(Number.isFinite)) return null;
  const weight = examWeightPercent / 100;
  if (weight <= 0 || weight > 1) return null;
  const needed = (desiredGrade - currentGrade * (1 - weight)) / weight;
  return roundTo(needed, 2);
}

export function percentFieldError(raw: string, label: string): string | null {
  if (raw.trim() === "") return `Enter ${label}`;
  const value = Number(raw);
  if (!Number.isFinite(value)) return `${label} must be a number`;
  if (value < 0) return `${label} can't be negative`;
  if (value > 100) return `${label} can't exceed 100`;
  return null;
}

export function weightFieldError(raw: string): string | null {
  if (raw.trim() === "") return "Enter the final's weight";
  const value = Number(raw);
  if (!Number.isFinite(value)) return "Weight must be a number";
  if (value <= 0) return "Weight must be greater than 0";
  if (value > 100) return "Weight can't exceed 100";
  return null;
}
