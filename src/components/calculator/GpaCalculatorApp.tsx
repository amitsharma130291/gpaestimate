import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  calculatorReducer,
  createInitialState,
} from "@/lib/calculatorReducer";
import { calculateGpaForScale } from "@/lib/gpa";
import { GRADING_SCALES } from "@/lib/gradingScales";
import { saveSemester } from "@/lib/storage";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SiteHeader } from "./SiteHeader";
import { CalculatorIntro } from "./CalculatorIntro";
import { SemesterSelector } from "./SemesterSelector";
import { GradingScaleSelector } from "./GradingScaleSelector";
import { CourseTable } from "./CourseTable";
import { LiveGpaPanel } from "./LiveGpaPanel";
import { PredictorBanner } from "./PredictorBanner";
import { ToolNavigation } from "./ToolNavigation";
import { TrustBar } from "./TrustBar";
import { MobileStickyGpaBar } from "./MobileStickyGpaBar";

export function GpaCalculatorApp() {
  const [state, dispatch] = useReducer(calculatorReducer, undefined, createInitialState);
  const prefersReducedMotion = usePrefersReducedMotion();

  const scale = GRADING_SCALES[state.scaleKey];
  const result = useMemo(
    () => calculateGpaForScale(state.courses, state.scaleKey),
    [state.courses, state.scaleKey]
  );

  const announcement = useDebouncedValue(
    `Live GPA updated to ${result.gpa.toFixed(2)} based on ${result.totalCredits} credits.`,
    600
  );

  const panelRef = useRef<HTMLDivElement>(null);
  const [panelOutOfView, setPanelOutOfView] = useState(false);

  useEffect(() => {
    const node = panelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPanelOutOfView(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const entrance = (delay: number, withRise = true) =>
    prefersReducedMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.1 } }
      : {
          initial: { opacity: 0, y: withRise ? 8 : 0 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: withRise ? 0.35 : 0.25, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div>
      <div aria-live="polite" className="sr-only" role="status">
        {announcement}
      </div>

      <motion.div {...entrance(0, false)}>
        <SiteHeader
          currentPath="/"
          onSave={() => saveSemester(state.semester, state.scaleKey, state.courses)}
        />
      </motion.div>

      <div className="mx-auto max-w-[1440px] px-4 pb-8 pt-6 sm:px-6 sm:pb-10 lg:px-10">
        <motion.div
          {...entrance(0.05)}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <CalculatorIntro />
          <div className="flex flex-wrap gap-3">
            <SemesterSelector
              semester={state.semester}
              onChange={(semester) => dispatch({ type: "SET_SEMESTER", semester })}
            />
            <GradingScaleSelector
              scaleKey={state.scaleKey}
              onChange={(scaleKey) => dispatch({ type: "SET_SCALE", scaleKey })}
            />
          </div>
        </motion.div>

        <motion.div
          {...entrance(0.46)}
          className="mt-5 overflow-hidden rounded-panel border border-border bg-white shadow-panel lg:grid lg:grid-cols-[1fr_360px]"
        >
          <div className="lg:border-r lg:border-border">
            <CourseTable
              courses={state.courses}
              results={result.rows}
              scale={scale}
              lastAddedId={state.lastAddedId}
              onChangeCourse={(id, patch) => dispatch({ type: "UPDATE_COURSE", id, patch })}
              onRemoveCourse={(id) => dispatch({ type: "REMOVE_COURSE", id })}
              onAddCourse={() => dispatch({ type: "ADD_COURSE" })}
            />
          </div>
          <div ref={panelRef} className="p-3 lg:p-4">
            <LiveGpaPanel
              gpa={result.gpa}
              totalCredits={result.totalCredits}
              totalQualityPoints={result.totalQualityPoints}
            />
          </div>
        </motion.div>

        <MobileStickyGpaBar
          visible={panelOutOfView}
          gpa={result.gpa}
          totalCredits={result.totalCredits}
        />

        <motion.div {...entrance(0.52)} className="mt-6">
          <PredictorBanner gpa={result.gpa} />
        </motion.div>

        <motion.div {...entrance(0.55)} className="mt-8">
          <ToolNavigation />
        </motion.div>

        <motion.div {...entrance(0.58)} className="mt-8 border-t border-border pt-6">
          <TrustBar />
        </motion.div>
      </div>
    </div>
  );
}
