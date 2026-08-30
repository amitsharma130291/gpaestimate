// Test-only stand-in for `motion/react` that strips animation behavior so
// interaction tests can assert on state/DOM without racing real timers.
import { createElement, forwardRef } from "react";
import type { ReactNode } from "react";

const MOTION_PROP_KEYS = new Set([
  "initial",
  "animate",
  "exit",
  "transition",
  "layout",
  "layoutId",
  "whileHover",
  "whileTap",
  "whileFocus",
  "onAnimationComplete",
  "variants",
]);

function stripMotionProps(props: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!MOTION_PROP_KEYS.has(key)) clean[key] = value;
  }
  return clean;
}

function createMotionComponent(tag: string) {
  return forwardRef<HTMLElement, Record<string, unknown>>((props, ref) => {
    const { children, onAnimationComplete, ...rest } = props as {
      children?: ReactNode;
      onAnimationComplete?: () => void;
    } & Record<string, unknown>;
    if (typeof onAnimationComplete === "function") {
      queueMicrotask(onAnimationComplete);
    }
    return createElement(tag, { ...stripMotionProps(rest), ref }, children);
  });
}

// Cache one component per tag so repeated `motion.input` access returns the
// same component type across renders — otherwise React treats each access as
// a new element type and remounts (dropping focus/value) on every re-render.
const componentCache = new Map<string, ReturnType<typeof createMotionComponent>>();

export const motion = new Proxy(
  {},
  {
    get: (_target, tag: string) => {
      let component = componentCache.get(tag);
      if (!component) {
        component = createMotionComponent(tag);
        componentCache.set(tag, component);
      }
      return component;
    },
  }
) as Record<string, ReturnType<typeof createMotionComponent>>;

export function AnimatePresence({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
