import { describe, expect, it } from "vitest";
import { calculateWeightedGpa, createWeightedCourse } from "./weightedGpa";

describe("calculateWeightedGpa", () => {
  it("adds a +1.0 bonus per credit for AP/IB courses and leaves unweighted untouched", () => {
    // A in a 4-credit AP class: base 4.0 + 1.0 bonus = 5.0/credit
    const courses = [createWeightedCourse("AP Calculus", "A", "4", "ap-ib")];
    const result = calculateWeightedGpa(courses);

    expect(result.totalCredits).toBe(4);
    expect(result.totalWeightedPoints).toBe(20);
    expect(result.totalUnweightedPoints).toBe(16);
    expect(result.weightedGpa).toBe(5);
    expect(result.unweightedGpa).toBe(4);
  });

  it("adds a +0.5 bonus per credit for honors courses", () => {
    const courses = [createWeightedCourse("Honors English", "B", "3", "honors")];
    const result = calculateWeightedGpa(courses);
    // B=3.0 + 0.5 = 3.5/credit * 3 = 10.5
    expect(result.totalWeightedPoints).toBe(10.5);
    expect(result.totalUnweightedPoints).toBe(9);
  });

  it("applies no bonus for regular-level courses", () => {
    const courses = [createWeightedCourse("Biology", "A-", "4", "regular")];
    const result = calculateWeightedGpa(courses);
    expect(result.weightedGpa).toBe(result.unweightedGpa);
    expect(result.weightedGpa).toBe(3.7);
  });

  it("does not award a weighting bonus to a failing grade", () => {
    const courses = [createWeightedCourse("AP Physics", "F", "4", "ap-ib")];
    const result = calculateWeightedGpa(courses);
    expect(result.weightedGpa).toBe(0);
    expect(result.unweightedGpa).toBe(0);
  });

  it("matches the reference unweighted example when every course is regular-level", () => {
    const courses = [
      createWeightedCourse("Calculus I", "A-", "4", "regular"),
      createWeightedCourse("General Chemistry", "B+", "4", "regular"),
      createWeightedCourse("English Composition", "A", "3", "regular"),
      createWeightedCourse("Psychology", "A-", "3", "regular"),
    ];
    const result = calculateWeightedGpa(courses);
    expect(result.totalCredits).toBe(14);
    expect(result.unweightedGpa).toBe(3.65);
    expect(result.weightedGpa).toBe(3.65);
  });

  it("mixes levels correctly across a full schedule", () => {
    const courses = [
      createWeightedCourse("AP Calculus", "A", "4", "ap-ib"), // 5.0*4=20
      createWeightedCourse("Honors Chemistry", "B+", "4", "honors"), // 3.8*4=15.2
      createWeightedCourse("English", "A", "3", "regular"), // 4.0*3=12
    ];
    const result = calculateWeightedGpa(courses);
    expect(result.totalCredits).toBe(11);
    expect(result.totalWeightedPoints).toBeCloseTo(47.2, 5);
    expect(result.weightedGpa).toBeCloseTo(4.29, 2);
  });

  it("excludes rows with invalid credits and surfaces an error", () => {
    const courses = [createWeightedCourse("Art", "A", "", "regular")];
    const result = calculateWeightedGpa(courses);
    expect(result.rows[0].isCounted).toBe(false);
    expect(result.rows[0].error).toBe("Enter credits");
  });

  it("returns zero GPAs for an empty schedule", () => {
    const result = calculateWeightedGpa([]);
    expect(result.weightedGpa).toBe(0);
    expect(result.unweightedGpa).toBe(0);
    expect(result.totalCredits).toBe(0);
  });
});
