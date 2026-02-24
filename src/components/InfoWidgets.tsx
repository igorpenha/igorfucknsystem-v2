import { HardDrive, Cpu, ArrowUpDown, Network } from "lucide-react";

const widgets = [
  {
    icon: HardDrive,
    label: "ARMAZENAMENTO (HD)",
    value: "72% USADO",
    glowColor: "120 100% 45%",
    textClass: "text-[hsl(120,100%,45%)]",
    iconClass: "text-[hsl(120,100%,45%)]",
    delay: "0s",
  },
  {
    icon: Cpu,
    label: "TEMPERATURA (CPU)",
    value: "45°C",
    glowColor: "15 100% 55%",
    textClass: "text-[hsl(15,100%,55%)]",
    iconClass: "text-[hsl(15,100%,55%)]",
    delay: "0.7s",
  },
  {
    icon: ArrowUpDown,
    label: "REDE (UP/DOWN)",
    value: "⬆ 150 / ⬇ 420 Mbps",
    glowColor: "190 100% 55%",
    textClass: "text-accent",
    iconClass: "text-accent",
    delay: "1.4s",
  },
  {
    icon: Network,
    label: "IPS NA REDE",
    value: "14 CONECTADOS",
    subtitle: "Atualiza em 5m",
    glowColor: "50 100% 55%",
    textClass: "text-[hsl(50,100%,55%)]",
    iconClass: "text-[hsl(50,100%,55%)]",
    delay: "2.1s",
  },
];

const InfoWidgets = () => {
  return (
    <>
      <style>{`
        @keyframes iconGlow {
          0%, 100% { filter: drop-shadow(0 0 2px var(--glow)) brightness(1); }
          50% { filter: drop-shadow(0 0 8px var(--glow)) brightness(1.3); }
        }
      `}</style>
      <div className="grid grid-cols-2 gap-2">
        {widgets.map((w) => (
          <div
            key={w.label}
            className="flex items-center gap-2 bg-muted/50 rounded-sm px-3 py-2 border border-border"
          >
            <w.icon
              className={`w-4 h-4 shrink-0 ${w.iconClass}`}
              style={{
                "--glow": `hsl(${w.glowColor})`,
                animation: `iconGlow 2.5s ease-in-out ${w.delay} infinite`,
              } as React.CSSProperties}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[8px] text-muted-foreground tracking-wider truncate">{w.label}</span>
              <span className={`text-[11px] font-display leading-tight ${w.textClass}`}>{w.value}</span>
              {"subtitle" in w && w.subtitle && (
                <span className="text-[7px] text-muted-foreground/50 tracking-wider">{w.subtitle}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default InfoWidgets;
