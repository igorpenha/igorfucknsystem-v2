import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@/assets/logo.png";

const LOADING_DURATION = 6000;
const CHARS = "01アイウエオカキクケコサシスセソタチツテトナニスネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
const COL_WIDTH = 10;
const FONT_SIZE = 14;

const GlitchLogo = () => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const scheduleGlitch = () => {
      const stableTime = 1200 + Math.random() * 2000;
      timeout = setTimeout(() => {
        const intensity = Math.random() < 0.3 ? 3 : Math.random() < 0.6 ? 2 : 1;
        setGlitchIntensity(intensity);
        setGlitchActive(true);

        const burstDuration = intensity === 3 ? 300 + Math.random() * 200 : 100 + Math.random() * 150;
        timeout = setTimeout(() => {
          setGlitchActive(false);
          scheduleGlitch();
        }, burstDuration);
      }, stableTime);
    };

    // Initial short glitch
    setTimeout(() => {
      setGlitchIntensity(2);
      setGlitchActive(true);
      setTimeout(() => {
        setGlitchActive(false);
        scheduleGlitch();
      }, 250);
    }, 800);

    return () => clearTimeout(timeout);
  }, []);

  const offsetX = glitchActive ? (Math.random() - 0.5) * glitchIntensity * 6 : 0;
  const offsetY = glitchActive ? (Math.random() - 0.5) * glitchIntensity * 3 : 0;
  const skewX = glitchActive ? (Math.random() - 0.5) * glitchIntensity * 2 : 0;

  return (
    <div className="relative mb-0 w-[270px] h-[270px] md:w-[374px] md:h-[374px] overflow-hidden">
      {/* Base logo */}
      <motion.img
        src={logoImage}
        alt="Logo"
        className="absolute inset-0 w-full h-full object-contain"
        animate={{
          x: offsetX,
          y: offsetY,
          skewX: skewX,
        }}
        transition={{ duration: 0.02 }}
      />

      {/* Red channel shift */}
      <motion.img
        src={logoImage}
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ mixBlendMode: "screen" }}
        animate={{
          x: glitchActive ? glitchIntensity * 4 + Math.random() * 3 : 0,
          opacity: glitchActive ? 0.6 : 0,
          filter: glitchActive ? "hue-rotate(-30deg) saturate(3) brightness(1.2)" : "none",
          clipPath: glitchActive
            ? `inset(${Math.random() * 40}% 0% ${Math.random() * 40}% 0%)`
            : "inset(0% 0% 100% 0%)",
        }}
        transition={{ duration: 0.02 }}
      />

      {/* Cyan channel shift */}
      <motion.img
        src={logoImage}
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ mixBlendMode: "screen" }}
        animate={{
          x: glitchActive ? -glitchIntensity * 5 - Math.random() * 3 : 0,
          opacity: glitchActive ? 0.5 : 0,
          filter: glitchActive ? "hue-rotate(160deg) saturate(2.5) brightness(1.1)" : "none",
          clipPath: glitchActive
            ? `inset(${20 + Math.random() * 30}% 0% ${10 + Math.random() * 30}% 0%)`
            : "inset(0% 0% 100% 0%)",
        }}
        transition={{ duration: 0.02 }}
      />

      {/* Horizontal slice displacement */}
      {glitchActive && glitchIntensity >= 2 && (
        <>
          <motion.img
            src={logoImage}
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{
              clipPath: `inset(${30 + Math.random() * 20}% 0% ${30 + Math.random() * 20}% 0%)`,
            }}
            animate={{
              x: (Math.random() - 0.5) * glitchIntensity * 12,
            }}
            transition={{ duration: 0.01 }}
          />
          <motion.img
            src={logoImage}
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{
              clipPath: `inset(${60 + Math.random() * 15}% 0% ${5 + Math.random() * 15}% 0%)`,
            }}
            animate={{
              x: (Math.random() - 0.5) * glitchIntensity * 10,
            }}
            transition={{ duration: 0.01 }}
          />
        </>
      )}

      {/* Scanline flicker overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
        }}
        animate={{
          opacity: glitchActive ? [0.4, 0.8, 0.3] : 0.15,
        }}
        transition={{ duration: 0.1 }}
      />

      {/* Connection loss noise bar */}
      {glitchActive && glitchIntensity === 3 && (
        <motion.div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: `${20 + Math.random() * 60}%`,
            height: `${2 + Math.random() * 6}%`,
            background: `linear-gradient(90deg,
              transparent ${Math.random() * 10}%,
              hsl(190 100% 70% / 0.4) ${10 + Math.random() * 20}%,
              hsl(300 80% 60% / 0.3) ${40 + Math.random() * 20}%,
              transparent ${80 + Math.random() * 20}%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 0] }}
          transition={{ duration: 0.15 }}
        />
      )}
    </div>
  );
};

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const cols = Math.ceil(canvas.width / COL_WIDTH);
    const drops = Array.from({ length: cols }, () => Math.random() * -50);

    const draw = () => {
      ctx.fillStyle = "rgba(5, 7, 10, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < cols; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * COL_WIDTH;
        const y = drops[i] * FONT_SIZE;

        ctx.font = `${FONT_SIZE}px 'Share Tech Mono', monospace`;
        ctx.fillStyle = `hsl(190 100% 75% / 0.9)`;
        ctx.fillText(char, x, y);

        if (drops[i] > 1) {
          ctx.fillStyle = `hsl(190 100% 50% / 0.25)`;
          ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y - FONT_SIZE);
        }

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5 + Math.random() * 0.5;
      }
    };

    const interval = setInterval(draw, 45);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-60"
    />
  );
};

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / LOADING_DURATION, 1);
      setProgress(p);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(onComplete, 400);
      }
    };
    requestAnimationFrame(tick);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {progress <= 1 && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MatrixRain />

          <GlitchLogo />

          <motion.h1
            className="font-display text-sm md:text-base text-foreground text-glow tracking-[0.3em] mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            IGOR FUCKN FILES
          </motion.h1>

          <div className="w-48 md:w-64 relative">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, hsl(190 100% 50%), hsl(270 80% 60%), hsl(190 100% 50%))",
                  backgroundSize: "200% 100%",
                  width: `${progress * 100}%`,
                }}
                animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
