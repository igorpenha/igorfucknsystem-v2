import { useState, useCallback, useRef, useEffect } from "react";
import { Gauge } from "lucide-react";
import { FILE_API_BASE_URL } from "@/config/api";

interface Metric {
  label: string;
  unit: string;
  value: number;
  max: number;
  color: string;
}

const METRICS_INIT: Metric[] = [
  { label: "PING", unit: "ms", value: 0, max: 120, color: "hsl(var(--accent))" },
  { label: "DOWNLOAD", unit: "Mbps", value: 0, max: 500, color: "hsl(var(--primary))" },
  { label: "UPLOAD", unit: "Mbps", value: 0, max: 200, color: "hsl(50 100% 55%)" },
];

const SpeedTest = () => {
  const [metrics, setMetrics] = useState<Metric[]>(METRICS_INIT);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<string | null>(null);
  const [decoding, setDecoding] = useState(false);
  const decodingRef = useRef(false);
  const cancelled = useRef(false);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // Decoding effect: random numbers flicker while waiting for API
  useEffect(() => {
    if (!decoding) return;
    decodingRef.current = true;
    let frame: number;
    const tick = () => {
      if (!decodingRef.current) return;
      setMetrics((prev) =>
        prev.map((m) => ({
          ...m,
          value: Math.round(Math.random() * m.max * 10) / 10,
        }))
      );
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      decodingRef.current = false;
      cancelAnimationFrame(frame);
    };
  }, [decoding]);

  const animateToValue = useCallback(async (index: number, target: number) => {
    const steps = 25;
    const duration = 600;
    const interval = duration / steps;
    for (let i = 1; i <= steps; i++) {
      if (cancelled.current) return;
      const eased = 1 - Math.pow(1 - i / steps, 3);
      const current = i === steps ? target : target * eased;
      setMetrics((prev) =>
        prev.map((m, idx) =>
          idx === index ? { ...m, value: Math.round(current * 10) / 10 } : m
        )
      );
      await sleep(interval);
    }
  }, []);

  const runTest = useCallback(async () => {
    cancelled.current = false;
    setRunning(true);
    setMetrics(METRICS_INIT);
    setPhase("CONECTANDO AO SATÉLITE...");
    setDecoding(true);

    try {
      const res = await fetch(`${FILE_API_BASE_URL}/api/speedtest`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      // Stop decoding, lock real values with animation
      setDecoding(false);
      setMetrics(METRICS_INIT); // reset before animating

      setPhase("DECODIFICANDO PING...");
      await animateToValue(0, parseFloat(data.ping));

      if (cancelled.current) return;
      setPhase("DECODIFICANDO DOWNLOAD...");
      await animateToValue(1, parseFloat(data.download));

      if (cancelled.current) return;
      setPhase("DECODIFICANDO UPLOAD...");
      await animateToValue(2, parseFloat(data.upload));

      setPhase("VARREDURA COMPLETA");
    } catch {
      setDecoding(false);
      setPhase("FALHA NA CONEXÃO");
      setMetrics(METRICS_INIT);
    }
    setRunning(false);
  }, [animateToValue]);

  const handleCancel = () => {
    cancelled.current = true;
    decodingRef.current = false;
    setDecoding(false);
    setRunning(false);
    setPhase(null);
    setMetrics(METRICS_INIT);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Meters */}
      <div className="flex flex-col gap-3">
        {metrics.map((m) => {
          const pct = Math.min(100, (m.value / m.max) * 100);
          return (
            <div key={m.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-display text-[9px] tracking-[0.25em] text-muted-foreground">
                  {m.label}
                </span>
                <span
                  className={`font-mono text-sm font-bold tabular-nums ${decoding ? "animate-pulse" : ""}`}
                  style={{ color: m.color, textShadow: `0 0 10px ${m.color}` }}
                >
                  {m.value.toFixed(1)}
                  <span className="text-[9px] ml-1 text-muted-foreground font-display">
                    {m.unit}
                  </span>
                </span>
              </div>
              <div className="h-2.5 w-full rounded-sm overflow-hidden bg-muted/30 border border-border/40">
                <div
                  className={`h-full rounded-sm transition-all duration-150 ease-out ${decoding ? "animate-pulse" : ""}`}
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${m.color}44, ${m.color})`,
                    boxShadow: `0 0 12px ${m.color}, inset 0 0 4px ${m.color}88`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Phase */}
      {phase && (
        <div className="text-center">
          <span className={`font-display text-[9px] tracking-[0.3em] text-accent ${running ? "animate-pulse" : ""}`}>
            {phase}
          </span>
        </div>
      )}

      {/* Start button */}
      <button
        onClick={running ? handleCancel : runTest}
        className={`w-full py-2.5 rounded-sm font-display text-[10px] tracking-[0.3em] uppercase transition-all duration-300 border
          ${running
            ? "border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 animate-pulse"
            : "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 hover:border-accent/70 hover:shadow-[0_0_20px_hsl(var(--accent)/0.25)]"
          }`}
      >
        <span className="flex items-center justify-center gap-2">
          <Gauge className="w-3.5 h-3.5" />
          {running ? "RASTREANDO REDE..." : "INICIAR VARREDURA"}
        </span>
      </button>
    </div>
  );
};

export default SpeedTest;
