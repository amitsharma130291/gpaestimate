import { AnimatePresence, motion } from "motion/react";

interface MobileStickyGpaBarProps {
  visible: boolean;
  gpa: number;
  totalCredits: number;
}

export function MobileStickyGpaBar({ visible, gpa, totalCredits }: MobileStickyGpaBarProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between rounded-pill bg-pine-950 px-5 py-3 text-cream shadow-[var(--shadow-header-scrolled)] lg:hidden"
          role="status"
        >
          <span className="text-sm text-cream-muted">Live GPA · {totalCredits} credits</span>
          <span className="tabular-nums text-xl font-bold">{gpa.toFixed(2)}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
