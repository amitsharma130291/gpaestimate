export interface GpaStandingBand {
  label: string;
  min: number;
  max: number;
}

/**
 * Illustrative standing bands for the live-results scale. Actual Dean's List,
 * honors, and academic-standing thresholds are set by each institution and
 * frequently differ from these figures — surface STANDING_DISCLAIMER
 * alongside any of these labels.
 */
export const STANDING_BANDS: GpaStandingBand[] = [
  { label: "Below typical minimum standing", min: 0, max: 2.0 },
  { label: "Typical satisfactory standing", min: 2.0, max: 3.0 },
  { label: "Typical good standing", min: 3.0, max: 3.5 },
  { label: "Typical Dean's List range", min: 3.5, max: 4.0 },
];

export const STANDING_DISCLAIMER =
  "These are typical ranges, not guarantees. Dean's List, honors, and academic-standing requirements are set by each institution and vary by school and program.";

export function classifyGpaStanding(gpa: number): GpaStandingBand {
  for (let i = STANDING_BANDS.length - 1; i >= 0; i--) {
    if (gpa >= STANDING_BANDS[i].min) return STANDING_BANDS[i];
  }
  return STANDING_BANDS[0];
}
