import { useEffect, useMemo, useReducer, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Trash2 } from "lucide-react";
import {
  calculateCumulativeGpa,
  createSemesterEntry,
  semesterEntryError,
  type SemesterEntry,
} from "@/lib/cumulativeGpa";
import { calculateGpaForScale } from "@/lib/gpa";
import { listSavedSemesters, safeScaleKey } from "@/lib/storage";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SiteHeader } from "./SiteHeader";
import { ToolBreadcrumb } from "./ToolBreadcrumb";
import { AddCourseButton } from "./AddCourseButton";

type Action =
  | { type: "ADD" }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE"; id: string; patch: Partial<Omit<SemesterEntry, "id">> }
  | { type: "REPLACE_FROM_STORAGE"; entries: SemesterEntry[] };

interface State {
  entries: SemesterEntry[];
  lastAddedId: string | null;
  loadedFromStorage: boolean;
}

function createDemoEntries(): SemesterEntry[] {
  return [
    { id: "cum-default-1", label: "Fall 2025", credits: "15", gpa: "3.60" },
    { id: "cum-default-2", label: "Spring 2026", credits: "16", gpa: "3.80" },
  ];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD": {
      const entry = createSemesterEntry("", "15", "3.50");
      return { ...state, entries: [...state.entries, entry], lastAddedId: entry.id };
    }
    case "REMOVE":
      return {
        ...state,
        entries: state.entries.filter((e) => e.id !== action.id),
        lastAddedId: state.lastAddedId === action.id ? null : state.lastAddedId,
      };
    case "UPDATE":
      return {
        ...state,
        entries: state.entries.map((e) => (e.id === action.id ? { ...e, ...action.patch } : e)),
      };
    case "REPLACE_FROM_STORAGE":
      return { entries: action.entries, lastAddedId: null, loadedFromStorage: true };
    default:
      return state;
  }
}

interface CumulativeGpaToolProps {
  currentPath: string;
}

