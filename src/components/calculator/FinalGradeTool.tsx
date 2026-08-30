import { useId, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  neededFinalExamScore,
  percentFieldError,
  weightFieldError,
} from "@/lib/finalGrade";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SiteHeader } from "./SiteHeader";
import { ToolBreadcrumb } from "./ToolBreadcrumb";

interface FinalGradeToolProps {
  currentPath: string;
}

export function FinalGradeTool({ currentPath }: FinalGradeToolProps) {
  const [currentGrade, setCurrentGrade] = useState("85");
  const [desiredGrade, setDesiredGrade] = useState("90");
  const [examWeight, setExamWeight] = useState("20");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const prefersReducedMotion = usePrefersReducedMotion();
  const idPrefix = useId();

  const currentError = percentFieldError(currentGrade, "current grade");
  const desiredError = percentFieldError(desiredGrade, "desired grade");
  const weightError = weightFieldError(examWeight);

  const needed = useMemo(() => {
    if (currentError || desiredError || weightError) return null;
    return neededFinalExamScore({
      currentGrade: Number(currentGrade),
      desiredGrade: Number(desiredGrade),
      examWeightPercent: Number(examWeight),
    });
  }, [currentGrade, desiredGrade, examWeight, currentError, desiredError, weightError]);

  const animatedNeeded = useAnimatedNumber(needed ?? 0, 350);
  const hasError = currentError || desiredError || weightError;
  const impossible = needed !== null && needed > 100;
  const alreadyThere = needed !== null && needed <= 0;

  const entrance = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.1 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div>
      <SiteHeader currentPath={currentPath} onSave={() => {}} />
      <ToolBreadcrumb current="Final Grade Calculator" />

      <main id="main-content" className="mx-auto max-w-2xl px-4 pb-16 pt-6 sm:px-6">
        <motion.div {...entrance}>
          <h1 className="text-3xl font-bold text-graphite sm:text-4xl">Final Grade Calculator</h1>
          <p className="mt-1.5 text-[15px] text-graphite-muted">
            Find the score you need on your final exam to reach the course grade you want.
          </p>
        </motion.div>

        <motion.form
          {...entrance}
          className="mt-6 grid grid-cols-1 gap-5 rounded-panel border border-border bg-white p-6 sm:grid-cols-3"
        >
          <Field
            id={`${idPrefix}-current`}
            label="Current grade (%)"
            value={currentGrade}
            onChange={setCurrentGrade}
            onBlur={() => setTouched((t) => ({ ...t, current: true }))}
            error={touched.current ? currentError : null}
          />
          <Field
            id={`${idPrefix}-desired`}
            label="Desired final grade (%)"
            value={desiredGrade}
            onChange={setDesiredGrade}
            onBlur={() => setTouched((t) => ({ ...t, desired: true }))}
            error={touched.desired ? desiredError : null}
          />
          <Field
            id={`${idPrefix}-weight`}
            label="Final's weight (%)"
            value={examWeight}
            onChange={setExamWeight}
            onBlur={() => setTouched((t) => ({ ...t, weight: true }))}
            error={touched.weight ? weightError : null}
          />
        </motion.form>

        <motion.div
          {...entrance}
          role="status"
          aria-live="polite"
          className="mt-6 rounded-panel bg-pine-950 p-6 text-center text-cream"
        >
          {hasError || needed === null ? (
            <p className="text-cream-muted">Enter your grades above to see what you'll need.</p>
          ) : impossible ? (
            <p>
              You'd need{" "}
              <span className="tabular-nums font-bold">{animatedNeeded.toFixed(1)}%</span> on the
              final — above 100%, so this target isn't reachable without extra credit.
            </p>
          ) : alreadyThere ? (
            <p>You've already secured this grade — any passing score keeps you there.</p>
          ) : (
            <p>
              You need at least{" "}
              <span className="tabular-nums text-3xl font-bold text-chartreuse">
                {animatedNeeded.toFixed(1)}%
              </span>{" "}
              on your final exam to reach {Number(desiredGrade).toFixed(1)}% overall.
            </p>
          )}
        </motion.div>

        <motion.div {...entrance} className="mt-6 rounded-panel border border-border bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-graphite-muted">
            The formula
          </p>
          <p className="mt-2 text-[15px] font-medium text-pine-900">
            Final score = (desired grade − current grade × (1 − weight)) ÷ weight
          </p>
          <p className="mt-2 text-sm text-graphite-muted">
            Weight is the final exam's share of your overall grade, expressed as a fraction (a
            20%-weighted final is 0.2).
          </p>
        </motion.div>
      </main>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error: string | null;
}) {
  const errorId = `${id}-error`;
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
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`mt-1.5 w-full rounded-control border bg-white px-3 py-2 text-[15px] font-medium text-graphite transition-colors duration-140 focus:border-pine-700 ${
          error ? "border-terracotta" : "border-border"
        }`}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-terracotta-dark">
          {error}
        </p>
      ) : null}
    </div>
  );
}
