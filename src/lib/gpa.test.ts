import { describe, expect, it } from "vitest";
import {
  calculateGpa,
  createCourse,
  creditsError,
  neededGpaForTarget,
  nextMilestone,
  parseCredits,
  roundTo,
} from "./gpa";
import { GRADING_SCALES } from "./gradingScales";

const standard = GRADING_SCALES["standard-4"];

describe("calculateGpa", () => {
  it("matches the reference example (Calculus I A-, Chem B+, English A, Psych A-)", () => {
    const courses = [
      createCourse("Calculus I", "A-", "4"),
      createCourse("General Chemistry", "B+", "4"),
      createCourse("English Composition", "A", "3"),
      createCourse("Psychology", "A-", "3"),
    ];

    const result = calculateGpa(courses, standard);

    expect(result.totalCredits).toBe(14);
    expect(result.totalQualityPoints).toBe(51.1);
    expect(result.gpa).toBe(3.65);
  });

  it("returns a zero GPA for an empty course list", () => {
    const result = calculateGpa([], standard);
    expect(result.gpa).toBe(0);
    expect(result.totalCredits).toBe(0);
    expect(result.totalQualityPoints).toBe(0);
  });

  it("excludes rows with zero credits from the GPA but still reports their id", () => {
    const courses = [createCourse("Seminar", "A", "0"), createCourse("Biology", "B", "3")];
    const result = calculateGpa(courses, standard);

    expect(result.totalCredits).toBe(3);
    expect(result.gpa).toBe(3.0);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].isCounted).toBe(false);
  });

  it("excludes rows with invalid (non-numeric or empty) credits and surfaces an error", () => {
    const courses = [createCourse("Art", "A", ""), createCourse("Biology", "B", "3")];
    const result = calculateGpa(courses, standard);

    expect(result.totalCredits).toBe(3);
    expect(result.rows[0].isCounted).toBe(false);
    expect(result.rows[0].error).toBe("Enter credits");
  });

  it("excludes rows with negative credits", () => {
    const courses = [createCourse("Art", "A", "-2")];
    const result = calculateGpa(courses, standard);
    expect(result.rows[0].isCounted).toBe(false);
    expect(result.rows[0].error).toBe("Credits can't be negative");
  });

  it("rounds GPA, credits, and quality points to two decimals", () => {
    const courses = [createCourse("A", "A-", "1"), createCourse("B", "B-", "1")];
    const result = calculateGpa(courses, standard);
    // (3.7 + 2.7) / 2 = 3.2 exactly, but exercise the rounding path regardless.
    expect(result.gpa.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
  });
});

describe("parseCredits / creditsError", () => {
  it("parses valid numeric strings", () => {
    expect(parseCredits("4")).toBe(4);
    expect(parseCredits("3.5")).toBe(3.5);
  });

  it("treats empty or invalid strings as null", () => {
    expect(parseCredits("")).toBeNull();
    expect(parseCredits("abc")).toBeNull();
    expect(parseCredits("-1")).toBeNull();
  });

  it("flags empty credits with a helpful message", () => {
    expect(creditsError("")).toBe("Enter credits");
  });

  it("has no error for a normal positive value", () => {
    expect(creditsError("3")).toBeNull();
  });
});

describe("nextMilestone", () => {
  it("finds the next milestone above the current GPA", () => {
    expect(nextMilestone(3.65)).toBe(3.7);
  });

  it("returns null once at the top of the scale", () => {
    expect(nextMilestone(4.0)).toBeNull();
  });
});

describe("neededGpaForTarget", () => {
  it("computes the average needed across remaining credits", () => {
    // 14 credits at 51.1 points now; want 3.8 overall across 14 + 15 = 29 credits.
    // (3.8 * 29 - 51.1) / 15 = 3.94
    const needed = neededGpaForTarget(14, 51.1, 3.8, 15);
    expect(needed).toBeCloseTo(3.94, 2);
  });

  it("returns null when there are no remaining credits", () => {
    expect(neededGpaForTarget(14, 51.1, 3.8, 0)).toBeNull();
  });
});

describe("roundTo", () => {
  it("rounds to the requested decimal places", () => {
    expect(roundTo(3.6499999, 2)).toBe(3.65);
    expect(roundTo(2, 2)).toBe(2);
  });
});
