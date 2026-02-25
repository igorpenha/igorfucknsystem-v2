import { HardDrive, Cpu, ArrowUp, ArrowDown, Network, MemoryStick, Activity } from "lucide-react";

const InfoWidgets = () => {
  return (
    <>
      <style>{`
        @keyframes iconGlowIntense {
          0%, 100% { filter: drop-shadow(0 0 6px var(--glow)) drop-shadow(0 0 2px var(--glow)) brightness(0.95); }
          50% { filter: drop-shadow(0 0 18px var(--glow)) drop-shadow(0 0 36px var(--glow)) drop-shadow(0 0 8px var(--glow)) brightness(1.8) saturate(1.4); }
        }
      `}</style>
      <div className="grid grid-cols-3 grid-rows-2 gap-0.5 h-full">
        {/* HD */}
        <div className="bg-muted/50 rounded-sm border border-border overflow-hidden flex flex-col">
          <div className="px-1 py-0.5 border-b border-primary/20 bg-primary/[0.06] text-center">
            <span className="text-[6px] font-display tracking-[0.2em] text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]">HD</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 flex-1">
            <HardDrive
              className="w-3 h-3 shrink-0 text-[hsl(120,100%,45%)]"
              style={{ "--glow": "hsl(120,100%,45%)", animation: "iconGlowIntense 2s ease-in-out infinite" } as React.CSSProperties}
            />
            <span className="text-[8px] font-display text-[hsl(120,100%,45%)]">72%</span>
          </div>
        </div>

        {/* TEMP */}
        <div className="bg-muted/50 rounded-sm border border-border overflow-hidden flex flex-col">
          <div className="px-1 py-0.5 border-b border-primary/20 bg-primary/[0.06] text-center">
            <span className="text-[6px] font-display tracking-[0.2em] text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]">TEMP.</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 flex-1">
            <Cpu
              className="w-3 h-3 shrink-0 text-[hsl(15,100%,55%)]"
              style={{ "--glow": "hsl(15,100%,55%)", animation: "iconGlowIntense 2s ease-in-out 0.5s infinite" } as React.CSSProperties}
            />
            <span className="text-[8px] font-display text-[hsl(15,100%,55%)]">45°C</span>
          </div>
        </div>

        {/* RAM */}
        <div className="bg-muted/50 rounded-sm border border-border overflow-hidden flex flex-col">
          <div className="px-1 py-0.5 border-b border-primary/20 bg-primary/[0.06] text-center">
            <span className="text-[6px] font-display tracking-[0.2em] text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]">RAM</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 flex-1">
            <MemoryStick
              className="w-3 h-3 shrink-0 text-[hsl(260,100%,65%)]"
              style={{ "--glow": "hsl(260,100%,65%)", animation: "iconGlowIntense 2s ease-in-out 0.3s infinite" } as React.CSSProperties}
            />
            <span className="text-[8px] font-display text-[hsl(260,100%,65%)]">6.2G</span>
          </div>
        </div>

        {/* REDE */}
        <div className="bg-muted/50 rounded-sm border border-border overflow-hidden flex flex-col">
          <div className="px-1 py-0.5 border-b border-primary/20 bg-primary/[0.06] text-center">
            <span className="text-[6px] font-display tracking-[0.2em] text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]">REDE</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 flex-1">
            <div className="flex flex-col gap-0">
              <div className="flex items-center gap-0.5">
                <ArrowUp className="w-2 h-2 text-accent" style={{ "--glow": "hsl(50,100%,50%)", animation: "iconGlowIntense 2s ease-in-out 1s infinite" } as React.CSSProperties} />
                <span className="text-[7px] font-display text-accent">150M</span>
              </div>
              <div className="flex items-center gap-0.5">
                <ArrowDown className="w-2 h-2 text-accent" style={{ "--glow": "hsl(50,100%,50%)", animation: "iconGlowIntense 2s ease-in-out 1.3s infinite" } as React.CSSProperties} />
                <span className="text-[7px] font-display text-accent">420M</span>
              </div>
            </div>
          </div>
        </div>

        {/* IPS */}
        <div className="bg-muted/50 rounded-sm border border-border overflow-hidden flex flex-col">
          <div className="px-1 py-0.5 border-b border-primary/20 bg-primary/[0.06] text-center">
            <span className="text-[6px] font-display tracking-[0.2em] text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]">IPS</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 flex-1">
            <Network
              className="w-3 h-3 shrink-0 text-[hsl(50,100%,55%)]"
              style={{ "--glow": "hsl(50,100%,55%)", animation: "iconGlowIntense 2s ease-in-out 1.6s infinite" } as React.CSSProperties}
            />
            <span className="text-[8px] font-display text-[hsl(50,100%,55%)]">14</span>
          </div>
        </div>

        {/* UPTIME */}
        <div className="bg-muted/50 rounded-sm border border-border overflow-hidden flex flex-col">
          <div className="px-1 py-0.5 border-b border-primary/20 bg-primary/[0.06] text-center">
            <span className="text-[6px] font-display tracking-[0.2em] text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]">UPTIME</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 flex-1">
            <Activity
              className="w-3 h-3 shrink-0 text-[hsl(160,100%,45%)]"
              style={{ "--glow": "hsl(160,100%,45%)", animation: "iconGlowIntense 2s ease-in-out 1.9s infinite" } as React.CSSProperties}
            />
            <span className="text-[8px] font-display text-[hsl(160,100%,45%)]">72d</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoWidgets;
