import { useEffect, useRef } from "react";

const BASE_SPEED = 0.15;
const MAX_SPEED = 6;
const LERP_UP = 0.25;
const LERP_DOWN = 0.015;

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

    interface Star { x: number; y: number; z: number; size: number; opacity: number; isMagenta: boolean; }
    const stars: Star[] = [];
    const STAR_COUNT = 180;

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
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        isMagenta: Math.random() > 0.6,
      });
    }

    // Grid animation offset
    let gridOffset = 0;

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

      // === SYNTHWAVE GRID FLOOR ===
      const gridY = h * 0.7;
      const gridH = h - gridY;
      gridOffset = (gridOffset + currentSpeed * 0.8) % 40;

      ctx.save();
      // Horizontal lines with perspective
      const lineCount = 15;
      for (let i = 0; i <= lineCount; i++) {
        const t = i / lineCount;
        const perspY = gridY + gridH * Math.pow(t, 0.6);
        const alpha = 0.06 + t * 0.12;
        ctx.beginPath();
        ctx.moveTo(0, perspY + gridOffset * t * 0.5);
        ctx.lineTo(w, perspY + gridOffset * t * 0.5);
        ctx.strokeStyle = `hsla(320, 100%, 50%, ${alpha})`;
        ctx.lineWidth = 0.5 + t * 0.5;
        ctx.stroke();
      }
      // Vertical converging lines
      const vLines = 20;
      for (let i = 0; i <= vLines; i++) {
        const t = i / vLines;
        const topX = cx + (t - 0.5) * w * 0.3;
        const botX = t * w;
        const alpha = 0.04 + Math.abs(t - 0.5) * 0.08;
        ctx.beginPath();
        ctx.moveTo(topX, gridY);
        ctx.lineTo(botX, h);
        ctx.strokeStyle = `hsla(190, 100%, 50%, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.restore();

      // === STARS ===
      for (const star of stars) {
        const prevZ = star.z;
        star.z -= currentSpeed;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * w * 2;
          star.y = (Math.random() - 0.5) * h * 2;
          star.isMagenta = Math.random() > 0.6;
        }

        const sx = (star.x / star.z) * 300 + cx;
        const sy = (star.y / star.z) * 300 + cy;
        const r = (1 - star.z / 1000) * star.size * 2;
        const a = (1 - star.z / 1000) * star.opacity;

        const hue = star.isMagenta ? 320 : 190;

        if (streakMode) {
          const trailSteps = speedRatio > 0.5 ? 6 : speedRatio > 0.2 ? 3 : 1;
          const trailLength = 2 + speedRatio * 12;

          for (let t = trailSteps; t >= 1; t--) {
            const tZ = star.z + currentSpeed * trailLength * (t / trailSteps);
            const tsx = (star.x / tZ) * 300 + cx;
            const tsy = (star.y / tZ) * 300 + cy;
            const ta = a * (0.4 * (1 - t / (trailSteps + 1)));
            const tw = Math.max(r * (1.5 - t / trailSteps), 0.4);

            ctx.beginPath();
            ctx.moveTo(tsx, tsy);
            ctx.lineTo(sx, sy);
            ctx.strokeStyle = `hsla(${hue}, 90%, 75%, ${ta})`;
            ctx.lineWidth = tw;
            ctx.stroke();
          }

          const psx = (star.x / prevZ) * 300 + cx;
          const psy = (star.y / prevZ) * 300 + cy;
          ctx.beginPath();
          ctx.moveTo(psx, psy);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = `hsla(${hue}, 90%, 85%, ${a * (0.8 + speedRatio * 0.2)})`;
          ctx.lineWidth = Math.max(r * (1 + speedRatio * 2), 0.8);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(r, 0.3), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, 75%, ${a})`;
        ctx.fill();

        if (r > 1) {
          const glowSize = r * (2.5 + speedRatio * 2);
          ctx.beginPath();
          ctx.arc(sx, sy, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${a * (0.15 + speedRatio * 0.1)})`;
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
      style={{ opacity: 0.6 }}
    />
  );
};

export default SpaceBackground;
