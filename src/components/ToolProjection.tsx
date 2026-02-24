import { ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface ToolProjectionProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

/**
 * Central projection panel for tools.
 * Renders a floating glassmorphism panel in the center of the viewport
 * with a diagonal pop-out animation originating from bottom-left (tool drawer).
 */
const ToolProjection = ({ title, children, onClose }: ToolProjectionProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.3, x: "-40vw", y: "30vh" }}
    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
    exit={{ opacity: 0, scale: 0.3, x: "-40vw", y: "30vh" }}
    transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.8 }}
    className="fixed z-50 inset-0 flex items-center justify-center pointer-events-none"
  >
    <div
      className="pointer-events-auto w-[420px] max-w-[90vw] max-h-[70vh] flex flex-col
        rounded-sm border border-accent/40
        bg-background/90 backdrop-blur-2xl
        shadow-[0_0_60px_hsl(var(--accent)/0.18),0_0_20px_hsl(var(--accent)/0.10)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-accent/20">
        <span className="font-display text-xs tracking-[0.25em] text-foreground text-glow uppercase">
          {title}
        </span>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-sm flex items-center justify-center
            border border-accent/30 bg-accent/10
            hover:border-accent/60 hover:bg-accent/20 hover:shadow-[0_0_10px_hsl(var(--accent)/0.3)]
            transition-all duration-200 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 hud-scroll">
        {children}
      </div>
    </div>
  </motion.div>
);

export default ToolProjection;
