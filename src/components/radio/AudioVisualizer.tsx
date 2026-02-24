import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  playing: boolean;
}

const AudioVisualizer = ({ analyser, playing }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smoothRef = useRef<number[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
    };
    resize();
    window.addEventListener("resize", resize);

    const BAR_COUNT = 48;
    if (smoothRef.current.length !== BAR_COUNT) {
      smoothRef.current = new Array(BAR_COUNT).fill(0);
    }

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (analyser && playing) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const totalBins = dataArray.length;

        for (let i = 0; i < BAR_COUNT; i++) {
          const startFrac = Math.pow(i / BAR_COUNT, 1.4);
          const endFrac = Math.pow((i + 1) / BAR_COUNT, 1.4);
          const startBin = Math.floor(startFrac * totalBins * 0.8);
          const endBin = Math.max(Math.floor(endFrac * totalBins * 0.8), startBin + 1);

          let sum = 0;
          for (let b = startBin; b < endBin; b++) sum += dataArray[b];
          let avg = sum / ((endBin - startBin) * 255);

          const t = i / BAR_COUNT;
          const att = t > 0.65 ? 1 - (t - 0.65) * 0.6 : 1;
          avg = Math.pow(avg, 0.55) * att * 1.3;

          smoothRef.current[i] = smoothRef.current[i] * 0.35 + avg * 0.65;
        }
      } else {
        for (let i = 0; i < BAR_COUNT; i++) {
          smoothRef.current[i] *= 0.88;
        }
      }

      const gap = 1.5;
      const barW = (w - gap * (BAR_COUNT - 1)) / BAR_COUNT;

      for (let i = 0; i < BAR_COUNT; i++) {
        const val = smoothRef.current[i];
        const barH = Math.max(val * h * 0.85, 1.5);
        const x = i * (barW + gap);
        const barTop = h - barH;

        // Cyan → Magenta gradient per bar
        const hue = 190 + (i / BAR_COUNT) * 130; // 190 (cyan) → 320 (magenta)
        const saturation = 100;
        const lightness = 50 + val * 20;
        const alpha = 0.5 + val * 0.5;

        const grad = ctx.createLinearGradient(x, barTop, x, h);
        grad.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`);
        grad.addColorStop(1, `hsla(${hue}, ${saturation}%, 20%, 0.1)`);

        ctx.fillStyle = grad;

        // Rounded top
        const radius = Math.min(barW / 2, 3);
        ctx.beginPath();
        ctx.moveTo(x + radius, barTop);
        ctx.lineTo(x + barW - radius, barTop);
        ctx.quadraticCurveTo(x + barW, barTop, x + barW, barTop + radius);
        ctx.lineTo(x + barW, h);
        ctx.lineTo(x, h);
        ctx.lineTo(x, barTop + radius);
        ctx.quadraticCurveTo(x, barTop, x + radius, barTop);
        ctx.closePath();
        ctx.fill();

        // Glow on high-energy bars
        if (val > 0.4) {
          ctx.shadowColor = `hsla(${hue}, 100%, 60%, ${val * 0.6})`;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [analyser, playing]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
};

export default AudioVisualizer;
