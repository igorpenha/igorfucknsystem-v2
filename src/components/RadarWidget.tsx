const RadarWidget = ({ size = 120 }: { size?: number }) => {
  const r = size / 2 - 4;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="opacity-60">
        {/* Circles */}
        {[0.3, 0.6, 0.9].map((s) => (
          <circle
            key={s}
            cx={size / 2}
            cy={size / 2}
            r={r * s}
            fill="none"
            stroke="hsl(190 100% 50%)"
            strokeWidth="0.5"
            opacity={0.3}
          />
        ))}
        {/* Cross */}
        <line x1={size / 2} y1={4} x2={size / 2} y2={size - 4} stroke="hsl(190 100% 50%)" strokeWidth="0.5" opacity={0.2} />
        <line x1={4} y1={size / 2} x2={size - 4} y2={size / 2} stroke="hsl(190 100% 50%)" strokeWidth="0.5" opacity={0.2} />
        {/* Outer ring */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(270 80% 60%)" strokeWidth="1" opacity={0.5} />
      </svg>
      {/* Sweep line */}
      <div
        className="absolute inset-0 animate-sweep"
        style={{ transformOrigin: "center center" }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2}
            y2={4}
            stroke="hsl(190 100% 50%)"
            strokeWidth="1.5"
            opacity={0.8}
          />
          {/* Sweep gradient */}
          <defs>
            <linearGradient id="sweepGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(190 100% 50%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(190 100% 50%)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M ${size / 2} ${size / 2} L ${size / 2} 4 A ${r} ${r} 0 0 1 ${size / 2 + r * Math.sin(Math.PI / 6)} ${size / 2 - r * Math.cos(Math.PI / 6)} Z`}
            fill="url(#sweepGrad)"
          />
        </svg>
      </div>
      {/* Dots */}
      <div className="absolute" style={{ top: "30%", left: "60%" }}>
        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" />
      </div>
      <div className="absolute" style={{ top: "55%", left: "35%" }}>
        <div className="w-1 h-1 rounded-full bg-primary animate-pulse-glow" />
      </div>
    </div>
  );
};

export default RadarWidget;
