import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import type { WeightedCourse, WeightedCourseResult } from "@/lib/weightedGpa";
import { COURSE_LEVELS, GRADING_SCALES, type CourseLevel } from "@/lib/gradingScales";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const SCALE = GRADING_SCALES["standard-4"];
const ROW_TRANSITION = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };
const EXIT_TRANSITION = { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };

interface WeightedCourseRowProps {
  course: WeightedCourse;
  result: WeightedCourseResult;
  index: number;
  focusNameOnEnter: boolean;
  onChange: (patch: Partial<Omit<WeightedCourse, "id">>) => void;
  onRemove: () => void;
}

export function WeightedCourseRow({
  course,
  result,
  index,
  focusNameOnEnter,
  onChange,
  onRemove,
}: WeightedCourseRowProps) {
  const [creditsTouched, setCreditsTouched] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const showError = creditsTouched && result.error !== null;
  const rowLabel = course.name.trim() || `Course ${index + 1}`;
  const creditsErrorId = `w-credits-error-${course.id}`;
  const prefersReducedMotion = usePrefersReducedMotion();

  const initial = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -6 };
  const exit = prefersReducedMotion
    ? { opacity: 0, transition: { duration: 0.09 } }
    : { opacity: 0, x: 6, height: 0, transition: EXIT_TRANSITION };
  const transition = prefersReducedMotion ? { duration: 0.09 } : ROW_TRANSITION;

  return (
    <motion.li
      layout={!prefersReducedMotion}
      initial={initial}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={exit}
      transition={transition}
      onAnimationComplete={() => {
        if (focusNameOnEnter) nameInputRef.current?.focus();
      }}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-1 gap-2 border-b border-border px-5 py-2 last:border-b-0 md:grid-cols-[1fr_150px_100px_88px_88px_44px] md:items-center md:gap-3">
        <div className="min-w-0">
          <label htmlFor={`w-course-name-${course.id}`} className="sr-only">
            Course name for row {index + 1}
          </label>
          <input
            ref={nameInputRef}
            id={`w-course-name-${course.id}`}
            type="text"
            value={course.name}
            placeholder="Course name"
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full min-w-0 truncate rounded-control border border-transparent bg-transparent px-2 py-1.5 text-[15px] font-medium text-graphite transition-colors duration-140 placeholder:text-graphite-soft hover:bg-mist focus:border-border-strong focus:bg-white"
          />
        </div>

        <div>
          <label htmlFor={`w-level-${course.id}`} className="sr-only">
            Course level for {rowLabel}
          </label>
          <select
            id={`w-level-${course.id}`}
            value={course.level}
            onChange={(e) => onChange({ level: e.target.value as CourseLevel })}
            className="w-full appearance-none rounded-control border border-border bg-white px-2 py-1.5 text-[13px] font-medium text-graphite transition-colors duration-140 hover:bg-mist focus:border-pine-700 md:text-[14px]"
          >
            {COURSE_LEVELS.map((l) => (
              <option key={l.key} value={l.key}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 md:contents">
          <div className="flex-1 md:flex-none">
            <label htmlFor={`w-grade-${course.id}`} className="sr-only">
              Grade for {rowLabel}
            </label>
            <select
              id={`w-grade-${course.id}`}
              value={course.grade}
              onChange={(e) => onChange({ grade: e.target.value })}
              className="w-full appearance-none rounded-control border border-border bg-white px-3 py-1.5 text-[15px] font-medium text-graphite transition-colors duration-140 hover:bg-mist focus:border-pine-700"
            >
              {SCALE.grades.map((g) => (
                <option key={g.grade} value={g.grade}>
                  {g.grade}
                </option>
              ))}
            </select>
          </div>

          <div className="w-20 md:w-auto">
            <label htmlFor={`w-credits-${course.id}`} className="sr-only">
              Credits for {rowLabel}
            </label>
            <motion.input
              id={`w-credits-${course.id}`}
              type="text"
              inputMode="decimal"
              value={course.credits}
              onChange={(e) => onChange({ credits: e.target.value })}
              onBlur={() => setCreditsTouched(true)}
              aria-invalid={showError}
              aria-describedby={showError ? creditsErrorId : undefined}
              animate={showError && !prefersReducedMotion ? { x: [0, -3, 3, -2, 0] } : { x: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.09 : 0.24 }}
              className={`w-full rounded-control border bg-white px-3 py-1.5 text-[15px] font-medium text-graphite transition-colors duration-140 hover:bg-mist focus:border-pine-700 ${
                showError ? "border-terracotta" : "border-border"
              }`}
            />
            {showError ? (
              <p id={creditsErrorId} className="mt-1 text-xs text-terracotta-dark">
                {result.error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="hidden items-center text-[15px] font-semibold tabular-nums text-graphite md:flex">
          {result.weightedPoints !== null ? result.weightedPoints.toFixed(1) : "—"}
        </div>

        <div className="flex items-center justify-between md:justify-center">
          <span className="text-sm text-graphite-muted md:hidden">
            Weighted points:{" "}
            <span className="tabular-nums font-semibold text-graphite">
              {result.weightedPoints !== null ? result.weightedPoints.toFixed(1) : "—"}
            </span>
          </span>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${rowLabel}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-graphite-muted transition-colors duration-140 hover:bg-terracotta-bg hover:text-terracotta-dark md:h-10 md:w-10"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.li>
  );
}
