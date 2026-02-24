import { useEffect, useRef, useState } from "react";

interface AlbumArtRingsProps {
  playing: boolean;
  energy: number;
  size?: number;
}

const AlbumArtRings = ({ playing, energy, size = 120 }: AlbumArtRingsProps) => {
  const [angle, setAngle] = useState(0);
  const frameRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    const tick = (time: number) => {
      if (lastRef.current) {
        const dt = (time - lastRef.current) / 1000;
        const speed = playing ? 30 + energy * 120 : 5;
        setAngle(prev => (prev + speed * dt) % 360);
      }
      lastRef.current = time;
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frameRef.current); lastRef.current = 0; };
  }, [playing, energy]);

  const cx = size / 2;
  const cy = size / 2;
  const r1 = size / 2 - 4;
  const r2 = size / 2 - 12;
  const r3 = size / 2 - 1;

  const dashScale = playing ? 1 + energy * 0.4 : 1;
  const glowOpacity = playing ? 0.3 + energy * 0.5 : 0.08;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      <defs>
        <filter id="ring-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer pulse ring */}
      {playing && (
        <circle cx={cx} cy={cy} r={r3} fill="none" stroke="hsl(190,100%,50%)" strokeWidth="0.5" opacity={0.15 + energy * 0.3}>
          <animate attributeName="r" values={`${r3 - 2};${r3 + 4};${r3 - 2}`} dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values={`${0.2 + energy * 0.2};0.02;${0.2 + energy * 0.2}`} dur="2.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Main rotating ring — dashed, cyan */}
      <circle
        cx={cx} cy={cy} r={r1}
        fill="none"
        stroke="hsl(190,100%,50%)"
        strokeWidth="1"
        strokeDasharray={`${3 * dashScale} ${6 * dashScale}`}
        opacity={glowOpacity}
        style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${cx}px ${cy}px` }}
        filter={playing ? "url(#ring-glow)" : undefined}
      />

      {/* Inner counter-rotating ring — magenta */}
      <circle
        cx={cx} cy={cy} r={r2}
        fill="none"
        stroke="hsl(320,80%,55%)"
        strokeWidth="0.6"
        strokeDasharray={`${2 * dashScale} ${8 * dashScale}`}
        opacity={playing ? 0.2 + energy * 0.35 : 0.05}
        style={{ transform: `rotate(${-angle * 0.7}deg)`, transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Tick marks around outer ring */}
      {Array.from({ length: 24 }, (_, i) => {
        const a = ((i / 24) * 360 + angle * 0.3) * (Math.PI / 180);
        const inner = r1 - 2;
        const outer = r1 + 2;
        const isActive = playing && i % 3 === 0;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * inner}
            y1={cy + Math.sin(a) * inner}
            x2={cx + Math.cos(a) * outer}
            y2={cy + Math.sin(a) * outer}
            stroke={isActive ? "hsl(190,100%,50%)" : "hsl(190,100%,50%)"}
            strokeWidth={isActive ? "0.8" : "0.3"}
            opacity={isActive ? 0.5 + energy * 0.4 : 0.1}
          />
        );
      })}

      {/* Orbiting dot */}
      {playing && (() => {
        const rad = (angle * 1.5 * Math.PI) / 180;
        const bx = cx + Math.cos(rad) * r1;
        const by = cy + Math.sin(rad) * r1;
        const ballR = 1.5 + energy * 1.5;
        return (
          <circle cx={bx} cy={by} r={ballR} fill="hsl(190,100%,70%)" opacity={0.8} filter="url(#ring-glow)">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="0.8s" repeatCount="indefinite" />
          </circle>
        );
      })()}
    </svg>
  );
};

export default AlbumArtRings;
