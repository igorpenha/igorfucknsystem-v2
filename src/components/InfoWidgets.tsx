import { useState } from "react";
import { HardDrive, Cpu, ArrowUp, ArrowDown, Network, MemoryStick, Activity } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const widgets = [
  { key: "hd", icon: HardDrive, label: "HD", value: "72%", color: "hsl(120,100%,45%)" },
  { key: "temp", icon: Cpu, label: "TEMP.", value: "45°C", color: "hsl(15,100%,55%)" },
  { key: "ram", icon: MemoryStick, label: "RAM", value: "6.2G", color: "hsl(260,100%,65%)" },
  { key: "rede", icon: null, label: "REDE", value: null, color: "hsl(50,100%,50%)" },
  { key: "ips", icon: Network, label: "IPS", value: "14", color: "hsl(50,100%,55%)" },
  { key: "uptime", icon: Activity, label: "UPTIME", value: "72d", color: "hsl(160,100%,45%)" },
] as const;

const InfoWidgets = () => {
  return (
    <>
      <style>{`
        @keyframes iconGlowIntense {
          0%, 100% { filter: drop-shadow(0 0 6px var(--glow)) drop-shadow(0 0 2px var(--glow)) brightness(0.95); }
          50% { filter: drop-shadow(0 0 18px var(--glow)) drop-shadow(0 0 36px var(--glow)) drop-shadow(0 0 8px var(--glow)) brightness(1.8) saturate(1.4); }
        }
      `}</style>
      <div className="grid grid-cols-3 grid-rows-2 gap-1 h-full">
        {widgets.map((w, i) => (
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
              <div className="flex items-center gap-2 px-3 py-2.5 justify-center">
                {w.key === "rede" ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <ArrowUp className="w-3 h-3" style={{ color: w.color }} />
                      <span className="text-sm font-display font-bold" style={{ color: w.color }}>150 Mbps</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ArrowDown className="w-3 h-3" style={{ color: w.color }} />
                      <span className="text-sm font-display font-bold" style={{ color: w.color }}>420 Mbps</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {w.icon && <w.icon className="w-4 h-4" style={{ color: w.color }} />}
                    <span className="text-lg font-display font-bold" style={{ color: w.color }}>{w.value}</span>
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
