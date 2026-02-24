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

  // Exit sound - electric zap + descending whoosh
  const playExitSound = useCallback(() => {
    try {
      const ac = new AudioContext();
      // Electric zap - short burst
      const osc1 = ac.createOscillator();
      const g1 = ac.createGain();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(3000, ac.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.6);
      g1.gain.setValueAtTime(0.15, ac.currentTime);
      g1.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.7);
      osc1.connect(g1).connect(ac.destination);
      osc1.start();
      osc1.stop(ac.currentTime + 0.7);

      // Reverse reverb swoosh
      const bufLen = ac.sampleRate * 0.8;
      const buf = ac.createBuffer(2, bufLen, ac.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < bufLen; i++) {
          const t = i / bufLen;
          d[i] = (Math.random() * 2 - 1) * t * t * 0.4;
        }
      }
      const src = ac.createBufferSource();
      src.buffer = buf;
      const gn = ac.createGain();
      gn.gain.setValueAtTime(0.2, ac.currentTime);
      gn.gain.linearRampToValueAtTime(0, ac.currentTime + 0.8);
      const bp = ac.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(1500, ac.currentTime);
      bp.Q.setValueAtTime(2, ac.currentTime);
      src.connect(bp).connect(gn).connect(ac.destination);
      src.start();
    } catch {}
  }, []);

  // Progress sound - ascending digital hum that rises with progress
  useEffect(() => {
    let ac: AudioContext | null = null;
    let osc: OscillatorNode | null = null;
    let gain: GainNode | null = null;
    let tickOsc: OscillatorNode | null = null;
    let tickGain: GainNode | null = null;

    try {
      ac = new AudioContext();
      // Continuous rising tone
      osc = ac.createOscillator();
      gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(100, ac.currentTime);
      gain.gain.setValueAtTime(0, ac.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, ac.currentTime + 1);
      osc.connect(gain).connect(ac.destination);
      osc.start();

      // Ticking/scanning pulse
      tickOsc = ac.createOscillator();
      tickGain = ac.createGain();
      tickOsc.type = "square";
      tickOsc.frequency.setValueAtTime(8, ac.currentTime);
      tickGain.gain.setValueAtTime(0.015, ac.currentTime);
      const tickFilter = ac.createBiquadFilter();
      tickFilter.type = "bandpass";
      tickFilter.frequency.setValueAtTime(600, ac.currentTime);
      tickFilter.Q.setValueAtTime(5, ac.currentTime);
      tickOsc.connect(tickFilter).connect(tickGain).connect(ac.destination);
      tickOsc.start();
    } catch {}

    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / LOADING_DURATION, 1);
      setProgress(p);

      // Update rising frequency based on progress
      if (osc && ac) {
        osc.frequency.setValueAtTime(100 + p * 400, ac.currentTime);
      }
      if (gain && ac) {
        gain.gain.setValueAtTime(0.04 * (1 - p * 0.5), ac.currentTime);
      }

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        // Fade out progress sound
        if (gain && ac) {
          gain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.3);
        }
        if (tickGain && ac) {
          tickGain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.2);
        }
        setTimeout(() => {
          osc?.stop();
          tickOsc?.stop();
        }, 400);

        setPhase("shatter");
        playExitSound();
        setTimeout(() => {
          setPhase("done");
          setTimeout(() => onCompleteRef.current(), 400);
        }, 1000);
      }
    };
    requestAnimationFrame(tick);

    return () => {
      try {
        osc?.stop();
        tickOsc?.stop();
        ac?.close();
      } catch {}
    };
  }, [playExitSound]);

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

  // No canvas effect needed for new exit

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
            className="relative z-10 w-[260px] h-[260px] md:w-[380px] md:h-[380px] overflow-hidden rounded-full"
            animate={
              isShatter
                ? { scale: [1, 1.06, 0.9], opacity: [1, 0.7, 0], y: [0, -8, 20] }
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
                ? { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                : isBoot
                ? { duration: 1, ease: "easeInOut" }
                : isPulse
                ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.5 }
            }
          >
            {/* Exit scan effect INSIDE the logo */}
            {isShatter && (
              <>
                <motion.div
                  className="absolute inset-0 z-30 pointer-events-none"
                  style={{ background: "linear-gradient(180deg, transparent 0%, hsl(190 100% 60% / 0.2) 42%, hsl(190 100% 90% / 0.9) 49%, hsl(320 100% 70% / 0.7) 51%, hsl(190 100% 60% / 0.2) 58%, transparent 100%)" }}
                  initial={{ y: "-100%" }}
                  animate={{ y: "200%" }}
                  transition={{ duration: 0.5, ease: "easeIn" }}
                />
                <motion.div
                  className="absolute inset-0 z-25 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0.8, 0] }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{ background: "radial-gradient(circle, hsl(190 100% 70% / 0.6), transparent 70%)" }}
                />
              </>
            )}
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
