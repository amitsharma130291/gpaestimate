import { describe, expect, it } from "vitest";
import { neededFinalExamScore, percentFieldError, weightFieldError } from "./finalGrade";

describe("neededFinalExamScore", () => {
  it("computes the score needed on a 20%-weighted final", () => {
    // current 85, want 88 overall, final worth 20%:
    // (88 - 85*0.8) / 0.2 = (88 - 68) / 0.2 = 100
    const needed = neededFinalExamScore({
      currentGrade: 85,
      desiredGrade: 88,
      examWeightPercent: 20,
    });
    expect(needed).toBe(100);
  });

  it("matches a simpler, more achievable target", () => {
    // current 90, want 90 overall, any weight -> needed = 90 exactly
    const needed = neededFinalExamScore({
      currentGrade: 90,
      desiredGrade: 90,
      examWeightPercent: 30,
    });
    expect(needed).toBe(90);
  });

  it("treats a 100%-weighted final as needing exactly the desired grade", () => {
    const needed = neededFinalExamScore({
      currentGrade: 60,
      desiredGrade: 95,
      examWeightPercent: 100,
    });
    expect(needed).toBe(95);
  });

  it("returns a value above 100 when the target isn't realistically reachable", () => {
    // current 50, want 95 overall, final only worth 10%
    const needed = neededFinalExamScore({
      currentGrade: 50,
      desiredGrade: 95,
      examWeightPercent: 10,
    });
    expect(needed).toBeGreaterThan(100);
  });

  it("returns null for a zero or invalid weight", () => {
    expect(neededFinalExamScore({ currentGrade: 85, desiredGrade: 90, examWeightPercent: 0 })).toBeNull();
    expect(
      neededFinalExamScore({ currentGrade: 85, desiredGrade: 90, examWeightPercent: 150 })
    ).toBeNull();
  });

  it("returns null when an input is not a finite number", () => {
    expect(
      neededFinalExamScore({ currentGrade: NaN, desiredGrade: 90, examWeightPercent: 20 })
    ).toBeNull();
  });
});

describe("percentFieldError", () => {
  it("flags empty, negative, and over-100 values", () => {
    expect(percentFieldError("", "current grade")).toBe("Enter current grade");
    expect(percentFieldError("-5", "current grade")).toBe("current grade can't be negative");
    expect(percentFieldError("101", "current grade")).toBe("current grade can't exceed 100");
  });

  it("accepts a normal value", () => {
    expect(percentFieldError("85", "current grade")).toBeNull();
  });
});

describe("weightFieldError", () => {
  it("requires a positive weight no greater than 100", () => {
    expect(weightFieldError("0")).toBe("Weight must be greater than 0");
    expect(weightFieldError("150")).toBe("Weight can't exceed 100");
    expect(weightFieldError("20")).toBeNull();
  });
});
