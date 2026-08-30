import { useEffect, useMemo, useState } from "react";
import { calculateGpaForScale, roundTo } from "@/lib/gpa";
import { safeScaleKey, listSavedSemesters } from "@/lib/storage";
import { SiteHeader } from "./SiteHeader";
import { ToolBreadcrumb } from "./ToolBreadcrumb";

const DEFAULT_CREDITS = "14";
const DEFAULT_QUALITY_POINTS = "51.1";
const DEFAULT_TARGET = "3.8";

function readLastSavedTotals(): { credits: string; qualityPoints: string } | null {
  const saved = listSavedSemesters()[0];
  if (!saved) return null;
  const result = calculateGpaForScale(saved.courses, safeScaleKey(saved.scaleKey));
  return { credits: String(result.totalCredits), qualityPoints: String(result.totalQualityPoints) };
}

function readTargetFromUrl(): string | null {
  const param = new URLSearchParams(window.location.search).get("target");
  const value = param ? Number(param) : NaN;
  return Number.isFinite(value) && value > 0 && value <= 4.33 ? value.toFixed(2) : null;
}

export function GpaPredictorApp() {
  // Start from server-safe defaults so the first client render matches the
  // SSR output exactly; localStorage/URL-derived values (which don't exist
  // during SSR) are applied a moment later, after hydration, in the effect
  // below — reading them eagerly here would cause a hydration mismatch.
  const [currentCredits, setCurrentCredits] = useState(DEFAULT_CREDITS);
  const [currentQualityPoints, setCurrentQualityPoints] = useState(DEFAULT_QUALITY_POINTS);
  const [targetGpa, setTargetGpa] = useState(DEFAULT_TARGET);
  const [remainingCredits, setRemainingCredits] = useState("15");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect --
       One-time seed from localStorage/the URL, not a continuous sync — these
       fields become freely user-editable immediately after, which rules out
       useSyncExternalStore here. */
    const saved = readLastSavedTotals();
    if (saved) {
      setCurrentCredits(saved.credits);
      setCurrentQualityPoints(saved.qualityPoints);
    }
    const target = readTargetFromUrl();
    if (target) setTargetGpa(target);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const needed = useMemo(() => {
    const credits = Number(currentCredits);
    const points = Number(currentQualityPoints);
    const target = Number(targetGpa);
    const remaining = Number(remainingCredits);
    if (![credits, points, target, remaining].every(Number.isFinite) || remaining <= 0) {
      return null;
    }
    return roundTo((target * (credits + remaining) - points) / remaining, 2);
  }, [currentCredits, currentQualityPoints, targetGpa, remainingCredits]);

  const impossible = needed !== null && needed > 4.0;

  return (
    <div>
      <SiteHeader currentPath="/gpa-predictor" onSave={() => {}} />
      <ToolBreadcrumb current="GPA Predictor" />
      <main id="main-content" className="mx-auto max-w-2xl px-4 pb-20 pt-6 sm:px-6">
        <h1 className="text-3xl font-bold text-graphite sm:text-4xl">GPA Predictor</h1>
        <p className="mt-1.5 text-[15px] text-graphite-muted">
          Planning ahead: see what your GPA will become based on grades you haven't earned yet.
          Enter your current standing, set a target, and find the average you need going forward.
        </p>

        <form className="mt-8 grid grid-cols-1 gap-5 rounded-panel border border-border bg-white p-6 sm:grid-cols-2">
          <Field
            id="current-credits"
            label="Current credits earned"
            value={currentCredits}
            onChange={setCurrentCredits}
          />
          <Field
            id="current-points"
            label="Current quality points"
            value={currentQualityPoints}
            onChange={setCurrentQualityPoints}
          />
          <Field id="target-gpa" label="Target GPA" value={targetGpa} onChange={setTargetGpa} />
          <Field
            id="remaining-credits"
            label="Remaining credits planned"
            value={remainingCredits}
            onChange={setRemainingCredits}
          />
        </form>

        <div
          role="status"
          aria-live="polite"
          className="mt-6 rounded-panel bg-pine-950 p-6 text-center text-cream"
        >
          {needed === null ? (
            <p className="text-cream-muted">Enter your numbers above to see what you'll need.</p>
          ) : impossible ? (
            <p>
              You'd need a <span className="tabular-nums font-bold">{needed.toFixed(2)}</span>{" "}
              average — above the 4.0 scale, so this target isn't reachable in{" "}
              {remainingCredits} credits.
            </p>
          ) : (
            <p>
              You need at least a{" "}
              <span className="tabular-nums text-3xl font-bold text-chartreuse">
                {Math.max(needed, 0).toFixed(2)}
              </span>{" "}
              GPA across your next {remainingCredits} credits to reach {Number(targetGpa).toFixed(2)}.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-graphite-muted">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-control border border-border bg-white px-3 py-2 text-[15px] font-medium text-graphite transition-colors duration-140 focus:border-pine-700"
      />
    </div>
  );
}
