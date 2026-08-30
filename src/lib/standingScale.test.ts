import { describe, expect, it } from "vitest";
import { classifyGpaStanding } from "./standingScale";

describe("classifyGpaStanding", () => {
  it("classifies a Dean's List range GPA with institution-variance wording", () => {
    expect(classifyGpaStanding(3.65).label).toBe("Typical Dean's List range");
  });

  it("classifies a below-minimum GPA", () => {
    expect(classifyGpaStanding(1.2).label).toBe("Below typical minimum standing");
  });

  it("classifies a good-standing GPA", () => {
    expect(classifyGpaStanding(3.2).label).toBe("Typical good standing");
  });

  it("classifies a satisfactory-standing GPA", () => {
    expect(classifyGpaStanding(2.5).label).toBe("Typical satisfactory standing");
  });

  it("is inclusive at band boundaries", () => {
    expect(classifyGpaStanding(3.5).label).toBe("Typical Dean's List range");
    expect(classifyGpaStanding(4.0).label).toBe("Typical Dean's List range");
  });
});
