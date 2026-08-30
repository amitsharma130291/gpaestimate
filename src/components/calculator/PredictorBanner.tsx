import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Pencil, Target } from "lucide-react";
import { nextMilestone, roundTo } from "@/lib/gpa";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface PredictorBannerProps {
  gpa: number;
}

const MAX_TARGET = 4.33;

function statusInsight(gpa: number, target: number): string {
  if (gpa >= target) {
    return "You've already reached this target — raise it to keep stretching, or open the predictor to plan ahead.";
  }
  const gap = roundTo(target - gpa, 2);
  return `You're ${gap.toFixed(2)} GPA points away — the predictor can show what that takes in your remaining credits.`;
}

export function PredictorBanner({ gpa }: PredictorBannerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const suggestedTarget = nextMilestone(gpa) ?? 4.0;
  const [targetOverride, setTargetOverride] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const target = targetOverride ?? suggestedTarget;

  const previousTarget = useRef<number | null>(target);
  const [justReached, setJustReached] = useState(false);

  useEffect(() => {
    if (previousTarget.current !== null && gpa >= previousTarget.current) {
      setJustReached(true);
      const timer = setTimeout(() => setJustReached(false), 900);
      previousTarget.current = target;
      return () => clearTimeout(timer);
    }
    previousTarget.current = target;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpa]);

  const startEditing = () => {
    setDraft(target.toFixed(2));
    setEditing(true);
  };

  const commitEdit = () => {
    const value = Number(draft);
    if (Number.isFinite(value) && value > 0 && value <= MAX_TARGET) {
      setTargetOverride(roundTo(value, 2));
    }
    setEditing(false);
  };

  const predictorHref = `/gpa-predictor/?target=${target.toFixed(2)}`;

  return (
    <motion.div
      animate={
        justReached && !prefersReducedMotion
          ? { borderColor: ["#f0d7c4", "#bd5732", "#f0d7c4"] }
          : {}
      }
      transition={{ duration: 0.9 }}
      className="flex flex-col gap-4 rounded-panel border border-terracotta-border bg-terracotta-bg p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="flex items-start gap-3 sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-terracotta">
          <Target size={20} aria-hidden="true" />
        </span>
        <div>
          {editing ? (
            <div className="flex items-center gap-2">
              <label htmlFor="predictor-target" className="text-sm font-medium text-terracotta-text">
                Target GPA
              </label>
              <input
                id="predictor-target"
                type="text"
                inputMode="decimal"
                // eslint-disable-next-line jsx-a11y/no-autofocus -- user just clicked "edit"; focusing the revealed field is the expected inline-edit pattern
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit();
                  if (e.key === "Escape") setEditing(false);
                }}
                className="w-20 rounded-control border border-terracotta-border bg-white px-2 py-1 text-sm font-semibold text-terracotta-text focus:border-terracotta"
              />
            </div>
          ) : (
            <p className="flex items-center gap-1.5 font-semibold text-terracotta-text">
              Could you reach a {target.toFixed(2)}?
              <button
                type="button"
                onClick={startEditing}
                className="flex h-6 w-6 items-center justify-center rounded-full text-terracotta transition-colors duration-140 hover:bg-white"
                aria-label="Change target GPA"
              >
                <Pencil size={12} aria-hidden="true" />
              </button>
            </p>
          )}
          <p className="mt-0.5 text-sm text-graphite-muted">
            Test future grades without changing this semester.
          </p>
          <p className="mt-1 text-sm text-terracotta-text">{statusInsight(gpa, target)}</p>
        </div>
      </div>

      <a
        href={predictorHref}
        className="group flex shrink-0 items-center justify-center gap-2 rounded-pill bg-terracotta px-5 py-2.5 text-[15px] font-semibold text-white transition-colors duration-160 hover:bg-terracotta-dark active:translate-y-0"
      >
        Open GPA Predictor
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="transition-transform duration-160 group-hover:translate-x-1"
        />
      </a>
    </motion.div>
  );
}
