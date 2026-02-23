import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@/assets/logo-new.png";

const LOADING_DURATION = 6000;

// Holographic ring - centered on the circular part of the logo (upper ~45% of image)
const HoloRing = ({ radius, delay, color, reverse }: { radius: number; delay: number; color: string; reverse?: boolean }) => (
  <motion.circle
    cx="250"
    cy="195"
    r={radius}
    fill="none"
    stroke={color}
    strokeWidth="0.6"
    strokeDasharray="6 3 1 3"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 0.5, 0.25, 0.5] }}
    transition={{ opacity: { duration: 2.5, repeat: Infinity, delay } }}
    style={{
      transformOrigin: "250px 195px",
      animation: `spin ${8 + delay * 4}s linear infinite ${reverse ? "reverse" : "normal"}`,
    }}
  />
);

// Digital noise canvas effect
const DigitalNoise = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 300;
    canvas.height = 300;

    let frame = 0;
    const draw = () => {
      if (frame % 3 === 0) {
        ctx.clearRect(0, 0, 300, 300);
        for (let i = 0; i < 40; i++) {
          const x = Math.random() * 300;
          const y = Math.random() * 300;
          const w = 1 + Math.random() * 4;
          const h = 1 + Math.random() * 2;
          const hue = Math.random() > 0.5 ? 190 : 320;
          ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${0.1 + Math.random() * 0.3})`;
          ctx.fillRect(x, y, w, h);
        }
      }
      frame++;
      requestAnimationFrame(draw);
    };
    const id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [active]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40 pointer-events-none mix-blend-screen" />;
};

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"boot" | "reveal" | "pulse" | "shatter" | "done">("boot");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Boot sound - synthesized
  useEffect(() => {
    try {
      const ac = new AudioContext();
      // Power-on sweep
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(80, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ac.currentTime + 0.8);
      osc.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 1.2);
      gain.gain.setValueAtTime(0, ac.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ac.currentTime + 0.1);
      gain.gain.linearRampToValueAtTime(0.08, ac.currentTime + 0.8);
      gain.gain.linearRampToValueAtTime(0, ac.currentTime + 1.5);
      osc.connect(gain).connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + 1.5);

      // Digital chirps
      setTimeout(() => {
        const osc2 = ac.createOscillator();
        const g2 = ac.createGain();
        osc2.type = "square";
        osc2.frequency.setValueAtTime(1200, ac.currentTime);
        osc2.frequency.setValueAtTime(800, ac.currentTime + 0.05);
        osc2.frequency.setValueAtTime(1500, ac.currentTime + 0.1);
        g2.gain.setValueAtTime(0.04, ac.currentTime);
        g2.gain.linearRampToValueAtTime(0, ac.currentTime + 0.15);
        osc2.connect(g2).connect(ac.destination);
        osc2.start();
        osc2.stop(ac.currentTime + 0.15);
      }, 600);

      // Hum loop
      setTimeout(() => {
        const osc3 = ac.createOscillator();
        const g3 = ac.createGain();
        osc3.type = "sawtooth";
        osc3.frequency.setValueAtTime(60, ac.currentTime);
        g3.gain.setValueAtTime(0, ac.currentTime);
        g3.gain.linearRampToValueAtTime(0.03, ac.currentTime + 0.5);
        g3.gain.linearRampToValueAtTime(0.02, ac.currentTime + 4);
        g3.gain.linearRampToValueAtTime(0, ac.currentTime + 5);
        osc3.connect(g3).connect(ac.destination);
        osc3.start();
        osc3.stop(ac.currentTime + 5);
      }, 1200);
    } catch {}
  }, []);

  // Shatter explosion sound
  const playShatterSound = useCallback(() => {
    try {
      const ac = new AudioContext();
      // Impact
      const bufferSize = ac.sampleRate * 0.5;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.08));
      }
      const noise = ac.createBufferSource();
      noise.buffer = buffer;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.25, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5);
      const filter = ac.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2000, ac.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 0.4);
      noise.connect(filter).connect(g).connect(ac.destination);
      noise.start();

      // Rising tone
      const osc = ac.createOscillator();
      const og = ac.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(200, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2000, ac.currentTime + 0.3);
      og.gain.setValueAtTime(0.12, ac.currentTime);
      og.gain.linearRampToValueAtTime(0, ac.currentTime + 0.4);
      osc.connect(og).connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + 0.4);
    } catch {}
  }, []);

  // Progress
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / LOADING_DURATION, 1);
      setProgress(p);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setPhase("shatter");
        playShatterSound();
        setTimeout(() => {
          setPhase("done");
          setTimeout(() => onCompleteRef.current(), 400);
        }, 1000);
      }
    };
    requestAnimationFrame(tick);
  }, [playShatterSound]);

  // Phase transitions
  useEffect(() => {
    if (phase === "boot") {
      const t1 = setTimeout(() => setPhase("reveal"), 1200);
      return () => clearTimeout(t1);
    }
    if (phase === "reveal") {
      const t2 = setTimeout(() => setPhase("pulse"), 1800);
      return () => clearTimeout(t2);
    }
  }, [phase]);

  // Exit effect: energy wave + dissolve
  useEffect(() => {
    if (phase !== "shatter") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    let waveRadius = 0;
    const maxRadius = Math.hypot(cx, cy) * 1.2;
    const startTime = Date.now();

    // Energy ring particles that ride the wave
    interface WaveParticle {
      angle: number;
      offset: number;
      size: number;
      hue: number;
      trail: number;
    }
    const waveParticles: WaveParticle[] = [];
    for (let i = 0; i < 80; i++) {
      waveParticles.push({
        angle: Math.random() * Math.PI * 2,
        offset: (Math.random() - 0.5) * 30,
        size: 1 + Math.random() * 2.5,
        hue: [190, 320, 50][Math.floor(Math.random() * 3)],
        trail: 0.3 + Math.random() * 0.7,
      });
    }

    const draw = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Expanding energy wave
      waveRadius = elapsed * 800;
      if (waveRadius > maxRadius) return;

      const waveAlpha = Math.max(0, 1 - waveRadius / maxRadius);

      // Outer glow ring
      ctx.beginPath();
      ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(190, 100%, 60%, ${waveAlpha * 0.6})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = "hsl(190, 100%, 60%)";
      ctx.shadowBlur = 20;
      ctx.stroke();

      // Inner magenta ring
      ctx.beginPath();
      ctx.arc(cx, cy, waveRadius * 0.95, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(320, 100%, 55%, ${waveAlpha * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "hsl(320, 100%, 55%)";
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Particles riding the wave
      for (const p of waveParticles) {
        const r = waveRadius + p.offset;
        if (r < 0) continue;
        const x = cx + Math.cos(p.angle) * r;
        const y = cy + Math.sin(p.angle) * r;
        const alpha = waveAlpha * p.trail;
        if (alpha <= 0) continue;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${alpha})`;
        ctx.shadowColor = `hsl(${p.hue}, 100%, 60%)`;
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Center dissolve - fading bright core
      if (elapsed < 0.4) {
        const coreAlpha = Math.max(0, 1 - elapsed / 0.4);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
        grad.addColorStop(0, `hsla(190, 100%, 80%, ${coreAlpha * 0.8})`);
        grad.addColorStop(0.3, `hsla(320, 100%, 60%, ${coreAlpha * 0.4})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(cx - 120, cy - 120, 240, 240);
      }

      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }, [phase]);

  const isBoot = phase === "boot";
  const isReveal = phase === "reveal";
  const isPulse = phase === "pulse";
  const isShatter = phase === "shatter";

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "hsl(230 25% 3%)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Shatter canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 z-40 pointer-events-none" />

          {/* Shatter flash - subtle */}
          {isShatter && (
            <motion.div
              className="absolute inset-0 z-30"
              style={{ background: "white" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0, 0.3, 0] }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}

          {/* Radial glow behind logo */}
          <motion.div
            className="absolute z-0"
            style={{
              width: 500,
              height: 500,
              borderRadius: "50%",
              background: "radial-gradient(circle, hsl(190 100% 50% / 0.08) 0%, hsl(320 100% 50% / 0.04) 40%, transparent 70%)",
            }}
            animate={
              isPulse ? { scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }
              : isShatter ? { scale: 2, opacity: 0 }
              : { scale: 1, opacity: isBoot ? 0 : 0.6 }
            }
            transition={
              isPulse ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.5 }
            }
          />

          {/* Holographic rings SVG - centered on circular part of logo */}
          <svg className="absolute z-[1] w-[260px] h-[260px] md:w-[380px] md:h-[380px] pointer-events-none" viewBox="0 0 500 500"
            style={{ marginTop: "-20px" }}
          >
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <HoloRing radius={115} delay={0} color="hsl(190, 100%, 50%)" />
            <HoloRing radius={125} delay={0.4} color="hsl(320, 100%, 50%)" reverse />
            <HoloRing radius={135} delay={0.8} color="hsl(50, 100%, 50%)" />
          </svg>

          {/* Logo container */}
          <motion.div
            className="relative z-10 w-[260px] h-[260px] md:w-[380px] md:h-[380px]"
            animate={
              isShatter
                ? { scale: 1.5, opacity: 0, filter: "brightness(5) blur(30px)", rotate: 15 }
                : isBoot
                ? { opacity: [0, 0.1, 0, 0.4, 0, 0.8, 0.5, 1], scale: [0.8, 0.85, 0.8, 0.9, 0.85, 1], rotate: [0, -1, 1, -0.5, 0] }
                : isReveal
                ? { opacity: 1, scale: 1, rotate: 0 }
                : isPulse
                ? { opacity: 1, scale: [1, 1.02, 1], rotate: 0 }
                : { opacity: 1, scale: 1 }
            }
            transition={
              isShatter
                ? { duration: 0.6, ease: "easeIn" }
                : isBoot
                ? { duration: 1, ease: "easeInOut" }
                : isPulse
                ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.5 }
            }
          >
            <DigitalNoise active={isBoot} />

            <img
              src={logoImage}
              alt="IGOR FUNK SYSTEM"
              className="w-full h-full object-contain relative z-10"
              style={{
                filter: isShatter
                  ? "drop-shadow(0 0 80px hsl(190 100% 50%)) drop-shadow(0 0 120px hsl(320 100% 50%)) drop-shadow(0 0 40px hsl(50 100% 50%))"
                  : isPulse
                  ? "drop-shadow(0 0 25px hsl(190 100% 50% / 0.6)) drop-shadow(0 0 50px hsl(320 100% 50% / 0.4)) drop-shadow(0 0 15px hsl(50 100% 50% / 0.3))"
                  : isBoot
                  ? "drop-shadow(0 0 4px hsl(190 100% 50% / 0.2)) grayscale(0.5)"
                  : "drop-shadow(0 0 15px hsl(190 100% 50% / 0.5)) drop-shadow(0 0 30px hsl(320 100% 50% / 0.3))",
                transition: "filter 0.3s ease",
              }}
            />

            {/* Chromatic aberration layers during boot */}
            {isBoot && (
              <>
                <motion.img
                  src={logoImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
                  style={{ mixBlendMode: "screen", filter: "hue-rotate(-60deg) saturate(3)" }}
                  animate={{ x: [0, 8, -5, 3, 0], opacity: [0, 0.6, 0.2, 0.4, 0], clipPath: ["inset(20% 0% 50% 0%)", "inset(40% 0% 30% 0%)", "inset(10% 0% 60% 0%)", "inset(30% 0% 40% 0%)"] }}
                  transition={{ duration: 0.8, repeat: 2 }}
                />
                <motion.img
                  src={logoImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
                  style={{ mixBlendMode: "screen", filter: "hue-rotate(120deg) saturate(2)" }}
                  animate={{ x: [0, -6, 4, -2, 0], opacity: [0, 0.4, 0.15, 0.3, 0], clipPath: ["inset(50% 0% 20% 0%)", "inset(30% 0% 40% 0%)", "inset(60% 0% 10% 0%)", "inset(45% 0% 25% 0%)"] }}
                  transition={{ duration: 0.6, repeat: 2, delay: 0.2 }}
                />
              </>
            )}
          </motion.div>

          {/* Title text */}
          <motion.div className="z-10 mt-4 text-center">
            <motion.h1
              className="font-display text-lg md:text-xl tracking-[0.4em] font-bold"
              style={{
                background: "linear-gradient(90deg, hsl(50 100% 55%), hsl(40 100% 50%), hsl(50 100% 60%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "none",
                filter: "drop-shadow(0 0 8px hsl(50 100% 50% / 0.5))",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={
                isShatter
                  ? { opacity: 0, y: -30, scale: 1.3 }
                  : isReveal || isPulse
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.5, delay: isReveal ? 0.3 : 0 }}
            >
              IGOR
            </motion.h1>
            <motion.p
              className="font-display text-xs md:text-sm tracking-[0.5em]"
              style={{ color: "hsl(190 100% 60%)", textShadow: "0 0 10px hsl(190 100% 50% / 0.5)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={
                isShatter
                  ? { opacity: 0, y: -20 }
                  : isReveal || isPulse
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 10 }
              }
              transition={{ duration: 0.5, delay: isReveal ? 0.6 : 0 }}
            >
              FUNK SYSTEM
            </motion.p>
          </motion.div>

          {/* Progress bar */}
          {!isShatter && (
            <motion.div
              className="w-52 md:w-72 mt-8 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "boot" ? 0 : 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-[2px] bg-muted/30 rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full relative"
                  style={{
                    background: "linear-gradient(90deg, hsl(320 100% 50%), hsl(190 100% 50%), hsl(50 100% 50%))",
                    backgroundSize: "300% 100%",
                    width: `${progress * 100}%`,
                  }}
                  animate={{ backgroundPosition: ["0% 0%", "300% 0%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                {/* Glow on progress tip */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                  style={{
                    left: `${progress * 100}%`,
                    background: "hsl(190 100% 60%)",
                    boxShadow: "0 0 12px hsl(190 100% 50%), 0 0 24px hsl(190 100% 50% / 0.5)",
                    transform: `translate(-50%, -50%)`,
                    opacity: progress > 0.01 ? 1 : 0,
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[8px] text-muted-foreground font-mono tracking-[0.2em]">SYSTEM BOOT</span>
                <span className="text-[8px] font-mono tracking-wider" style={{ color: "hsl(190 100% 60%)" }}>
                  {Math.round(progress * 100)}%
                </span>
              </div>
            </motion.div>
          )}

          {/* Decorative scan line */}
          <motion.div
            className="absolute left-0 right-0 h-[1px] z-20 pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, hsl(190 100% 50% / 0.4), transparent)" }}
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
