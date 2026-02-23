import { ReactNode } from "react";

const HudPanel = ({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={`hud-panel rounded-sm p-4 scanlines ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
          <h3 className="font-display text-xs uppercase tracking-[0.25em] text-foreground text-glow">
            {title}
          </h3>
          <div className="flex-1" />
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-secondary opacity-60" />
            <div className="w-1 h-1 rounded-full bg-accent opacity-60" />
            <div className="w-1 h-1 rounded-full bg-primary opacity-60" />
          </div>
        </div>
      )}
      <div className="relative z-0 flex-1 min-h-0 flex flex-col">{children}</div>
    </div>
  );
};

export default HudPanel;
