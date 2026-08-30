import { useMemo, useReducer } from "react";
import { motion } from "motion/react";
import { calculateWeightedGpa, createWeightedCourse, type WeightedCourse } from "@/lib/weightedGpa";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SiteHeader } from "./SiteHeader";
import { ToolBreadcrumb } from "./ToolBreadcrumb";
import { WeightedCourseTable } from "./WeightedCourseTable";
import { WeightedLiveGpaPanel } from "./WeightedLiveGpaPanel";

interface WeightedGpaToolProps {
  currentPath: string;
  breadcrumbLabel: string;
  heading: string;
  subtitle: string;
  /** Seed rows — kept distinct per landing page so the two pages don't render identical example data. */
  initialCourses: WeightedCourse[];
  addButtonLabel?: string;
  emptyStateLabel?: string;
  panelNote?: string;
}

type Action =
  | { type: "ADD" }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE"; id: string; patch: Partial<Omit<WeightedCourse, "id">> };

interface State {
  courses: WeightedCourse[];
  lastAddedId: string | null;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD": {
      const course = createWeightedCourse("", "A", "3", "regular");
      return { courses: [...state.courses, course], lastAddedId: course.id };
    }
    case "REMOVE":
      return {
        courses: state.courses.filter((c) => c.id !== action.id),
        lastAddedId: state.lastAddedId === action.id ? null : state.lastAddedId,
      };
    case "UPDATE":
      return {
        ...state,
        courses: state.courses.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)),
      };
    default:
      return state;
  }
}

export function WeightedGpaTool({
  currentPath,
  breadcrumbLabel,
  heading,
  subtitle,
  initialCourses,
  addButtonLabel,
  emptyStateLabel,
  panelNote,
}: WeightedGpaToolProps) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    courses: initialCourses,
    lastAddedId: null,
  }));
  const prefersReducedMotion = usePrefersReducedMotion();

  const result = useMemo(() => calculateWeightedGpa(state.courses), [state.courses]);

  const announcement = useDebouncedValue(
    `Weighted GPA updated to ${result.weightedGpa.toFixed(2)}, unweighted ${result.unweightedGpa.toFixed(2)}, based on ${result.totalCredits} credits.`,
    600
  );

  const entrance = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.1 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div>
      <div aria-live="polite" className="sr-only" role="status">
        {announcement}
      </div>

      <SiteHeader currentPath={currentPath} onSave={() => {}} />
      <ToolBreadcrumb current={breadcrumbLabel} />

      <main id="main-content" className="mx-auto max-w-[1440px] px-4 pb-8 pt-6 sm:px-6 sm:pb-10 lg:px-10">
        <motion.div {...entrance}>
          <h1 className="text-3xl font-bold text-graphite sm:text-4xl">{heading}</h1>
          <p className="mt-1.5 max-w-2xl text-[15px] text-graphite-muted">{subtitle}</p>
        </motion.div>

        <motion.div
          {...entrance}
          className="mt-5 overflow-hidden rounded-panel border border-border bg-white shadow-panel lg:grid lg:grid-cols-[1fr_360px]"
        >
          <div className="lg:border-r lg:border-border">
            <WeightedCourseTable
              courses={state.courses}
              results={result.rows}
              lastAddedId={state.lastAddedId}
              addButtonLabel={addButtonLabel}
              emptyStateLabel={emptyStateLabel}
              onChangeCourse={(id, patch) => dispatch({ type: "UPDATE", id, patch })}
              onRemoveCourse={(id) => dispatch({ type: "REMOVE", id })}
              onAddCourse={() => dispatch({ type: "ADD" })}
            />
          </div>
          <div className="p-3 lg:p-4">
            <WeightedLiveGpaPanel
              weightedGpa={result.weightedGpa}
              unweightedGpa={result.unweightedGpa}
              totalCredits={result.totalCredits}
              note={panelNote}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
