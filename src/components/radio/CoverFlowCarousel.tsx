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

/* Side cover with reflection */
const SideCover = ({
  src,
  alt,
  hasError,
  onError,
}: {
  src: string;
  alt: string;
  hasError: boolean;
  onError: () => void;
}) => (
  <div className="flex flex-col items-center">
    <div
      className="overflow-hidden border border-border/30 transition-all duration-500 shrink-0"
      style={{
        width: 80,
        height: 80,
        opacity: 0.55,
        clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)",
      }}
    >
      {src && !hasError ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" onError={onError} />
      ) : (
        <Placeholder />
      )}
    </div>
    {/* Reflection */}
    <div
      className="overflow-hidden shrink-0 pointer-events-none"
      style={{
        width: 80,
        height: 36,
        opacity: 0.25,
        transform: "scaleY(-1)",
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 80%)",
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 80%)",
        clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)",
      }}
    >
      {src && !hasError ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-muted/10" />
      )}
    </div>
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
    <div className="flex items-center w-full px-0" style={{ height: 160 }}>
      {/* Previous */}
      <div className="flex-1 flex items-center justify-center">
        <SideCover src={prevCover} alt="Previous" hasError={!!errors.prev} onError={() => handleError("prev")} />
      </div>

      {/* Current — glass encapsulation */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="relative transition-all duration-500"
          style={{
            width: 124,
            height: 124,
          }}
        >
          {/* Outer glow layers */}
          <div
            className="absolute -inset-[3px] rounded-[2px] pointer-events-none"
            style={{
              background: playing
                ? "linear-gradient(135deg, hsl(var(--primary) / 0.3), transparent 40%, transparent 60%, hsl(var(--primary) / 0.2))"
                : "linear-gradient(135deg, hsl(var(--border) / 0.4), transparent 40%, transparent 60%, hsl(var(--border) / 0.3))",
              boxShadow: playing
                ? "0 0 30px hsl(var(--primary) / 0.3), 0 0 60px hsl(var(--primary) / 0.1), inset 0 0 20px hsl(var(--primary) / 0.1)"
                : "0 4px 20px hsl(0 0% 0% / 0.5), inset 0 0 10px hsl(0 0% 100% / 0.03)",
            }}
          />
          {/* Main cover container */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              boxShadow: playing
                ? "inset 0 1px 0 hsl(0 0% 100% / 0.12), inset 0 -1px 0 hsl(0 0% 0% / 0.3), inset 1px 0 0 hsl(0 0% 100% / 0.06), inset -1px 0 0 hsl(0 0% 100% / 0.06), 0 8px 32px hsl(0 0% 0% / 0.6), 0 2px 8px hsl(var(--primary) / 0.2)"
                : "inset 0 1px 0 hsl(0 0% 100% / 0.08), inset 0 -1px 0 hsl(0 0% 0% / 0.3), 0 8px 32px hsl(0 0% 0% / 0.6)",
            }}
          >
            {currentCover && !errors.current ? (
              <img src={currentCover} alt="Now playing" className="w-full h-full object-cover" onError={() => handleError("current")} />
            ) : (
              <Placeholder />
            )}
            {/* Specular highlight overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, hsl(0 0% 100% / 0.12) 0%, transparent 40%, transparent 70%, hsl(0 0% 100% / 0.04) 100%)",
              }}
            />
            {/* Scan line when playing */}
            {playing && (
              <div
                className="absolute inset-0 pointer-events-none animate-[scanLine_2.5s_linear_infinite]"
                style={{
                  background: "linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.06) 48%, hsl(var(--primary) / 0.15) 50%, hsl(var(--primary) / 0.06) 52%, transparent 100%)",
                }}
              />
            )}
          </div>
          {/* Edge bevel highlights */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              border: "1px solid hsl(0 0% 100% / 0.08)",
              boxShadow: "inset 0 0 1px hsl(0 0% 100% / 0.1)",
            }}
          />
        </div>

        {/* Main cover reflection */}
        <div
          className="overflow-hidden shrink-0 pointer-events-none"
          style={{
            width: 120,
            height: 50,
            opacity: 0.2,
            transform: "scaleY(-1)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 70%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 70%)",
            clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
          }}
        >
          {currentCover && !errors.current ? (
            <img src={currentCover} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted/10" />
          )}
        </div>
      </div>

      {/* Next */}
      <div className="flex-1 flex items-center justify-center">
        <SideCover src={nextCover} alt="Next" hasError={!!errors.next} onError={() => handleError("next")} />
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