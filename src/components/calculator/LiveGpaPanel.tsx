import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { GpaStandingScale } from "./GpaStandingScale";

interface LiveGpaPanelProps {
  gpa: number;
  totalCredits: number;
  totalQualityPoints: number;
}

export function LiveGpaPanel({ gpa, totalCredits, totalQualityPoints }: LiveGpaPanelProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const animatedGpa = useAnimatedNumber(gpa, 450);
  const animatedCredits = useAnimatedNumber(totalCredits, 350);
  const animatedPoints = useAnimatedNumber(totalQualityPoints, 350);

  const [updateVersion, setUpdateVersion] = useState(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setUpdateVersion((v) => v + 1);
  }, [gpa, totalCredits, totalQualityPoints]);

  const pulse = prefersReducedMotion
    ? undefined
    : { scale: [1, 1.02, 1] as number[] };
  const dotPulse = prefersReducedMotion
    ? undefined
    : { scale: [1, 1.7, 1] as number[], opacity: [1, 0.5, 1] as number[] };

  return (
    <div className="flex h-full flex-col rounded-panel bg-pine-950 p-4 text-cream sm:p-5">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-cream-muted">
        Live GPA
      </p>

      <motion.p
        key={`gpa-${updateVersion}`}
        animate={pulse}
        transition={{ duration: 0.45 }}
        className="tabular-nums mt-1.5 text-center text-7xl font-bold leading-none text-cream sm:text-8xl"
        aria-hidden="true"
      >
        {animatedGpa.toFixed(2)}
      </motion.p>

      <div className="mt-2.5 flex items-center justify-center gap-2">
        <motion.span
          key={`dot-${updateVersion}`}
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
            {Math.round(animatedCredits)}
          </p>
          <p className="mt-1 text-sm text-cream-muted">credits</p>
        </div>
        <div>
          <p className="tabular-nums text-3xl font-semibold text-cream">
            {animatedPoints.toFixed(1)}
          </p>
          <p className="mt-1 text-sm text-cream-muted">quality points</p>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <GpaStandingScale gpa={gpa} />
      </div>
    </div>
  );
}
