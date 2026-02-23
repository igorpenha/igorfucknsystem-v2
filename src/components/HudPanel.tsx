import { ReactNode } from "react";

interface HudPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
}

const HudPanel = ({ title, children, className = "", headerRight }: HudPanelProps) => {
  return (
    <div
      className={`relative bg-card/90 backdrop-blur-md border border-border rounded-sm overflow-hidden flex flex-col ${className}`}
      style={{
        boxShadow: "0 0 15px hsl(190 100% 50% / 0.05), inset 0 1px 0 hsl(190 100% 50% / 0.1)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-[10px] font-display tracking-[0.2em] text-primary uppercase">
            {title}
          </span>
        </div>
        {headerRight}
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/40" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/40" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/40" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/40" />

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default HudPanel;
