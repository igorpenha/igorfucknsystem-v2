import { Play, Pause } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CyberPlayButtonProps {
  playing: boolean;
  onClick: () => void;
  energy: number;
}

const CyberPlayButton = ({ playing, onClick, energy }: CyberPlayButtonProps) => {
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [pulse, setPulse] = useState(false);
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

  // Pulse effect synced to energy
  useEffect(() => {
    if (!playing) { setPulse(false); return; }
    if (energy > 0.3) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 200);
      return () => clearTimeout(t);
    }
  }, [playing, Math.round(energy * 5)]);

  const cx = 50;
  const cy = 50;
  const mainR = 36;
  const orbitR = mainR;
  const ballR = 3 + energy * 2.5;
  const rad = (orbitAngle * Math.PI) / 180;
  const bx = cx + Math.cos(rad) * orbitR;
  const by = cy + Math.sin(rad) * orbitR;

  const btnR = 22;
  const pulseScale = pulse ? 1.08 : 1;

  return (
    <button
      type="button"
      className="relative cursor-pointer flex items-center justify-center"
      onPointerDown={onClick}
      onClick={onClick}
      aria-label={playing ? "Pausar rádio" : "Tocar rádio"}
    >
      <svg width="100" height="100" viewBox="0 0 100 100" className="overflow-visible">
        <defs>
          <filter id="glow-btn">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="btn-bg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="hsl(220,25%,14%)" />
            <stop offset="100%" stopColor="hsl(220,25%,6%)" />
          </radialGradient>
        </defs>

        {/* Orbit track circle */}
        <circle
          cx={cx} cy={cy} r={orbitR}
          fill="none"
          stroke="hsl(190,100%,50%)"
          strokeWidth="0.6"
          opacity={playing ? 0.35 + energy * 0.25 : 0.15}
        />

        {/* Tick marks */}
        {Array.from({ length: 36 }, (_, i) => {
          const a = (i / 36) * Math.PI * 2;
          const r1 = orbitR - 1.5;
          const r2 = orbitR + 1.5;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * r1}
              y1={cy + Math.sin(a) * r1}
              x2={cx + Math.cos(a) * r2}
              y2={cy + Math.sin(a) * r2}
              stroke="hsl(190,100%,50%)"
              strokeWidth="0.3"
              opacity={playing ? (i % 3 === 0 ? 0.4 : 0.15) : 0.08}
            />
          );
        })}

        {/* Orbital ball */}
        {playing && (
          <>
            <circle cx={bx} cy={by} r={ballR + 2} fill="none" stroke="hsl(190,100%,50%)" strokeWidth="0.4" opacity={0.25} />
            <circle cx={bx} cy={by} r={ballR} fill="hsl(190,100%,70%)" opacity={0.85} filter="url(#glow-btn)">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="0.6s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* Pulse rings when playing */}
        {playing && (
          <>
            <circle cx={cx} cy={cy} r={btnR + 2} fill="none" stroke="hsl(190,100%,50%)" strokeWidth="0.5" opacity={0.15 + energy * 0.3}>
              <animate attributeName="r" values={`${btnR + 1};${btnR + 6};${btnR + 1}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={cx} cy={cy} r={btnR + 2} fill="none" stroke="hsl(270,80%,60%)" strokeWidth="0.4" opacity={0.1 + energy * 0.2}>
              <animate attributeName="r" values={`${btnR + 2};${btnR + 9};${btnR + 2}`} dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0;0.2" dur="2.5s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* Main circular button background */}
        <circle
          cx={cx} cy={cy} r={btnR}
          fill="url(#btn-bg)"
          stroke="hsl(190,100%,50%)"
          strokeWidth={playing ? "0.8" : "0.5"}
          opacity={1}
          style={{
            filter: playing ? `drop-shadow(0 0 ${4 + energy * 10}px hsl(190,100%,50%))` : undefined,
            transform: `scale(${pulseScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.15s ease-out",
          }}
        />

        {/* Inner ring accent */}
        <circle
          cx={cx} cy={cy} r={btnR - 4}
          fill="none"
          stroke="hsl(190,100%,50%)"
          strokeWidth="0.3"
          opacity={playing ? 0.2 + energy * 0.2 : 0.08}
        />

        {/* Play/Pause icon via foreignObject for crisp rendering */}
        <foreignObject x={cx - 10} y={cy - 10} width="20" height="20">
          <div className="w-full h-full flex items-center justify-center">
            {playing ? (
              <Pause className="w-4 h-4 text-primary" />
            ) : (
              <Play className="w-4 h-4 text-primary ml-0.5" />
            )}
          </div>
        </foreignObject>
      </svg>
    </button>
  );
};

export default CyberPlayButton;
