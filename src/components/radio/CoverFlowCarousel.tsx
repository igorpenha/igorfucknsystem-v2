import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CoverFlowCarouselProps {
  currentCover: string;
  prevCover: string;
  nextCover: string;
  playing: boolean;
  /** Incremented each time track changes to trigger the spin animation */
  transitionKey: number;
}

const COVER_SIZE = 80;
const SIDE_SCALE = 0.65;
const SIDE_OFFSET = 60;
const Y_ROTATION = 45;

const CoverFlowCarousel = ({
  currentCover,
  prevCover,
  nextCover,
  playing,
  transitionKey,
}: CoverFlowCarouselProps) => {
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Reset errors when covers change
  useEffect(() => {
    setErrors({});
  }, [currentCover, prevCover, nextCover]);

  const handleError = (key: string) => {
    setErrors(prev => ({ ...prev, [key]: true }));
  };

  const Placeholder = () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1"
      style={{ background: "hsl(var(--muted) / 0.2)" }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-15">
        <circle cx="12" cy="12" r="10" stroke="hsl(var(--primary))" strokeWidth="1" />
        <circle cx="12" cy="12" r="3" stroke="hsl(var(--primary))" strokeWidth="1" />
      </svg>
      <span className="text-[5px] text-muted-foreground/15 tracking-[0.3em]">NO DATA</span>
    </div>
  );

  const coverStyle = (position: "left" | "center" | "right") => {
    const base: React.CSSProperties = {
      width: COVER_SIZE,
      height: COVER_SIZE,
      position: "absolute",
      top: "50%",
      left: "50%",
      overflow: "hidden",
      backfaceVisibility: "hidden",
      transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    };

    if (position === "center") {
      return {
        ...base,
        transform: `translate(-50%, -50%) scale(1) rotateY(0deg)`,
        zIndex: 10,
        opacity: 1,
        clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
        borderColor: playing ? "hsl(var(--primary))" : "hsl(var(--border))",
        boxShadow: playing
          ? "0 0 24px hsl(var(--primary) / 0.4), 0 0 48px hsl(var(--primary) / 0.15), 0 0 80px hsl(var(--primary) / 0.08)"
          : "0 4px 20px hsl(0 0% 0% / 0.5)",
        border: `1px solid ${playing ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
      };
    }

    if (position === "left") {
      return {
        ...base,
        transform: `translate(calc(-50% - ${SIDE_OFFSET}px), -50%) scale(${SIDE_SCALE}) rotateY(${Y_ROTATION}deg)`,
        zIndex: 5,
        opacity: 0.45,
        clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
        border: "1px solid hsl(var(--border) / 0.3)",
        boxShadow: "0 2px 12px hsl(0 0% 0% / 0.4)",
      };
    }

    // right
    return {
      ...base,
      transform: `translate(calc(-50% + ${SIDE_OFFSET}px), -50%) scale(${SIDE_SCALE}) rotateY(-${Y_ROTATION}deg)`,
      zIndex: 5,
      opacity: 0.45,
      clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
      border: "1px solid hsl(var(--border) / 0.3)",
      boxShadow: "0 2px 12px hsl(0 0% 0% / 0.4)",
    };
  };

  return (
    <div
      className="relative w-full"
      style={{
        perspective: "800px",
        perspectiveOrigin: "50% 50%",
        height: COVER_SIZE + 16,
      }}
    >
      {/* Reflection / ground glow */}
      {playing && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 rounded-full pointer-events-none"
          style={{
            width: COVER_SIZE * 0.8,
            height: 6,
            background: "radial-gradient(ellipse, hsl(var(--primary) / 0.25) 0%, transparent 70%)",
            filter: "blur(4px)",
          }}
        />
      )}

      {/* LEFT — previous cover */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`prev-${transitionKey}`}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.5 }}
          style={coverStyle("left")}
        >
          {prevCover && !errors.prev ? (
            <img src={prevCover} alt="Previous" className="w-full h-full object-cover" onError={() => handleError("prev")} />
          ) : (
            <Placeholder />
          )}
        </motion.div>
      </AnimatePresence>

      {/* CENTER — current cover */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`curr-${transitionKey}`}
          initial={{ opacity: 0, scale: 0.8, rotateY: -45 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotateY: 45 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={coverStyle("center")}
        >
          {currentCover && !errors.current ? (
            <img src={currentCover} alt="Now playing" className="w-full h-full object-cover" onError={() => handleError("current")} />
          ) : (
            <Placeholder />
          )}
          {/* Neon scan line over center cover */}
          {playing && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.06) 48%, hsl(var(--primary) / 0.15) 50%, hsl(var(--primary) / 0.06) 52%, transparent 100%)",
              }}
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* RIGHT — next cover */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`next-${transitionKey}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.5 }}
          style={coverStyle("right")}
        >
          {nextCover && !errors.next ? (
            <img src={nextCover} alt="Next" className="w-full h-full object-cover" onError={() => handleError("next")} />
          ) : (
            <Placeholder />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CoverFlowCarousel;
