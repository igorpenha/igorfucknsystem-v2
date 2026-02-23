import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@/assets/logo.png";

const LOADING_DURATION = 5000;

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"flicker" | "stable" | "overload" | "done">("flicker");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Progress timer
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / LOADING_DURATION, 1);
      setProgress(p);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setPhase("overload");
        setTimeout(() => {
          setPhase("done");
          setTimeout(onComplete, 300);
        }, 800);
      }
    };
    requestAnimationFrame(tick);
  }, [onComplete]);

  // Flicker → stable transition
  useEffect(() => {
    if (phase === "flicker") {
      const t = setTimeout(() => setPhase("stable"), 1500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Particle dissolve on overload
  useEffect(() => {
    if (phase !== "overload") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface P { x: number; y: number; vx: number; vy: number; size: number; alpha: number; hue: number; }
    const particles: P[] = [];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      particles.push({
        x: cx + (Math.random() - 0.5) * 200,
        y: cy + (Math.random() - 0.5) * 200,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 3,
        alpha: 1,
        hue: Math.random() > 0.5 ? 190 : 320,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;
        if (p.alpha <= 0) continue;
        alive = true;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.alpha})`;
        ctx.fill();
      }
      if (alive) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }, [phase]);

  const isFlickering = phase === "flicker";
  const isOverload = phase === "overload";

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "hsl(230 25% 4%)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overload particle canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 z-30 pointer-events-none" />

          {/* Overload flash */}
          {isOverload && (
            <motion.div
              className="absolute inset-0 z-20 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0.3, 0.7, 0] }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          )}

          {/* Logo with neon flicker */}
          <motion.div
            className="relative w-[280px] h-[280px] md:w-[400px] md:h-[400px] z-10"
            animate={
              isOverload
                ? { scale: 1.3, opacity: 0, filter: "brightness(4) blur(20px)" }
                : isFlickering
                ? { opacity: [0, 0.3, 0, 0.6, 0, 1, 0.7, 1] }
                : { opacity: 1 }
            }
            transition={
              isOverload
                ? { duration: 0.5 }
                : isFlickering
                ? { duration: 1.2, ease: "easeInOut" }
                : { duration: 0.3 }
            }
          >
            <img
              src={logoImage}
              alt="IGOR FUCKN FILES"
              className="w-full h-full object-contain"
              style={{
                filter: isOverload
                  ? "drop-shadow(0 0 60px hsl(190 100% 50%)) drop-shadow(0 0 120px hsl(320 100% 50%))"
                  : isFlickering
                  ? "drop-shadow(0 0 4px hsl(190 100% 50% / 0.3))"
                  : "drop-shadow(0 0 20px hsl(190 100% 50% / 0.5)) drop-shadow(0 0 40px hsl(320 100% 50% / 0.3))",
              }}
            />

            {/* Glitch slices during flicker */}
            {isFlickering && (
              <>
                <motion.img
                  src={logoImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  style={{ mixBlendMode: "screen", clipPath: "inset(30% 0% 40% 0%)" }}
                  animate={{ x: [0, 6, -4, 0], opacity: [0, 0.5, 0.3, 0] }}
                  transition={{ duration: 0.8, repeat: 2 }}
                />
              </>
            )}
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-display text-sm md:text-base tracking-[0.3em] mb-6 z-10"
            style={{ color: "hsl(50 100% 50%)", textShadow: "0 0 12px hsl(50 100% 50% / 0.6), 0 0 30px hsl(50 100% 50% / 0.3)" }}
            initial={{ opacity: 0 }}
            animate={isOverload ? { opacity: 0 } : { opacity: phase === "stable" ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            IGOR FUCKN FILES
          </motion.h1>

          {/* Progress bar */}
          {!isOverload && (
            <div className="w-48 md:w-64 relative z-10">
              <div className="h-[3px] bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, hsl(190 100% 50%), hsl(320 100% 50%), hsl(50 100% 50%))",
                    backgroundSize: "200% 100%",
                    width: `${progress * 100}%`,
                  }}
                  animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[8px] text-muted-foreground font-mono tracking-wider">BOOT SEQUENCE</span>
                <span className="text-[8px] text-primary font-mono">{Math.round(progress * 100)}%</span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
