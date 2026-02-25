import { useState, useCallback, useRef } from "react";
import { Gauge } from "lucide-react";

interface Metric {
  label: string;
  unit: string;
  value: number;
  max: number;
  color: string;
  glow: string;
}

const METRICS_INIT: Metric[] = [
  { label: "PING", unit: "ms", value: 0, max: 120, color: "hsl(var(--accent))", glow: "var(--accent)" },
  { label: "DOWNLOAD", unit: "Mbps", value: 0, max: 500, color: "hsl(var(--primary))", glow: "var(--primary)" },
  { label: "UPLOAD", unit: "Mbps", value: 0, max: 200, color: "hsl(50 100% 55%)", glow: "50 100% 55%" },
];

const SpeedTest = () => {
  const [metrics, setMetrics] = useState<Metric[]>(METRICS_INIT);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<string | null>(null);
  const cancelled = useRef(false);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const animateMetric = useCallback(async (index: number, target: number, duration: number) => {
    const steps = 30;
    const interval = duration / steps;
    for (let i = 1; i <= steps; i++) {
      if (cancelled.current) return;
      const progress = i / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const jitter = (Math.random() - 0.5) * target * 0.15;
      const current = i === steps ? target : Math.max(0, target * eased + jitter);
      setMetrics((prev) => prev.map((m, idx) => (idx === index ? { ...m, value: Math.round(current * 10) / 10 } : m)));
      await sleep(interval);
    }
  }, []);

  const runTest = useCallback(async () => {
    cancelled.current = false;
    setRunning(true);
    setMetrics(METRICS_INIT);

    // Ping
    setPhase("MEDINDO PING...");
    await animateMetric(0, 12 + Math.random() * 30, 2000);

    if (cancelled.current) return;

    // Download
    setPhase("TESTANDO DOWNLOAD...");
    await animateMetric(1, 80 + Math.random() * 350, 3000);

    if (cancelled.current) return;

    // Upload
    setPhase("TESTANDO UPLOAD...");
    await animateMetric(2, 30 + Math.random() * 150, 3000);

    setPhase("VARREDURA COMPLETA");
    setRunning(false);
  }, [animateMetric]);

  return (
    <div className="flex flex-col gap-4">
      {/* Meters */}
      <div className="flex flex-col gap-3">
        {metrics.map((m) => {
          const pct = Math.min(100, (m.value / m.max) * 100);
          return (
            <div key={m.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-display text-[9px] tracking-[0.25em] text-muted-foreground">{m.label}</span>
                <span
                  className="font-mono text-sm font-bold tabular-nums"
                  style={{ color: m.color, textShadow: `0 0 10px ${m.color}` }}
                >
                  {m.value.toFixed(1)}
                  <span className="text-[9px] ml-1 text-muted-foreground font-display">{m.unit}</span>
                </span>
              </div>
              <div className="h-2.5 w-full rounded-sm overflow-hidden bg-muted/30 border border-border/40">
                <div
                  className="h-full rounded-sm transition-all duration-150 ease-out"
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
          <span className="font-display text-[9px] tracking-[0.3em] text-accent animate-pulse">{phase}</span>
        </div>
      )}

      {/* Start button */}
      <button
        onClick={running ? () => { cancelled.current = true; setRunning(false); setPhase(null); } : runTest}
        className={`w-full py-2.5 rounded-sm font-display text-[10px] tracking-[0.3em] uppercase transition-all duration-300 border
          ${running
            ? "border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20"
            : "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 hover:border-accent/70 hover:shadow-[0_0_20px_hsl(var(--accent)/0.25)]"
          }`}
      >
        <span className="flex items-center justify-center gap-2">
          <Gauge className="w-3.5 h-3.5" />
          {running ? "CANCELAR" : "INICIAR VARREDURA"}
        </span>
      </button>
    </div>
  );
};

export default SpeedTest;
