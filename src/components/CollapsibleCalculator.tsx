import { useState } from "react";
import { ChevronUp, Calculator as CalcIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Calculator from "@/components/Calculator";

const CollapsibleCalculator = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Calculator panel floats upward */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: 10, scaleY: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute bottom-full left-0 right-0 mb-1 z-20"
            style={{ transformOrigin: "bottom center" }}
          >
            <div className="hud-panel rounded-sm p-3 scanlines border-primary/30">
              <Calculator />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="hud-panel rounded-sm w-full flex items-center gap-2 px-4 py-2.5 transition-colors hover:bg-primary/5 scanlines"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
        <CalcIcon className="w-3.5 h-3.5 text-secondary" />
        <h3 className="font-display text-xs uppercase tracking-[0.25em] text-foreground text-glow flex-1 text-left">
          Calculator
        </h3>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronUp className="w-4 h-4 text-primary" />
        </motion.div>
      </button>
    </div>
  );
};

export default CollapsibleCalculator;
