import { useState, useEffect } from "react";

interface CoverFlowCarouselProps {
  currentCover: string;
  prevCover: string;
  nextCover: string;
  playing: boolean;
  transitionKey: number;
}

const Placeholder = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-muted/20">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-15">
      <circle cx="12" cy="12" r="10" stroke="hsl(var(--primary))" strokeWidth="1" />
      <circle cx="12" cy="12" r="3" stroke="hsl(var(--primary))" strokeWidth="1" />
    </svg>
    <span className="text-[5px] text-muted-foreground/15 tracking-[0.3em]">NO DATA</span>
  </div>
);

const CoverFlowCarousel = ({
  currentCover,
  prevCover,
  nextCover,
  playing,
}: CoverFlowCarouselProps) => {
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setErrors({});
  }, [currentCover, prevCover, nextCover]);

  const handleError = (key: string) => {
    setErrors(prev => ({ ...prev, [key]: true }));
  };

  return (
    <div className="flex items-center justify-center gap-2 w-full px-2" style={{ height: 110 }}>
      {/* Previous */}
      <div
        className="overflow-hidden border border-border/30 transition-opacity duration-500"
        style={{ flex: "1 1 30%", maxWidth: "30%", aspectRatio: "1", opacity: 0.5, clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)" }}
      >
        {prevCover && !errors.prev ? (
          <img src={prevCover} alt="Previous" className="w-full h-full object-cover" onError={() => handleError("prev")} />
        ) : (
          <Placeholder />
        )}
      </div>

      {/* Current — highlighted */}
      <div
        className="overflow-hidden relative transition-all duration-500"
        style={{
          flex: "1 1 38%",
          maxWidth: "38%",
          aspectRatio: "1",
          clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
          border: `1.5px solid ${playing ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
          boxShadow: playing
            ? "0 0 20px hsl(var(--primary) / 0.35), 0 0 40px hsl(var(--primary) / 0.12)"
            : "0 4px 16px hsl(0 0% 0% / 0.4)",
        }}
      >
        {currentCover && !errors.current ? (
          <img src={currentCover} alt="Now playing" className="w-full h-full object-cover" onError={() => handleError("current")} />
        ) : (
          <Placeholder />
        )}
        {playing && (
          <div
            className="absolute inset-0 pointer-events-none animate-[scanLine_2.5s_linear_infinite]"
            style={{
              background: "linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.06) 48%, hsl(var(--primary) / 0.15) 50%, hsl(var(--primary) / 0.06) 52%, transparent 100%)",
            }}
          />
        )}
      </div>

      {/* Next */}
      <div
        className="overflow-hidden border border-border/30 transition-opacity duration-500"
        style={{ flex: "1 1 30%", maxWidth: "30%", aspectRatio: "1", opacity: 0.5, clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)" }}
      >
        {nextCover && !errors.next ? (
          <img src={nextCover} alt="Next" className="w-full h-full object-cover" onError={() => handleError("next")} />
        ) : (
          <Placeholder />
        )}
      </div>

      <style>{`
        @keyframes scanLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

export default CoverFlowCarousel;
