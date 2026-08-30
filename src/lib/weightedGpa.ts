import { creditsError, parseCredits, roundTo } from "./gpa";
import {
  GRADING_SCALES,
  courseLevelBonus,
  gradePoints,
  type CourseLevel,
} from "./gradingScales";

const SCALE = GRADING_SCALES["standard-4"];

export interface WeightedCourse {
  id: string;
  name: string;
  grade: string;
  credits: string;
  level: CourseLevel;
}

export function createWeightedCourse(
  name: string,
  grade: string,
  credits: string,
  level: CourseLevel
): WeightedCourse {
  return { id: crypto.randomUUID(), name, grade, credits, level };
}

export interface WeightedCourseResult {
  id: string;
  weightedPoints: number | null;
  unweightedPoints: number | null;
  isCounted: boolean;
  error: string | null;
}

export interface WeightedGpaResult {
  weightedGpa: number;
  unweightedGpa: number;
  totalCredits: number;
  totalWeightedPoints: number;
  totalUnweightedPoints: number;
  rows: WeightedCourseResult[];
}

export function calculateWeightedGpa(courses: WeightedCourse[]): WeightedGpaResult {
  let totalCredits = 0;
  let totalWeighted = 0;
  let totalUnweighted = 0;

  const rows = courses.map((course): WeightedCourseResult => {
    const credits = parseCredits(course.credits);
    const basePoints = gradePoints(SCALE, course.grade);

    if (credits === null || basePoints === null || credits === 0) {
      return {
        id: course.id,
        weightedPoints: credits !== null && basePoints !== null ? credits * basePoints : null,
        unweightedPoints: credits !== null && basePoints !== null ? credits * basePoints : null,
        isCounted: false,
        error: credits === null ? creditsError(course.credits) : null,
      };
    }

    const bonus = courseLevelBonus(course.level);
    const weightedPointValue = basePoints > 0 ? basePoints + bonus : basePoints;
    const weightedPoints = weightedPointValue * credits;
    const unweightedPoints = basePoints * credits;

    totalCredits += credits;
    totalWeighted += weightedPoints;
    totalUnweighted += unweightedPoints;

    return { id: course.id, weightedPoints, unweightedPoints, isCounted: true, error: null };
  });

  return {
    weightedGpa: roundTo(totalCredits > 0 ? totalWeighted / totalCredits : 0, 2),
    unweightedGpa: roundTo(totalCredits > 0 ? totalUnweighted / totalCredits : 0, 2),
    totalCredits: roundTo(totalCredits, 2),
    totalWeightedPoints: roundTo(totalWeighted, 2),
    totalUnweightedPoints: roundTo(totalUnweighted, 2),
    rows,
  };
}