export function CumulativeGpaTool({ currentPath }: CumulativeGpaToolProps) {
  const [state, dispatch] = useReducer(reducer, {
    entries: createDemoEntries(),
    lastAddedId: null,
    loadedFromStorage: false,
  });
  const prefersReducedMotion = usePrefersReducedMotion();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = listSavedSemesters();
    if (saved.length === 0) return;
    const entries = saved.map((record) => {
      const result = calculateGpaForScale(record.courses, safeScaleKey(record.scaleKey));
      return createSemesterEntry(
        record.semester,
        String(result.totalCredits),
        result.gpa.toFixed(2)
      );
    });
    dispatch({ type: "REPLACE_FROM_STORAGE", entries });
  }, []);

  const result = useMemo(() => calculateCumulativeGpa(state.entries), [state.entries]);

  const announcement = useDebouncedValue(
    `Cumulative GPA updated to ${result.cumulativeGpa.toFixed(2)} across ${result.totalCredits} credits.`,
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
      <ToolBreadcrumb current="Cumulative GPA Calculator" />

      <main id="main-content" className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
        <motion.div {...entrance}>
          <h1 className="text-3xl font-bold text-graphite sm:text-4xl">Cumulative GPA Calculator</h1>
          <p className="mt-1.5 text-[15px] text-graphite-muted">
            Combine every semester into one running GPA. Enter each term's GPA and credits below.
          </p>
          {state.loadedFromStorage ? (
            <p className="mt-2 text-sm text-pine-800">
              Loaded {state.entries.length} semester{state.entries.length === 1 ? "" : "s"} saved
              on this device.
            </p>
          ) : null}
        </motion.div>

        <motion.div
          {...entrance}
          className="mt-5 overflow-hidden rounded-panel border border-border bg-white shadow-panel"
        >
          <div
            aria-hidden="true"
            className="hidden grid-cols-[1fr_120px_100px_44px] gap-3 rounded-t-panel bg-mist px-5 py-2 text-xs font-semibold uppercase tracking-wide text-graphite-muted sm:grid"
          >
            <span>Semester</span>
            <span>Credits</span>
            <span>GPA</span>
            <span />
          </div>

          <ul className="list-none border-t border-border">
            <AnimatePresence initial={false}>
              {state.entries.map((entry, index) => {
                const rowResult = result.rows.find((r) => r.id === entry.id);
                const showError = touched[entry.id] && !!rowResult?.error;
                const label = entry.label.trim() || `Semester ${index + 1}`;
                return (
                  <motion.li
                    key={entry.id}
                    layout={!prefersReducedMotion}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={
                      prefersReducedMotion
                        ? { opacity: 0, transition: { duration: 0.09 } }
                        : { opacity: 0, x: 6, height: 0, transition: { duration: 0.2 } }
                    }
                    transition={{ duration: prefersReducedMotion ? 0.09 : 0.24 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-2 border-b border-border px-5 py-2.5 last:border-b-0 sm:grid-cols-[1fr_120px_100px_44px] sm:items-center sm:gap-3">
                      <div className="min-w-0">
                        <label htmlFor={`sem-label-${entry.id}`} className="sr-only">
                          Semester name {index + 1}
                        </label>
                        <input
                          id={`sem-label-${entry.id}`}
                          type="text"
                          value={entry.label}
                          placeholder="Semester name"
                          onChange={(e) =>
                            dispatch({ type: "UPDATE", id: entry.id, patch: { label: e.target.value } })
                          }
                          className="w-full min-w-0 truncate rounded-control border border-transparent bg-transparent px-2 py-1.5 text-[15px] font-medium text-graphite transition-colors duration-140 placeholder:text-graphite-soft hover:bg-mist focus:border-border-strong focus:bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-3 sm:contents">
                        <div className="flex-1 sm:flex-none">
                          <label htmlFor={`sem-credits-${entry.id}`} className="sr-only">
                            Credits for {label}
                          </label>
                          <input
                            id={`sem-credits-${entry.id}`}
                            type="text"
                            inputMode="decimal"
                            value={entry.credits}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE",
                                id: entry.id,
                                patch: { credits: e.target.value },
                              })
                            }
                            onBlur={() => setTouched((t) => ({ ...t, [entry.id]: true }))}
                            aria-invalid={showError}
                            className={`w-full rounded-control border bg-white px-3 py-1.5 text-[15px] font-medium text-graphite transition-colors duration-140 hover:bg-mist focus:border-pine-700 ${
                              showError ? "border-terracotta" : "border-border"
                            }`}
                          />
                        </div>
                        <div className="flex-1 sm:flex-none">
                          <label htmlFor={`sem-gpa-${entry.id}`} className="sr-only">
                            GPA for {label}
                          </label>
                          <input
                            id={`sem-gpa-${entry.id}`}
                            type="text"
                            inputMode="decimal"
                            value={entry.gpa}
                            onChange={(e) =>
                              dispatch({ type: "UPDATE", id: entry.id, patch: { gpa: e.target.value } })
                            }
                            onBlur={() => setTouched((t) => ({ ...t, [entry.id]: true }))}
                            aria-invalid={showError}
                            aria-describedby={showError ? `sem-error-${entry.id}` : undefined}
                            className={`w-full rounded-control border bg-white px-3 py-1.5 text-[15px] font-medium text-graphite transition-colors duration-140 hover:bg-mist focus:border-pine-700 ${
                              showError ? "border-terracotta" : "border-border"
                            }`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-center">
                        {showError ? (
                          <p id={`sem-error-${entry.id}`} className="text-xs text-terracotta-dark">
                            {semesterEntryError(entry)}
                          </p>
                        ) : (
                          <span className="text-sm text-graphite-muted sm:hidden">
                            Quality points:{" "}
                            <span className="tabular-nums font-semibold text-graphite">
                              {rowResult?.qualityPoints?.toFixed(1) ?? "—"}
                            </span>
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => dispatch({ type: "REMOVE", id: entry.id })}
                          aria-label={`Remove ${label}`}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-graphite-muted transition-colors duration-140 hover:bg-terracotta-bg hover:text-terracotta-dark sm:h-10 sm:w-10"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {state.entries.length === 0 ? (
            <p className="px-5 py-8 text-center text-[15px] text-graphite-muted">
              Add a semester below to calculate your cumulative GPA.
            </p>
          ) : null}

          <div className="px-5 pb-3 pt-2.5">
            <AddCourseButton onClick={() => dispatch({ type: "ADD" })} label="Add another semester" />
          </div>
        </motion.div>

        <motion.div
          {...entrance}
          className="mt-5 rounded-panel bg-pine-950 px-6 py-6 text-center text-cream sm:px-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-muted">
            Cumulative GPA
          </p>
          <p className="tabular-nums mt-1.5 text-6xl font-bold leading-none text-cream sm:text-7xl">
            {result.cumulativeGpa.toFixed(2)}
          </p>
          <div className="mx-auto mt-4 grid max-w-xs grid-cols-2 divide-x divide-pine-700 border-t border-pine-700 pt-3.5 text-center">
            <div>
              <p className="tabular-nums text-2xl font-semibold text-cream">
                {result.totalCredits}
              </p>
              <p className="mt-1 text-sm text-cream-muted">total credits</p>
            </div>
            <div>
              <p className="tabular-nums text-2xl font-semibold text-cream">
                {result.totalQualityPoints}
              </p>
              <p className="mt-1 text-sm text-cream-muted">quality points</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
