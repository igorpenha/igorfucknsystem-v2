import { useEffect, useRef } from "react";

const BASE_SPEED = 0.15;
const MAX_SPEED = 18;
const LERP_UP = 0.45;
const LERP_DOWN = 0.012;
const STAR_COUNT = 140;

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
    let bassEnergy = 0;
    let smoothBass = 0;

    interface Star {
      x: number; y: number; z: number;
      size: number; opacity: number;
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
        x: (Math.random() - 0.5) * canvas.width * 2.5,
        y: (Math.random() - 0.5) * canvas.height * 2.5,
        z: Math.random() * 1000,
        size: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }

    const onRadioState = (e: Event) => {
      radioPlaying = (e as CustomEvent).detail?.playing;
      if (!radioPlaying) targetSpeed = BASE_SPEED;
    };
    const onRadioEnergy = (e: Event) => {
      bassEnergy = (e as CustomEvent).detail?.energy ?? 0;
    };

    window.addEventListener("radio-state", onRadioState);
    window.addEventListener("radio-energy", onRadioEnergy);

    const draw = () => {
      smoothBass += (bassEnergy - smoothBass) * 0.35;

      if (radioPlaying) {
        const basePlaying = 2.5;
        const bassBoost = Math.pow(smoothBass, 0.7) * (MAX_SPEED - basePlaying);
        targetSpeed = basePlaying + bassBoost;
      }

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
        star.z -= currentSpeed * 2;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * w * 2.5;
          star.y = (Math.random() - 0.5) * h * 2.5;
        }

        const sx = (star.x / star.z) * 400 + cx;
        const sy = (star.y / star.z) * 400 + cy;
        const depth = 1 - star.z / 1000;
        const r = depth * star.size * 1.8;
        const a = depth * star.opacity;

        if (streakMode) {
          const trailLength = 4 + speedRatio * 30;
          const trailSteps = speedRatio > 0.5 ? 12 : speedRatio > 0.2 ? 7 : 4;

          // Tapered comet tail — thins and fades from head to tip
          for (let t = trailSteps; t >= 1; t--) {
            const progress = t / (trailSteps + 1); // 1 = far tip, 0 = head
            const tZ = star.z + currentSpeed * 2 * trailLength * (t / trailSteps);
            if (tZ > 1000) continue;
            const tsx = (star.x / tZ) * 400 + cx;
            const tsy = (star.y / tZ) * 400 + cy;

            // Next segment closer to head
            const nextT = t - 1;
            const nextZ = nextT === 0
              ? star.z
              : star.z + currentSpeed * 2 * trailLength * (nextT / trailSteps);
            const nsx = (star.x / nextZ) * 400 + cx;
            const nsy = (star.y / nextZ) * 400 + cy;

            // Fade and thin towards tip
            const segAlpha = a * 0.4 * (1 - progress);
            const segWidth = Math.max(r * (1.6 - progress * 1.4) * (1 + speedRatio * 0.6), 0.15);

            ctx.beginPath();
            ctx.moveTo(tsx, tsy);
            ctx.lineTo(nsx, nsy);
            ctx.strokeStyle = `rgba(210, 215, 225, ${segAlpha})`;
            ctx.lineWidth = segWidth;
            ctx.stroke();
          }

          // Core streak — bright white head line
          const prevZ = star.z + currentSpeed * 2;
          const psx = (star.x / prevZ) * 400 + cx;
          const psy = (star.y / prevZ) * 400 + cy;
          ctx.beginPath();
          ctx.moveTo(psx, psy);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = `rgba(240, 242, 248, ${a * (0.9 + speedRatio * 0.1)})`;
          ctx.lineWidth = Math.max(r * (1.0 + speedRatio * 1.5), 0.4);
          ctx.stroke();
        }

        // Star dot — white/matte head
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(r, 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235, 238, 245, ${a})`;
        ctx.fill();

        // Glow halo — soft white
        if (r > 0.8) {
          const glowSize = r * (3.5 + speedRatio * 5);
          ctx.beginPath();
          ctx.arc(sx, sy, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(220, 225, 235, ${a * (0.1 + speedRatio * 0.15)})`;
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
      style={{ opacity: 0.85 }}
    />
  );
};

export default SpaceBackground;
