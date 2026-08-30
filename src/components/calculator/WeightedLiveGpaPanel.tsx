import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface WeightedLiveGpaPanelProps {
  weightedGpa: number;
  unweightedGpa: number;
  totalCredits: number;
  note?: string;
}

export function WeightedLiveGpaPanel({
  weightedGpa,
  unweightedGpa,
  totalCredits,
  note = "Weighted adds bonus points for Honors and AP/IB courses; unweighted stays on the plain 4.0 scale.",
}: WeightedLiveGpaPanelProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const animatedWeighted = useAnimatedNumber(weightedGpa, 450);
  const animatedUnweighted = useAnimatedNumber(unweightedGpa, 400);
  const animatedCredits = useAnimatedNumber(totalCredits, 350);

  const [updateVersion, setUpdateVersion] = useState(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setUpdateVersion((v) => v + 1);
  }, [weightedGpa, unweightedGpa, totalCredits]);

  const pulse = prefersReducedMotion ? undefined : { scale: [1, 1.02, 1] as number[] };
  const dotPulse = prefersReducedMotion
    ? undefined
    : { scale: [1, 1.7, 1] as number[], opacity: [1, 0.5, 1] as number[] };

  return (
    <div className="flex h-full flex-col rounded-panel bg-pine-950 p-4 text-cream sm:p-5">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-cream-muted">
        Weighted GPA
      </p>

      <motion.p
        key={`w-gpa-${updateVersion}`}
        animate={pulse}
        transition={{ duration: 0.45 }}
        className="tabular-nums mt-1.5 text-center text-7xl font-bold leading-none text-cream sm:text-8xl"
        aria-hidden="true"
      >
        {animatedWeighted.toFixed(2)}
      </motion.p>

      <div className="mt-2.5 flex items-center justify-center gap-2">
        <motion.span
          key={`w-dot-${updateVersion}`}
          animate={dotPulse}
          transition={{ duration: 0.5 }}
          className="h-2 w-2 rounded-full bg-chartreuse"
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-cream">Updated now</span>
      </div>

      <div className="mt-3.5 grid grid-cols-2 divide-x divide-pine-700 border-t border-pine-700 pt-3 text-center">
        <div>
          <p className="tabular-nums text-3xl font-semibold text-cream">
            {animatedUnweighted.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-cream-muted">unweighted</p>
        </div>
        <div>
          <p className="tabular-nums text-3xl font-semibold text-cream">
            {Math.round(animatedCredits)}
          </p>
          <p className="mt-1 text-sm text-cream-muted">credits</p>
        </div>
      </div>

      <p className="mt-auto pt-4 text-center text-xs text-cream-muted">{note}</p>
    </div>
  );
}
