import { Play, Pause, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CyberPlayBtnProps {
  playing: boolean;
  connecting: boolean;
  onClick: () => void;
  energy: number;
}

const CyberPlayBtn = ({ playing, connecting, onClick, energy }: CyberPlayBtnProps) => {
  const [ringAngle, setRingAngle] = useState(0);
  const frameRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const tick = (time: number) => {
      if (lastRef.current) {
        const dt = (time - lastRef.current) / 1000;
        setRingAngle(prev => (prev + (60 + energy * 200) * dt) % 360);
      }
      lastRef.current = time;
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frameRef.current); lastRef.current = 0; };
  }, [playing, energy]);

  const s = 38;
  const cx = s / 2;
  const r = s / 2 - 3;

  return (
    <button
      onClick={onClick}
      className="relative shrink-0 cursor-pointer"
      aria-label={playing ? "Pausar" : "Play"}
      style={{ width: s, height: s }}
    >
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="overflow-visible">
        <defs>
          <filter id="play-glow">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="play-bg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="hsl(220,25%,14%)" />
            <stop offset="100%" stopColor="hsl(220,25%,6%)" />
          </radialGradient>
        </defs>

        {/* Background circle */}
        <circle cx={cx} cy={cx} r={r} fill="url(#play-bg)"
          stroke={playing ? "hsl(190,100%,50%)" : "hsl(190,100%,50%)"}
          strokeWidth={playing ? "1" : "0.5"}
          opacity={1}
          style={{ filter: playing ? `drop-shadow(0 0 ${3 + energy * 8}px hsl(190,100%,50%))` : undefined }}
        />

        {/* Spinning arc when playing */}
        {playing && (
          <circle cx={cx} cy={cx} r={r + 2}
            fill="none"
            stroke="hsl(190,100%,50%)"
            strokeWidth="1"
            strokeDasharray="8 14"
            opacity={0.4 + energy * 0.4}
            style={{ transform: `rotate(${ringAngle}deg)`, transformOrigin: `${cx}px ${cx}px` }}
            filter="url(#play-glow)"
          />
        )}

        {/* Pulse ring */}
        {playing && (
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="hsl(190,100%,50%)" strokeWidth="0.5" opacity={0.2}>
            <animate attributeName="r" values={`${r};${r + 5};${r}`} dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Icon */}
        <foreignObject x={cx - 7} y={cx - 7} width="14" height="14">
          <div className="w-full h-full flex items-center justify-center">
            {connecting ? (
              <Loader2 className="w-3 h-3 text-primary animate-spin" />
            ) : playing ? (
              <Pause className="w-3 h-3 text-primary" />
            ) : (
              <Play className="w-3 h-3 text-primary ml-px" />
            )}
          </div>
        </foreignObject>
      </svg>
    </button>
  );
};

export default CyberPlayBtn;
