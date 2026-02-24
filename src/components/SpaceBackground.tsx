import { useEffect, useRef } from "react";

const BASE_SPEED = 0.15;
const MAX_SPEED = 8;
const LERP_UP = 0.25;
const LERP_DOWN = 0.015;
const STAR_COUNT = 220;

const SpaceBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let currentSpeed = BASE_SPEED;
    let targetSpeed = BASE_SPEED;
    let radioPlaying = false;

    interface Star {
      x: number; y: number; z: number;
      size: number; opacity: number; isMagenta: boolean;
    }
    const stars: Star[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * canvas.width * 2,
        y: (Math.random() - 0.5) * canvas.height * 2,
        z: Math.random() * 1000,
        size: Math.random() * 1.8 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        isMagenta: Math.random() > 0.6,
      });
    }

    const onRadioState = (e: Event) => {
      radioPlaying = (e as CustomEvent).detail?.playing;
      if (!radioPlaying) targetSpeed = BASE_SPEED;
    };
    const onRadioEnergy = (e: Event) => {
      const energy = (e as CustomEvent).detail?.energy ?? 0;
      if (radioPlaying) targetSpeed = BASE_SPEED + energy * (MAX_SPEED - BASE_SPEED);
    };

    window.addEventListener("radio-state", onRadioState);
    window.addEventListener("radio-energy", onRadioEnergy);

    const draw = () => {
      const lerp = targetSpeed > currentSpeed ? LERP_UP : LERP_DOWN;
      currentSpeed += (targetSpeed - currentSpeed) * lerp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const w = canvas.width;
      const h = canvas.height;

      const speedRatio = Math.min((currentSpeed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED), 1);
      const streakMode = currentSpeed > 0.4;

      for (const star of stars) {
        const prevZ = star.z;
        star.z -= currentSpeed * 1.5;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * w * 2;
          star.y = (Math.random() - 0.5) * h * 2;
          star.isMagenta = Math.random() > 0.6;
        }

        const sx = (star.x / star.z) * 300 + cx;
        const sy = (star.y / star.z) * 300 + cy;
        const depth = 1 - star.z / 1000;
        const r = depth * star.size * 2.5;
        const a = depth * star.opacity;

        const hue = star.isMagenta ? 320 : 190;

        if (streakMode) {
          const trailLength = 3 + speedRatio * 18;
          const trailSteps = speedRatio > 0.5 ? 8 : speedRatio > 0.2 ? 4 : 2;

          // Outer glow trail
          for (let t = trailSteps; t >= 1; t--) {
            const tZ = star.z + currentSpeed * 1.5 * trailLength * (t / trailSteps);
            if (tZ > 1000) continue;
            const tsx = (star.x / tZ) * 300 + cx;
            const tsy = (star.y / tZ) * 300 + cy;
            const ta = a * (0.3 * (1 - t / (trailSteps + 1)));
            const tw = Math.max(r * (1.8 - t / trailSteps), 0.3);

            ctx.beginPath();
            ctx.moveTo(tsx, tsy);
            ctx.lineTo(sx, sy);
            ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${ta})`;
            ctx.lineWidth = tw;
            ctx.stroke();
          }

          // Core streak line
          const psx = (star.x / prevZ) * 300 + cx;
          const psy = (star.y / prevZ) * 300 + cy;
          ctx.beginPath();
          ctx.moveTo(psx, psy);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = `hsla(${hue}, 100%, 85%, ${a * (0.9 + speedRatio * 0.1)})`;
          ctx.lineWidth = Math.max(r * (1.2 + speedRatio * 2.5), 0.8);
          ctx.stroke();
        }

        // Star dot
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(r, 0.4), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, 80%, ${a})`;
        ctx.fill();

        // Glow halo
        if (r > 0.8) {
          const glowSize = r * (3 + speedRatio * 3);
          ctx.beginPath();
          ctx.arc(sx, sy, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${a * (0.12 + speedRatio * 0.15)})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("radio-state", onRadioState);
      window.removeEventListener("radio-energy", onRadioEnergy);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.75 }}
    />
  );
};

export default SpaceBackground;
