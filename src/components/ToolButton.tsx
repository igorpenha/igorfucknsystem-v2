import { ReactNode } from "react";

const ToolButton = ({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="group flex items-center gap-2 px-3 py-2 rounded-sm border border-border/50 bg-muted/20 
      hover:border-primary/60 hover:bg-primary/10 hover:shadow-[0_0_15px_hsl(190,100%,50%/0.2)]
      active:scale-95 transition-all duration-200 w-full"
  >
    <div className="w-5 h-5 flex items-center justify-center text-primary group-hover:text-accent transition-colors">
      {icon}
    </div>
    <span className="font-display text-[10px] tracking-[0.2em] text-foreground group-hover:text-glow transition-all">
      {label}
    </span>
    <div className="flex-1" />
    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-accent group-hover:shadow-[0_0_6px_hsl(50,100%,50%/0.6)] transition-all" />
  </button>
);

export default ToolButton;
