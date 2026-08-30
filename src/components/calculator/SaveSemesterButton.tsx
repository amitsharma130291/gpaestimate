import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Save, Check } from "lucide-react";

interface SaveSemesterButtonProps {
  onSave: () => void;
}

export function SaveSemesterButton({ onSave }: SaveSemesterButtonProps) {
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleClick = () => {
    onSave();
    setSaved(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-2 rounded-pill bg-pine-900 px-4 py-2 text-sm font-semibold text-cream transition-all duration-120 hover:-translate-y-px hover:bg-pine-800 active:translate-y-0"
      >
        {saved ? <Check size={16} aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
        {saved ? "Saved" : "Save semester"}
      </button>
      <AnimatePresence>
        {saved ? (
          <motion.span
            role="status"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="hidden text-sm text-graphite-muted sm:inline"
          >
            Stored on this device
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
