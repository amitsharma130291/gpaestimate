import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const EASE_STANDARD = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Interpolates a displayed number toward `target` over `durationMs`,
 * skipping animation entirely when the user prefers reduced motion.
 */
export function useAnimatedNumber(target: number, durationMs = 400): number {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(target);
  const frame = useRef<number | undefined>(undefined);
  const fromValue = useRef(target);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const from = fromValue.current;
    if (from === target) return;

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = EASE_STANDARD(progress);
      const value = from + (target - from) * eased;
      setDisplay(value);

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        fromValue.current = target;
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      fromValue.current = target;
    };
  }, [target, durationMs, prefersReducedMotion]);

  return prefersReducedMotion ? target : display;
}
