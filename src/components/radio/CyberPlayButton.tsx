import { Play, Pause } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CyberPlayButtonProps {
  playing: boolean;
  onClick: () => void;
  energy: number;
}

const CyberPlayButton = ({ playing, onClick, energy }: CyberPlayButtonProps) => {
  const [orbitAngle, setOrbitAngle] = useState(0);
  const angleRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const tick = (time: number) => {
      if (lastTimeRef.current) {
        const dt = (time - lastTimeRef.current) / 1000;
        const speed = (0.4 + energy * 4.0) * dt * 360;
        angleRef.current = (angleRef.current + speed) % 360;
        setOrbitAngle(angleRef.current);
      }
      lastTimeRef.current = time;
      requestAnimationFrame(tick);
    };
    const frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      lastTimeRef.current = 0;
    };
  }, [playing, energy]);

  const cx = 60;
  const cy = 60;
  const orbitR = 38;
  const ballR = 3 + energy * 3;
  const rad = (orbitAngle * Math.PI) / 180;
  const bx = cx + Math.cos(rad) * orbitR;
  const by = cy + Math.sin(rad) * orbitR;

  // Micro SVG positions around the button (8 points)
  const microCount = 8;
  const microR = 48;
  const micros = Array.from({ length: microCount }, (_, i) => {
    const a = (i / microCount) * Math.PI * 2;
    return {
      x: cx + Math.cos(a) * microR,
      y: cy + Math.sin(a) * microR,
      angle: (i / microCount) * 360,
      delay: i * 0.15,
    };
  });

  return (
    <div className="relative cursor-pointer" onClick={onClick}>
      <svg width="120" height="120" viewBox="0 0 120 120" className="overflow-visible">
        <defs>
          <filter id="glow-micro">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(190,100%,50%)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(270,80%,60%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(190,100%,50%)" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Outer dashed ring */}
        <circle
          cx={cx} cy={cy} r={orbitR + 8}
          fill="none"
          stroke="hsl(190,100%,50%)"
          strokeWidth="0.4"
          strokeDasharray="3 6"
          opacity={playing ? 0.4 : 0.15}
        >
          {playing && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${cx} ${cy}`}
              to={`360 ${cx} ${cy}`}
              dur="12s"
              repeatCount="indefinite"
            />
          )}
        </circle>

        {/* Main orbit ring */}
        <circle
          cx={cx} cy={cy} r={orbitR}
          fill="none"
          stroke="url(#orbit-grad)"
          strokeWidth="0.7"
          opacity={playing ? 0.5 + energy * 0.3 : 0.2}
        />

        {/* Micro SVGs around the button */}
        {micros.map((m, i) => (
          <g key={i} transform={`translate(${m.x}, ${m.y})`} filter="url(#glow-micro)">
            {/* Type 0: diamond */}
            {i % 4 === 0 && (
              <polygon
                points="0,-4 3,0 0,4 -3,0"
                fill="none"
                stroke="hsl(190,100%,60%)"
                strokeWidth="0.6"
                opacity={playing ? 0.6 + energy * 0.4 : 0.2}
              >
                {playing && (
                  <animate attributeName="opacity" values="0.3;0.9;0.3" dur={`${1.2 + m.delay}s`} repeatCount="indefinite" />
                )}
              </polygon>
            )}
            {/* Type 1: crosshair */}
            {i % 4 === 1 && (
              <g opacity={playing ? 0.5 + energy * 0.4 : 0.15}>
                <line x1="-3" y1="0" x2="3" y2="0" stroke="hsl(270,80%,65%)" strokeWidth="0.5" />
                <line x1="0" y1="-3" x2="0" y2="3" stroke="hsl(270,80%,65%)" strokeWidth="0.5" />
                {playing && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 0 0"
                    to="90 0 0"
                    dur={`${2 + m.delay}s`}
                    repeatCount="indefinite"
                  />
                )}
              </g>
            )}
            {/* Type 2: tiny circle pulse */}
            {i % 4 === 2 && (
              <>
                <circle r="2" fill="none" stroke="hsl(140,100%,50%)" strokeWidth="0.5" opacity={playing ? 0.5 : 0.15}>
                  {playing && (
                    <animate attributeName="r" values="1.5;3.5;1.5" dur={`${1.5 + m.delay}s`} repeatCount="indefinite" />
                  )}
                </circle>
                <circle r="0.8" fill="hsl(140,100%,50%)" opacity={playing ? 0.7 : 0.2} />
              </>
            )}
            {/* Type 3: bracket */}
            {i % 4 === 3 && (
              <g opacity={playing ? 0.5 + energy * 0.3 : 0.15}>
                <polyline points="-2,-3 -4,0 -2,3" fill="none" stroke="hsl(320,100%,55%)" strokeWidth="0.6" />
                <polyline points="2,-3 4,0 2,3" fill="none" stroke="hsl(320,100%,55%)" strokeWidth="0.6" />
                {playing && (
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${1.8 + m.delay}s`} repeatCount="indefinite" />
                )}
              </g>
            )}
          </g>
        ))}

        {/* Tick marks around orbit */}
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const r1 = orbitR - 2;
          const r2 = orbitR + 2;
          return (
            <line
              key={`tick-${i}`}
              x1={cx + Math.cos(a) * r1}
              y1={cy + Math.sin(a) * r1}
              x2={cx + Math.cos(a) * r2}
              y2={cy + Math.sin(a) * r2}
              stroke="hsl(190,100%,50%)"
              strokeWidth="0.3"
              opacity={playing ? (i % 3 === 0 ? 0.5 : 0.2) : 0.1}
            />
          );
        })}

        {/* Orbital ball */}
        {playing && (
          <>
            <circle cx={bx} cy={by} r={ballR + 3} fill="none" stroke="hsl(190,100%,50%)" strokeWidth="0.4" opacity={0.2} />
            <circle cx={bx} cy={by} r={ballR} fill="hsl(190,100%,70%)" opacity={0.9} filter="url(#glow-micro)">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="0.5s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* Energy arc segments (appear when playing) */}
        {playing && energy > 0.2 && (
          <>
            <path
              d={describeArc(cx, cy, orbitR - 6, orbitAngle, orbitAngle + 40)}
              fill="none"
              stroke="hsl(270,80%,60%)"
              strokeWidth="1"
              opacity={energy * 0.6}
              strokeLinecap="round"
            />
            <path
              d={describeArc(cx, cy, orbitR - 6, orbitAngle + 180, orbitAngle + 210)}
              fill="none"
              stroke="hsl(320,100%,55%)"
              strokeWidth="0.8"
              opacity={energy * 0.5}
              strokeLinecap="round"
            />
          </>
        )}
      </svg>

      {/* Center button */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-sm flex items-center justify-center transition-all"
        style={{
          background: "hsl(220 25% 8%)",
          border: "1px solid hsl(190 100% 50% / 0.35)",
          boxShadow: playing
            ? `0 0 ${12 + energy * 25}px hsl(190 100% 50% / ${0.15 + energy * 0.3}), inset 0 0 15px hsl(190 100% 50% / ${energy * 0.15}), 0 0 2px hsl(270 80% 60% / 0.2)`
            : "0 4px 12px hsl(0 0% 0% / 0.6), inset 0 1px 0 hsl(190 100% 50% / 0.1)",
          transform: playing ? "translateY(1px) scale(0.97)" : "translateY(0) scale(1)",
        }}
      >
        {/* Inner corner brackets */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-primary/40" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-primary/40" />
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-primary/40" />
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-primary/40" />

        {playing ? (
          <Pause className="w-5 h-5 text-primary" />
        ) : (
          <Play className="w-5 h-5 text-primary ml-0.5" />
        )}
      </div>
    </div>
  );
};

// Helper to draw SVG arc paths
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default CyberPlayButton;
