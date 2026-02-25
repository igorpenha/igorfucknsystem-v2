import { useState, useEffect, useRef, useCallback } from "react";
import { HardDrive, Cpu, ArrowUp, ArrowDown, Network, MemoryStick, Activity } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { FILE_API_BASE_URL } from "@/config/api";

interface SystemData {
  ram: { total: number; used: number; percent: number };
  temp: number | "N/A";
  hd: { percent: number | null; total: number | null; used: number | null };
  ping: number | null;
  network: { download: number; upload: number };
}

const widgetsMeta = [
  { key: "hd", icon: HardDrive, label: "HD", color: "hsl(120,100%,45%)" },
  { key: "temp", icon: Cpu, label: "TEMP.", color: "hsl(15,100%,55%)" },
  { key: "ram", icon: MemoryStick, label: "RAM", color: "hsl(260,100%,65%)" },
  { key: "rede", icon: null, label: "REDE", color: "hsl(50,100%,50%)" },
  { key: "ping", icon: Network, label: "PING", color: "hsl(50,100%,55%)" },
  { key: "uptime", icon: Activity, label: "UPTIME", color: "hsl(160,100%,45%)" },
] as const;

function formatValue(key: string, data: SystemData | null): React.ReactNode {
  if (!data) return "—";
  switch (key) {
    case "hd":
      return data.hd.percent != null ? `${data.hd.percent}%` : "N/A";
    case "temp":
      return data.temp !== "N/A" ? `${data.temp}°C` : "N/A";
    case "ram":
      return `${data.ram.used}G / ${data.ram.total}G`;
    case "ping":
      return data.ping != null ? `${data.ping} ms` : "N/A";
    default:
      return "—";
  }
}

function formatSubline(key: string, data: SystemData | null): string | null {
  if (!data) return null;
  switch (key) {
    case "hd":
      return data.hd.used != null && data.hd.total != null ? `${data.hd.used} GB / ${data.hd.total} GB` : null;
    case "ram":
      return `${data.ram.percent}% em uso`;
    default:
      return null;
  }
}

const InfoWidgets = () => {
  const dataRef = useRef<SystemData | null>(null);
  const [, forceRender] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const r = await fetch(`${FILE_API_BASE_URL}/api/system-info`);
      if (!r.ok) return;
      const json = await r.json();
      dataRef.current = json;
      forceRender((n) => n + 1);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 3000);
    return () => clearInterval(id);
  }, [fetchData]);

  const data = dataRef.current;

  return (
    <>
      <style>{`
        @keyframes iconGlowIntense {
          0%, 100% { filter: drop-shadow(0 0 6px var(--glow)) drop-shadow(0 0 2px var(--glow)) brightness(0.95); }
          50% { filter: drop-shadow(0 0 18px var(--glow)) drop-shadow(0 0 36px var(--glow)) drop-shadow(0 0 8px var(--glow)) brightness(1.8) saturate(1.4); }
        }
      `}</style>
      <div className="grid grid-cols-3 grid-rows-2 gap-1 h-full">
        {widgetsMeta.map((w, i) => (
          <Popover key={w.key}>
            <PopoverTrigger asChild>
              <button
                className="bg-muted/40 rounded-sm border border-border/60 flex items-center justify-center
                  hover:border-[var(--btn-color)] hover:bg-[var(--btn-color)]/10
                  hover:shadow-[0_0_16px_var(--btn-color-alpha)]
                  active:scale-90 active:brightness-75 active:translate-y-[1px]
                  transition-all duration-150 cursor-pointer outline-none"
                style={{
                  "--btn-color": w.color,
                  "--btn-color-alpha": w.color.replace(")", "/0.25)").replace("hsl(", "hsla("),
                } as React.CSSProperties}
              >
                {w.key === "rede" ? (
                  <div className="flex flex-col items-center gap-0">
                    <ArrowUp
                      className="w-3.5 h-3.5"
                      style={{ color: w.color, "--glow": w.color, animation: `iconGlowIntense 2s ease-in-out ${i * 0.3}s infinite` } as React.CSSProperties}
                    />
                    <ArrowDown
                      className="w-3.5 h-3.5"
                      style={{ color: w.color, "--glow": w.color, animation: `iconGlowIntense 2s ease-in-out ${i * 0.3 + 0.3}s infinite` } as React.CSSProperties}
                    />
                  </div>
                ) : (
                  w.icon && (
                    <w.icon
                      className="w-5 h-5"
                      style={{ color: w.color, "--glow": w.color, animation: `iconGlowIntense 2s ease-in-out ${i * 0.3}s infinite` } as React.CSSProperties}
                    />
                  )
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              sideOffset={8}
              className="w-auto min-w-[120px] p-0 border rounded-sm overflow-hidden"
              style={{
                background: "hsla(230,20%,6%,0.85)",
                backdropFilter: "blur(20px)",
                borderColor: w.color.replace(")", "/0.4)").replace("hsl(", "hsla("),
                boxShadow: `0 0 20px ${w.color.replace(")", "/0.15)").replace("hsl(", "hsla(")}, inset 0 1px 0 ${w.color.replace(")", "/0.1)").replace("hsl(", "hsla(")}`,
              }}
            >
              <div className="px-3 py-1.5 border-b text-center" style={{ borderColor: w.color.replace(")", "/0.2)").replace("hsl(", "hsla(") }}>
                <span className="text-[9px] font-display tracking-[0.25em]" style={{ color: w.color }}>{w.label}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 px-3 py-2.5">
                {w.key === "rede" ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <ArrowDown className="w-3 h-3" style={{ color: w.color }} />
                      <span className="text-sm font-display font-bold" style={{ color: w.color }}>
                        {data ? `${data.network.download} MB/s` : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ArrowUp className="w-3 h-3" style={{ color: w.color }} />
                      <span className="text-sm font-display font-bold" style={{ color: w.color }}>
                        {data ? `${data.network.upload} MB/s` : "—"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 justify-center">
                      {w.icon && <w.icon className="w-4 h-4" style={{ color: w.color }} />}
                      <span className="text-lg font-display font-bold" style={{ color: w.color }}>
                        {formatValue(w.key, data)}
                      </span>
                    </div>
                    {formatSubline(w.key, data) && (
                      <span className="text-[9px] text-muted-foreground tracking-wider">{formatSubline(w.key, data)}</span>
                    )}
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </>
  );
};

export default InfoWidgets;
