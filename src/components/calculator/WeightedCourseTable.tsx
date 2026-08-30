import { AnimatePresence } from "motion/react";
import type { WeightedCourse, WeightedCourseResult } from "@/lib/weightedGpa";
import { WeightedCourseRow } from "./WeightedCourseRow";
import { AddCourseButton } from "./AddCourseButton";

interface WeightedCourseTableProps {
  courses: WeightedCourse[];
  results: WeightedCourseResult[];
  lastAddedId: string | null;
  addButtonLabel?: string;
  emptyStateLabel?: string;
  onChangeCourse: (id: string, patch: Partial<Omit<WeightedCourse, "id">>) => void;
  onRemoveCourse: (id: string) => void;
  onAddCourse: () => void;
}

export function WeightedCourseTable({
  courses,
  results,
  lastAddedId,
  addButtonLabel = "Add another course",
  emptyStateLabel = "No courses yet — add one below to start calculating your GPA.",
  onChangeCourse,
  onRemoveCourse,
  onAddCourse,
}: WeightedCourseTableProps) {
  const resultById = new Map(results.map((r) => [r.id, r]));

  return (
    <div>
      <div
        aria-hidden="true"
        className="hidden grid-cols-[1fr_150px_100px_88px_88px_44px] gap-3 rounded-t-panel bg-mist px-5 py-2 text-xs font-semibold uppercase tracking-wide text-graphite-muted md:grid"
      >
        <span>Course</span>
        <span>Level</span>
        <span>Grade</span>
        <span>Credits</span>
        <span>Points</span>
        <span />
      </div>

      <ul className="list-none border-t border-border">
        <AnimatePresence initial={false}>
          {courses.map((course, index) => {
            const result = resultById.get(course.id);
            if (!result) return null;
            return (
              <WeightedCourseRow
                key={course.id}
                course={course}
                result={result}
                index={index}
                focusNameOnEnter={course.id === lastAddedId}
                onChange={(patch) => onChangeCourse(course.id, patch)}
                onRemove={() => onRemoveCourse(course.id)}
              />
            );
          })}
        </AnimatePresence>
      </ul>

      {courses.length === 0 ? (
        <p className="px-5 py-8 text-center text-[15px] text-graphite-muted">{emptyStateLabel}</p>
      ) : null}

      <div className="px-5 pb-2.5 pt-2">
        <AddCourseButton onClick={onAddCourse} label={addButtonLabel} />
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-graphite-muted">
          <span aria-hidden="true" className="text-chartreuse-dark">
            ⚡
          </span>
          Changes update instantly
        </p>
      </div>
    </div>
  );
}
