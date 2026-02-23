import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@/assets/logo.png";

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

    const chars = "01アイウエオカキクケコサシスセソ";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -100);

    const draw = () => {
      ctx.fillStyle = "rgba(5, 7, 15, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head character brighter
        ctx.fillStyle = `hsla(190, 100%, 75%, ${0.9})`;
        ctx.fillText(char, x, y);

        // Trail
        ctx.fillStyle = `hsla(190, 100%, 40%, 0.3)`;
        ctx.fillText(char, x, y - fontSize);

        drops[i] += 0.5 + Math.random() * 0.5;
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
      }
    };

    const interval = setInterval(draw, 45);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />;
};

const GlitchLogo = () => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  useEffect(() => {
    const scheduleGlitch = () => {
      const delay = 1500 + Math.random() * 2500;
      setTimeout(() => {
        const intensity = 1 + Math.random() * 2;
        setGlitchIntensity(intensity);
        setGlitchActive(true);
        setTimeout(() => {
          setGlitchActive(false);
          scheduleGlitch();
        }, 100 + Math.random() * 200);
      }, delay);
    };
    scheduleGlitch();
  }, []);

  return (
    <div className="relative w-52 h-52 md:w-72 md:h-72 overflow-hidden">
      {/* Main logo */}
      <motion.img
        src={logoImage}
        alt="Logo"
        className="absolute inset-0 w-full h-full object-contain z-10"
        animate={{
          x: glitchActive ? (Math.random() - 0.5) * glitchIntensity * 3 : 0,
          skewX: glitchActive ? (Math.random() - 0.5) * 2 : 0,
        }}
        transition={{ duration: 0.02 }}
      />

      {/* Cyan glitch layer */}
      <motion.img
        src={logoImage}
        alt=""
        className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none"
        style={{ filter: "hue-rotate(90deg) saturate(2.5)", mixBlendMode: "screen" }}
        animate={{
          x: glitchActive ? glitchIntensity * 4 : 0,
          opacity: glitchActive ? 0.6 : 0,
          clipPath: glitchActive
            ? `inset(${Math.random() * 40}% 0% ${Math.random() * 40}% 0%)`
            : "inset(0% 0% 100% 0%)",
        }}
        transition={{ duration: 0.02 }}
      />

      {/* Magenta glitch layer */}
      <motion.img
        src={logoImage}
        alt=""
        className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none"
        style={{ filter: "hue-rotate(-30deg) saturate(3)", mixBlendMode: "screen" }}
        animate={{
          x: glitchActive ? -glitchIntensity * 3 : 0,
          opacity: glitchActive ? 0.5 : 0,
          clipPath: glitchActive
            ? `inset(${Math.random() * 50}% 0% ${Math.random() * 30}% 0%)`
            : "inset(0% 0% 100% 0%)",
        }}
        transition={{ duration: 0.02 }}
      />
    </div>
  );
};

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const startTime = useRef(Date.now());
  const duration = 6000;

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startTime.current;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(onComplete, 300);
      }
    };
    requestAnimationFrame(tick);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <MatrixRain />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <GlitchLogo />

        <h1 className="font-display text-2xl md:text-3xl tracking-[0.3em] text-primary">
          IGORP FUCKN SYSTEM
        </h1>

        {/* Progress bar */}
        <div className="w-64 md:w-80">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, hsl(190 100% 50%), hsl(320 100% 50%))",
                width: `${progress * 100}%`,
              }}
            />
          </div>
          <p className="text-center mt-2 text-xs text-muted-foreground tracking-widest">
            INICIALIZANDO... {Math.floor(progress * 100)}%
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
