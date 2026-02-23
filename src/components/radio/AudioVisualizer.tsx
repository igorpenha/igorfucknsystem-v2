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

    const BAR_COUNT = 32;
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
          const startFrac = Math.pow(i / BAR_COUNT, 1.3);
          const endFrac = Math.pow((i + 1) / BAR_COUNT, 1.3);
          const startBin = Math.floor(startFrac * totalBins * 0.75);
          const endBin = Math.max(Math.floor(endFrac * totalBins * 0.75), startBin + 1);

          let sum = 0;
          for (let b = startBin; b < endBin; b++) sum += dataArray[b];
          let avg = sum / ((endBin - startBin) * 255);

          const t = i / BAR_COUNT;
          const highAtten = t > 0.6 ? 1 - (t - 0.6) * 0.5 : 1;
          avg = Math.pow(avg, 0.65) * highAtten;

          smoothRef.current[i] = smoothRef.current[i] * 0.5 + avg * 0.5;
        }
      } else {
        for (let i = 0; i < BAR_COUNT; i++) {
          smoothRef.current[i] *= 0.9;
        }
      }

      const barW = w / BAR_COUNT;
      for (let i = 0; i < BAR_COUNT; i++) {
        const val = smoothRef.current[i];
        const barH = Math.max(val * h * 0.55, 2);
        const barTop = h - barH;
        const x = i * barW;

        // Magenta → Cyan gradient
        const hue = 320 - (i / BAR_COUNT) * 130; // 320 (magenta) → 190 (cyan)
        const gradient = ctx.createLinearGradient(x, barTop, x, h);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 65%, ${0.6 + val * 0.4})`);
        gradient.addColorStop(1, `hsla(${hue}, 80%, 25%, 0.2)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, barTop, barW - 1, barH);
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [analyser, playing]);

  return (
    <div className="h-16 border-t border-border/30">
      <canvas ref={canvasRef} width={320} height={64} className="w-full h-full" />
    </div>
  );
};

export default AudioVisualizer;
