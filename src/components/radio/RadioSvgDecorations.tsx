import { motion } from "framer-motion";

const RadioSvgDecorations = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Corner circuit patterns - top left */}
    <svg className="absolute top-1 left-1 w-16 h-16 opacity-15" viewBox="0 0 64 64" fill="none">
      <motion.path
        d="M0 32 H16 L20 28 H32 L36 32 H48"
        stroke="hsl(var(--primary))"
        strokeWidth="0.5"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <motion.path
        d="M16 0 V12 L20 16 V28"
        stroke="hsl(var(--primary))"
        strokeWidth="0.5"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
      />
      <motion.circle cx="20" cy="28" r="2" fill="hsl(var(--primary))" animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.circle cx="36" cy="32" r="1.5" fill="hsl(var(--accent))" animate={{ opacity: [0.1, 0.6, 0.1] }} transition={{ duration: 2.5, repeat: Infinity }} />
    </svg>

    {/* Corner circuit - bottom right */}
    <svg className="absolute bottom-1 right-1 w-16 h-16 opacity-15 rotate-180" viewBox="0 0 64 64" fill="none">
      <motion.path
        d="M0 32 H16 L20 28 H32 L36 32 H48"
        stroke="hsl(var(--accent))"
        strokeWidth="0.5"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 0.5 }}
      />
      <motion.circle cx="20" cy="28" r="2" fill="hsl(var(--accent))" animate={{ opacity: [0.1, 0.7, 0.1] }} transition={{ duration: 3, repeat: Infinity }} />
    </svg>

    {/* Rotating HUD element - top right */}
    <motion.svg
      className="absolute top-3 right-3 w-10 h-10 opacity-10"
      viewBox="0 0 40 40" fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="20" cy="20" r="18" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeDasharray="4 8" />
      <circle cx="20" cy="20" r="12" stroke="hsl(var(--accent))" strokeWidth="0.3" strokeDasharray="2 6" />
      <line x1="20" y1="2" x2="20" y2="8" stroke="hsl(var(--primary))" strokeWidth="0.5" />
      <line x1="38" y1="20" x2="32" y2="20" stroke="hsl(var(--primary))" strokeWidth="0.5" />
    </motion.svg>

    {/* Pulsing soundwave lines - left edge */}
    <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-32 opacity-20" viewBox="0 0 12 128" fill="none">
      {[0, 1, 2, 3, 4].map(i => (
        <motion.line
          key={i}
          x1="6" y1={i * 28 + 10} x2="6" y2={i * 28 + 24}
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          strokeLinecap="round"
          animate={{ scaleY: [0.5, 1.5, 0.5], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        />
      ))}
    </svg>

    {/* Pulsing soundwave lines - right edge */}
    <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-32 opacity-20" viewBox="0 0 12 128" fill="none">
      {[0, 1, 2, 3, 4].map(i => (
        <motion.line
          key={i}
          x1="6" y1={i * 28 + 10} x2="6" y2={i * 28 + 24}
          stroke="hsl(var(--accent))"
          strokeWidth="1"
          strokeLinecap="round"
          animate={{ scaleY: [0.5, 1.5, 0.5], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.8 + i * 0.25, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        />
      ))}
    </svg>

    {/* Bottom scanline pulse */}
    <motion.div
      className="absolute bottom-0 left-0 w-full h-px"
      style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), transparent)" }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  </div>
);

export default RadioSvgDecorations;
