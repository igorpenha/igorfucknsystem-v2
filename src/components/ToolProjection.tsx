import { ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface ToolProjectionProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}

const ToolProjection = ({ title, children, onClose, wide }: ToolProjectionProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
    className="fixed z-50 inset-0 flex items-center justify-center"
  >
    <motion.div
      initial={{ backdropFilter: "blur(0px)" }}
      animate={{ backdropFilter: "blur(12px)" }}
      exit={{ backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0"
      onClick={onClose}
    />

    <motion.div
      initial={{ opacity: 0, scale: 0.15, x: "-42vw", y: "38vh" }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.15, x: "-42vw", y: "38vh" }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 18,
        mass: 0.7,
        restDelta: 0.5,
      }}
      className={`relative z-10 max-w-[92vw] max-h-[85vh] flex flex-col
        rounded-sm border border-accent/50
        bg-background/92 backdrop-blur-2xl
        shadow-[0_0_80px_hsl(var(--accent)/0.2),0_0_30px_hsl(var(--accent)/0.12),inset_0_1px_0_hsl(var(--accent)/0.1)]
        ${wide ? "w-[720px]" : "w-[440px]"}`}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-accent/25">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.6)] animate-pulse" />
          <span className="font-display text-xs tracking-[0.25em] text-foreground text-glow uppercase">
            {title}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-sm flex items-center justify-center
            border border-accent/30 bg-accent/10
            hover:border-accent/60 hover:bg-accent/25 hover:shadow-[0_0_12px_hsl(var(--accent)/0.35)]
            transition-all duration-200 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 hud-scroll">
        {children}
      </div>
    </motion.div>
  </motion.div>
);

export default ToolProjection;
