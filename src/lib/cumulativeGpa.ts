import { roundTo } from "./gpa";

export interface SemesterEntry {
  id: string;
  label: string;
  credits: string;
  gpa: string;
}

export interface SemesterResult {
  id: string;
  qualityPoints: number | null;
  isCounted: boolean;
  error: string | null;
}

export interface CumulativeGpaResult {
  cumulativeGpa: number;
  totalCredits: number;
  totalQualityPoints: number;
  rows: SemesterResult[];
}

export function createSemesterEntry(label: string, credits: string, gpa: string): SemesterEntry {
  return { id: crypto.randomUUID(), label, credits, gpa };
}

function parsePositiveNumber(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function semesterEntryError(entry: SemesterEntry): string | null {
  const credits = parsePositiveNumber(entry.credits);
  const gpa = parsePositiveNumber(entry.gpa);
  if (entry.credits.trim() === "") return "Enter credits";
  if (credits === null) return "Credits must be a positive number";
  if (entry.gpa.trim() === "") return "Enter a GPA";
  if (gpa === null) return "GPA must be a positive number";
  if (gpa > 4.33) return "GPA can't exceed 4.33";
  return null;
}

export function calculateCumulativeGpa(entries: SemesterEntry[]): CumulativeGpaResult {
  let totalCredits = 0;
  let totalQualityPoints = 0;

  const rows = entries.map((entry): SemesterResult => {
    const credits = parsePositiveNumber(entry.credits);
    const gpa = parsePositiveNumber(entry.gpa);
    const error = semesterEntryError(entry);

    if (credits === null || gpa === null || error || credits === 0) {
      return {
        id: entry.id,
        qualityPoints: credits !== null && gpa !== null ? roundTo(credits * gpa, 2) : null,
        isCounted: false,
        error,
      };
    }

    const qualityPoints = credits * gpa;
    totalCredits += credits;
    totalQualityPoints += qualityPoints;

    return { id: entry.id, qualityPoints: roundTo(qualityPoints, 2), isCounted: true, error: null };
  });

  return {
    cumulativeGpa: roundTo(totalCredits > 0 ? totalQualityPoints / totalCredits : 0, 2),
    totalCredits: roundTo(totalCredits, 2),
    totalQualityPoints: roundTo(totalQualityPoints, 2),
    rows,
  };
}
