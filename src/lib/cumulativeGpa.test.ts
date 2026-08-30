import { describe, expect, it } from "vitest";
import { calculateCumulativeGpa, createSemesterEntry, semesterEntryError } from "./cumulativeGpa";

describe("calculateCumulativeGpa", () => {
  it("combines two semesters into a single cumulative GPA", () => {
    const entries = [
      createSemesterEntry("Fall 2025", "15", "3.6"),
      createSemesterEntry("Spring 2026", "16", "3.8"),
    ];
    const result = calculateCumulativeGpa(entries);
    // (15*3.6 + 16*3.8) / 31 = (54 + 60.8) / 31 = 3.70
    expect(result.totalCredits).toBe(31);
    expect(result.totalQualityPoints).toBeCloseTo(114.8, 5);
    expect(result.cumulativeGpa).toBe(3.7);
  });

  it("returns zero for an empty list", () => {
    const result = calculateCumulativeGpa([]);
    expect(result.cumulativeGpa).toBe(0);
    expect(result.totalCredits).toBe(0);
  });

  it("excludes a semester with an invalid GPA and reports why", () => {
    const entries = [createSemesterEntry("Fall 2025", "15", "5.0")];
    const result = calculateCumulativeGpa(entries);
    expect(result.rows[0].isCounted).toBe(false);
    expect(result.rows[0].error).toBe("GPA can't exceed 4.33");
    expect(result.totalCredits).toBe(0);
  });

  it("excludes a semester with missing credits", () => {
    const entries = [createSemesterEntry("Fall 2025", "", "3.5")];
    const result = calculateCumulativeGpa(entries);
    expect(result.rows[0].isCounted).toBe(false);
    expect(semesterEntryError(entries[0])).toBe("Enter credits");
  });

  it("still counts valid semesters when another entry is invalid", () => {
    const entries = [
      createSemesterEntry("Fall 2025", "15", "3.6"),
      createSemesterEntry("Bad Term", "abc", "3.8"),
    ];
    const result = calculateCumulativeGpa(entries);
    expect(result.totalCredits).toBe(15);
    expect(result.cumulativeGpa).toBe(3.6);
  });
});
