import { AnimatePresence, motion } from "motion/react";
import { classifyGpaStanding, STANDING_DISCLAIMER } from "@/lib/standingScale";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { InfoTooltip } from "./InfoTooltip";

interface GpaStandingScaleProps {
  gpa: number;
}

const SCALE_MIN = 2.0;
const SCALE_MAX = 4.0;
const TICKS = [2.0, 3.0, 3.5, 4.0];

function toPercent(value: number): number {
  const clamped = Math.min(Math.max(value, SCALE_MIN), SCALE_MAX);
  return ((clamped - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
}

export function GpaStandingScale({ gpa }: GpaStandingScaleProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const standing = classifyGpaStanding(gpa);
  const percent = toPercent(gpa);
  const transition = prefersReducedMotion
    ? { duration: 0.08 }
    : { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div>
      <div className="flex justify-between text-xs text-cream-muted">
        {TICKS.map((tick) => (
          <span key={tick}>{tick.toFixed(1)}</span>
        ))}
      </div>

      <div className="relative mt-2 h-1.5 rounded-pill bg-pine-700">
        <motion.div
          className="absolute inset-y-0 left-0 w-full origin-left rounded-pill bg-chartreuse"
          initial={false}
          animate={{ scaleX: percent / 100 }}
          transition={transition}
        />
        <motion.div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-chartreuse bg-pine-950 shadow-[0_0_0_4px_rgba(212,242,78,0.18)]"
          initial={false}
          animate={{ left: `${percent}%` }}
          style={{ marginLeft: "-8px" }}
          transition={transition}
        />
      </div>

      <div className="mt-3 flex h-5 items-center justify-center gap-1.5 text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={standing.label}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.08 : 0.18 }}
            className="text-sm font-medium text-cream"
          >
            {standing.label}
          </motion.p>
        </AnimatePresence>
        <InfoTooltip label="Why standing ranges vary" tone="dark">
          {STANDING_DISCLAIMER}
        </InfoTooltip>
      </div>
    </div>
  );
}
