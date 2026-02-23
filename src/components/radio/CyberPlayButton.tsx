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

  const orbitR = 30;
  const ballR = 3.5 + energy * 3;
  const rad = (orbitAngle * Math.PI) / 180;
  const bx = 40 + Math.cos(rad) * orbitR;
  const by = 40 + Math.sin(rad) * orbitR;

  return (
    <div className="relative cursor-pointer" onClick={onClick}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        {/* Orbit ring */}
        <circle
          cx="40" cy="40" r={orbitR}
          fill="none"
          stroke="hsl(190 100% 50%)"
          strokeWidth="0.5"
          opacity={playing ? 0.4 + energy * 0.3 : 0.2}
        />

        {/* Orbital ball */}
        {playing && (
          <>
            <circle cx={bx} cy={by} r={ballR} fill="hsl(190 100% 70%)" opacity={0.9}>
              <animate attributeName="opacity" values="0.7;1;0.7" dur="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={bx} cy={by} r={ballR + 2} fill="none" stroke="hsl(190 100% 50%)" strokeWidth="0.5" opacity={0.3} />
          </>
        )}
      </svg>

      {/* Center button */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-sm flex items-center justify-center transition-all"
        style={{
          background: "hsl(220 25% 8%)",
          border: "1px solid hsl(190 100% 50% / 0.3)",
          boxShadow: playing
            ? `0 0 ${10 + energy * 20}px hsl(190 100% 50% / ${0.2 + energy * 0.3}), inset 0 2px 4px hsl(0 0% 0% / 0.5)`
            : "0 4px 8px hsl(0 0% 0% / 0.5), inset 0 1px 0 hsl(190 100% 50% / 0.1)",
          transform: playing ? "translateY(2px) scale(0.97)" : "translateY(0) scale(1)",
        }}
      >
        {playing ? (
          <Pause className="w-5 h-5 text-primary" />
        ) : (
          <Play className="w-5 h-5 text-primary ml-0.5" />
        )}
      </div>
    </div>
  );
};

export default CyberPlayButton;
