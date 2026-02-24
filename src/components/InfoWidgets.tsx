import { HardDrive, Cpu, ArrowUp, ArrowDown, Network } from "lucide-react";

const InfoWidgets = () => {
  return (
    <>
      <style>{`
        @keyframes iconGlowIntense {
          0%, 100% { filter: drop-shadow(0 0 3px var(--glow)) brightness(0.9); }
          50% { filter: drop-shadow(0 0 14px var(--glow)) drop-shadow(0 0 24px var(--glow)) brightness(1.5); }
        }
      `}</style>
      <div className="grid grid-cols-2 gap-2">
        {/* BLOCO 1 - HD */}
        <div className="bg-muted/50 rounded-sm border border-border overflow-hidden">
          <div className="px-2 py-1 border-b border-border bg-muted/80">
            <span className="text-[7px] font-display tracking-[0.2em] text-[hsl(120,100%,45%)]">HD</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <HardDrive
              className="w-4 h-4 shrink-0 text-[hsl(120,100%,45%)]"
              style={{ "--glow": "hsl(120,100%,45%)", animation: "iconGlowIntense 2s ease-in-out infinite" } as React.CSSProperties}
            />
            <span className="text-[10px] font-display text-[hsl(120,100%,45%)]">72%</span>
          </div>
        </div>

        {/* BLOCO 2 - TEMP */}
        <div className="bg-muted/50 rounded-sm border border-border overflow-hidden">
          <div className="px-2 py-1 border-b border-border bg-muted/80">
            <span className="text-[7px] font-display tracking-[0.2em] text-[hsl(15,100%,55%)]">TEMP.</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Cpu
              className="w-4 h-4 shrink-0 text-[hsl(15,100%,55%)]"
              style={{ "--glow": "hsl(15,100%,55%)", animation: "iconGlowIntense 2s ease-in-out 0.5s infinite" } as React.CSSProperties}
            />
            <span className="text-[10px] font-display text-[hsl(15,100%,55%)]">45°C</span>
          </div>
        </div>

        {/* BLOCO 3 - REDE */}
        <div className="bg-muted/50 rounded-sm border border-border overflow-hidden">
          <div className="px-2 py-1 border-b border-border bg-muted/80">
            <span className="text-[7px] font-display tracking-[0.2em] text-accent">REDE</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5">
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
        <div className="bg-muted/50 rounded-sm border border-border overflow-hidden">
          <div className="px-2 py-1 border-b border-border bg-muted/80">
            <span className="text-[7px] font-display tracking-[0.2em] text-[hsl(50,100%,55%)]">IPS NA REDE</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5">
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
