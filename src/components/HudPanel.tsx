import { ReactNode, useEffect, useState, useRef } from "react";

const HEX_CHARS = "0123456789ABCDEF";
const randomHex = () => {
  let s = "";
  for (let i = 0; i < 4; i++) s += HEX_CHARS[Math.floor(Math.random() * 16)];
  return `0x${s}`;
};

const HexDataSpan = ({ delay = 0 }: { delay?: number }) => {
  const [hex, setHex] = useState(randomHex());
  useEffect(() => {
    const interval = setInterval(() => setHex(randomHex()), 1500 + delay * 300);
    return () => clearInterval(interval);
  }, [delay]);
  return (
    <span className="text-[7px] font-mono text-secondary/40 animate-hex-blink" style={{ animationDelay: `${delay * 0.4}s` }}>
      {hex}
    </span>
  );
};

const CornerSVG = ({ position }: { position: "tl" | "tr" | "bl" | "br" }) => {
  const rotation = { tl: 0, tr: 90, bl: 270, br: 180 }[position];
  const posClass = {
    tl: "top-0 left-0",
    tr: "top-0 right-0",
    bl: "bottom-0 left-0",
    br: "bottom-0 right-0",
  }[position];

  return (
    <div className={`absolute ${posClass} w-5 h-5 pointer-events-none z-20`}>
      <svg viewBox="0 0 20 20" className="w-full h-full" style={{ transform: `rotate(${rotation}deg)` }}>
        <path d="M0 0 L8 0 L8 2 L2 2 L2 8 L0 8 Z" fill="none" stroke="hsl(190,100%,50%)" strokeWidth="0.8" opacity="0.6" />
      </svg>
      {position === "tr" && (
        <svg viewBox="0 0 12 12" className="absolute top-1 right-1 w-3 h-3 animate-rotate-slow">
          <circle cx="6" cy="6" r="4" fill="none" stroke="hsl(320,100%,50%)" strokeWidth="0.5" opacity="0.5" strokeDasharray="2 3" />
          <circle cx="6" cy="6" r="2" fill="none" stroke="hsl(50,100%,50%)" strokeWidth="0.4" opacity="0.4" />
        </svg>
      )}
      {position === "bl" && (
        <svg viewBox="0 0 12 12" className="absolute bottom-1 left-1 w-3 h-3 animate-rotate-reverse">
          <circle cx="6" cy="6" r="4" fill="none" stroke="hsl(190,100%,50%)" strokeWidth="0.5" opacity="0.4" strokeDasharray="3 2" />
        </svg>
      )}
    </div>
  );
};

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
      {/* Corner greebles */}
      <CornerSVG position="tl" />
      <CornerSVG position="tr" />
      <CornerSVG position="bl" />
      <CornerSVG position="br" />

      {title && (
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
          <h3 className="font-display text-xs uppercase tracking-[0.25em] text-foreground text-glow">
            {title}
          </h3>
          <div className="flex-1" />
          {/* Hex data greebles */}
          <div className="flex gap-2 items-center">
            <HexDataSpan delay={0} />
            <HexDataSpan delay={1} />
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-secondary opacity-60" />
              <div className="w-1 h-1 rounded-full bg-accent opacity-60" />
              <div className="w-1 h-1 rounded-full bg-primary opacity-60" />
            </div>
          </div>
        </div>
      )}
      <div className="relative z-0 flex-1 min-h-0 flex flex-col">{children}</div>

      {/* Bottom hex data bar */}
      <div className="absolute bottom-1 left-4 right-4 flex justify-between pointer-events-none z-20">
        <HexDataSpan delay={2} />
        <HexDataSpan delay={3} />
      </div>
    </div>
  );
};

export default HudPanel;
