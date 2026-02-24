import { HardDrive, Cpu, ArrowUp, ArrowDown, Network } from "lucide-react";

const InfoWidgets = () => {
  return (
    <>
      <style>{`
        @keyframes iconGlowIntense {
          0%, 100% { filter: drop-shadow(0 0 6px var(--glow)) drop-shadow(0 0 2px var(--glow)) brightness(0.95); }
          50% { filter: drop-shadow(0 0 18px var(--glow)) drop-shadow(0 0 36px var(--glow)) drop-shadow(0 0 8px var(--glow)) brightness(1.8) saturate(1.4); }
        }
      `}</style>
      <div className="grid grid-cols-2 gap-2">
        {/* BLOCO 1 - HD */}
        <div className="bg-muted/50 rounded-sm border border-border overflow-hidden flex flex-col">
          <div className="px-2 py-1.5 border-b border-primary/20 bg-primary/[0.06]">
            <span className="text-[8px] font-display tracking-[0.25em] text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]">HD</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-2 flex-1">
            <HardDrive
              className="w-4 h-4 shrink-0 text-[hsl(120,100%,45%)]"
              style={{ "--glow": "hsl(120,100%,45%)", animation: "iconGlowIntense 2s ease-in-out infinite" } as React.CSSProperties}
            />
            <span className="text-[10px] font-display text-[hsl(120,100%,45%)]">72%</span>
          </div>
        </div>

        {/* BLOCO 2 - TEMP */}
        <div className="bg-muted/50 rounded-sm border border-border overflow-hidden flex flex-col">
          <div className="px-2 py-1.5 border-b border-primary/20 bg-primary/[0.06]">
            <span className="text-[8px] font-display tracking-[0.25em] text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]">TEMP.</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-2 flex-1">
            <Cpu
              className="w-4 h-4 shrink-0 text-[hsl(15,100%,55%)]"
              style={{ "--glow": "hsl(15,100%,55%)", animation: "iconGlowIntense 2s ease-in-out 0.5s infinite" } as React.CSSProperties}
            />
            <span className="text-[10px] font-display text-[hsl(15,100%,55%)]">45°C</span>
          </div>
        </div>

        {/* BLOCO 3 - REDE */}
        <div className="bg-muted/50 rounded-sm border border-border overflow-hidden flex flex-col">
          <div className="px-2 py-1.5 border-b border-primary/20 bg-primary/[0.06]">
            <span className="text-[8px] font-display tracking-[0.25em] text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]">REDE</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-2 flex-1">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3 text-accent" style={{ "--glow": "hsl(50,100%,50%)", animation: "iconGlowIntense 2s ease-in-out 1s infinite" } as React.CSSProperties} />
                <span className="text-[9px] font-display text-accent">150 Mbps</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowDown className="w-3 h-3 text-accent" style={{ "--glow": "hsl(50,100%,50%)", animation: "iconGlowIntense 2s ease-in-out 1.3s infinite" } as React.CSSProperties} />
                <span className="text-[9px] font-display text-accent">420 Mbps</span>
              </div>
            </div>
          </div>
        </div>

        {/* BLOCO 4 - IPS */}
        <div className="bg-muted/50 rounded-sm border border-border overflow-hidden flex flex-col">
          <div className="px-2 py-1.5 border-b border-primary/20 bg-primary/[0.06]">
            <span className="text-[8px] font-display tracking-[0.25em] text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]">IPS NA REDE</span>
          </div>
          <div className="flex items-center justify-center gap-2 px-2 py-2 flex-1">
            <Network
              className="w-4 h-4 shrink-0 text-[hsl(50,100%,55%)]"
              style={{ "--glow": "hsl(50,100%,55%)", animation: "iconGlowIntense 2s ease-in-out 1.6s infinite" } as React.CSSProperties}
            />
            <span className="text-[10px] font-display text-[hsl(50,100%,55%)]">14 IPs</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoWidgets;