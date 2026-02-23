import { useState, useEffect, useRef, useCallback } from "react";
import Hls from "hls.js";
import { motion, AnimatePresence } from "framer-motion";

const CAMERAS = Array.from({ length: 24 }, (_, i) => ({
  label: `Câmera ${i + 1}`,
  url: `http://192.168.0.57:3000/cam${i + 1}.m3u8`,
}));

const ROTATION_INTERVAL = 60000;

const SecurityCameraPanel = () => {
  const [activeCamera, setActiveCamera] = useState<number | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isStandby, setIsStandby] = useState(false);

  const hlsRef = useRef<Hls | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rotationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      destroyHls();
      stopRotationTimer();
    };
  }, []);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
    }
  }, []);

  const stopRotationTimer = useCallback(() => {
    if (rotationTimer.current) {
      clearInterval(rotationTimer.current);
      rotationTimer.current = null;
    }
  }, []);

  const loadStream = useCallback(
    (index: number) => {
      if (!isMounted.current) return;
      destroyHls();
      setIsLoading(true);
      setIsStreamActive(false);
      setIsStandby(false);
      setActiveCamera(index);

      const url = CAMERAS[index].url;

      if (!videoRef.current || !Hls.isSupported()) {
        setIsLoading(false);
        setIsStandby(true);
        return;
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        manifestLoadingTimeOut: 8000,
        manifestLoadingMaxRetry: 1,
        levelLoadingTimeOut: 8000,
        levelLoadingMaxRetry: 1,
      });

      hls.loadSource(url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isMounted.current) {
          videoRef.current?.play().catch(() => {});
          setIsLoading(false);
          setIsStreamActive(true);
          setIsStandby(false);
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal && isMounted.current) {
          setIsLoading(false);
          setIsStreamActive(false);
          setIsStandby(true);
        }
      });

      hlsRef.current = hls;
    },
    [destroyHls]
  );

  const handleCameraClick = useCallback(
    (index: number) => {
      if (isAutoRotating) {
        setIsAutoRotating(false);
        stopRotationTimer();
      }
      loadStream(index);
    },
    [isAutoRotating, loadStream, stopRotationTimer]
  );

  const handleStopAll = useCallback(() => {
    setIsAutoRotating(false);
    stopRotationTimer();
    destroyHls();
    setActiveCamera(null);
    setIsStreamActive(false);
    setIsStandby(false);
    setIsLoading(false);
  }, [stopRotationTimer, destroyHls]);

  const handleAutoRotation = useCallback(() => {
    if (isAutoRotating) {
      setIsAutoRotating(false);
      stopRotationTimer();
      return;
    }

    setIsAutoRotating(true);
    loadStream(0);

    let current = 0;
    rotationTimer.current = setInterval(() => {
      if (!isMounted.current) return;
      current = (current + 1) % CAMERAS.length;
      loadStream(current);
    }, ROTATION_INTERVAL);
  }, [isAutoRotating, loadStream, stopRotationTimer]);

  return (
    <div className="hud-panel rounded-sm p-4 scanlines h-full flex flex-col">
      {/* Title bar */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
        <h3 className="font-display text-xs uppercase tracking-[0.25em] text-foreground text-glow">
          Sistema de Monitoramento
        </h3>
        <div className="flex-1" />
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-secondary opacity-60" />
          <div className="w-1 h-1 rounded-full bg-accent opacity-60" />
          <div className="w-1 h-1 rounded-full bg-primary opacity-60" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* LEFT: Control Panel */}
        <div className="lg:w-[35%] flex flex-col min-h-0">
          <div className="border border-border/50 rounded-sm p-1.5 flex-1 min-h-0 overflow-hidden">
            <div className="overflow-y-auto h-full max-h-[350px] pr-1 space-y-1 custom-scrollbar">
              {CAMERAS.map((cam, i) => (
                <button
                  key={i}
                  onClick={() => handleCameraClick(i)}
                  className={`w-full py-2 rounded-sm text-[10px] font-display uppercase tracking-widest border transition-all duration-200 ${
                    activeCamera === i
                      ? "bg-primary/20 border-primary text-primary shadow-[0_0_12px_hsl(190,100%,50%/0.3)] ring-1 ring-primary/50"
                      : "bg-muted/30 border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full transition-colors ${
                        activeCamera === i && isStreamActive
                          ? "bg-green-400 shadow-[0_0_6px_hsl(120,60%,50%/0.6)]"
                          : activeCamera === i && isStandby
                          ? "bg-destructive shadow-[0_0_6px_hsl(0,80%,55%/0.6)]"
                          : activeCamera === i
                          ? "bg-primary animate-pulse-glow"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                    {cam.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Video Display */}
        <div className="lg:w-[65%] relative">
          {/* Neon border frame */}
          <div className="absolute inset-0 rounded-sm pointer-events-none z-10">
            <div className="absolute inset-0 rounded-sm border border-primary/30" />
            <div
              className="absolute inset-0 rounded-sm"
              style={{
                background:
                  "linear-gradient(90deg, hsl(190 100% 50% / 0.15), transparent 30%, transparent 70%, hsl(300 80% 55% / 0.15))",
              }}
            />
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50 rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent/50 rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent/50 rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50 rounded-br-sm" />
          </div>

          {/* Status LED */}
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                isStreamActive
                  ? "bg-green-400 shadow-[0_0_8px_hsl(120,50%,50%/0.8)] animate-pulse-glow"
                  : "bg-destructive shadow-[0_0_8px_hsl(0,80%,55%/0.6)]"
              }`}
            />
            <span className="text-[8px] tracking-widest text-muted-foreground">
              {isStreamActive ? "ONLINE" : "OFFLINE"}
            </span>
          </div>

          {/* Video container */}
          <div className="relative bg-muted/20 rounded-sm overflow-hidden crt-filter" style={{ aspectRatio: "16/9" }}>
            {/* Grid overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10 z-[5]"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(190 100% 50% / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(190 100% 50% / 0.15) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Scanline overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-[6]"
              style={{
                background:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(190 100% 50% / 0.02) 2px, hsl(190 100% 50% / 0.02) 4px)",
              }}
            />

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-[7]"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full mb-3"
                  />
                  <span className="text-[10px] text-primary tracking-widest font-display">
                    INICIALIZANDO STREAM...
                  </span>
                </motion.div>
              ) : isStandby ? (
                <motion.div
                  key="standby"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-[7]"
                >
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="text-center"
                  >
                    <div className="text-destructive text-xs font-display tracking-[0.3em] mb-2 uppercase">
                      ● STREAM INDISPONÍVEL
                    </div>
                    <div className="text-foreground text-sm font-display tracking-[0.2em] text-glow">
                      SISTEMA DE SEGURANÇA EM STAND BY
                    </div>
                    <div className="text-muted-foreground text-[9px] tracking-widest mt-2">
                      ACESSO RESTRITO À REDE LOCAL
                    </div>
                  </motion.div>
                </motion.div>
              ) : activeCamera === null ? (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-[7]"
                >
                  <span className="text-[10px] text-muted-foreground tracking-widest">
                    SELECIONE UMA CÂMERA PARA MONITORAR
                  </span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
              style={{ opacity: isStreamActive ? 1 : 0, transition: "opacity 0.5s ease" }}
            />
          </div>

          {/* Camera label */}
          {activeCamera !== null && (
            <div className="mt-1 flex items-center justify-between px-1">
              <span className="text-[9px] text-muted-foreground tracking-widest">
                CAM-{String(activeCamera + 1).padStart(2, "0")}
              </span>
              <span className="text-[9px] text-muted-foreground tracking-widest">
                {isAutoRotating ? "ROTAÇÃO AUTO 60s" : "MANUAL"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex gap-3 mt-3 pt-3 border-t border-border">
        <button
          onClick={handleStopAll}
          disabled={activeCamera === null && !isAutoRotating}
          className="flex-1 py-2 rounded-sm text-[10px] font-display uppercase tracking-widest border transition-all duration-200 bg-[hsl(0,70%,40%/0.3)] border-[hsl(0,70%,50%/0.6)] text-[hsl(0,85%,65%)] hover:bg-[hsl(0,70%,40%/0.5)] hover:shadow-[0_0_12px_hsl(0,80%,55%/0.4)] disabled:cursor-not-allowed disabled:hover:shadow-none disabled:opacity-40"
        >
          ■ Parar Tudo
        </button>
        <button
          onClick={handleAutoRotation}
          className={`flex-1 py-2 rounded-sm text-[10px] font-display uppercase tracking-widest border transition-all duration-200 ${
            isAutoRotating
              ? "bg-accent/20 border-accent text-accent shadow-[0_0_12px_hsl(300,80%,55%/0.3)] animate-pulse-glow"
              : "bg-primary/10 border-primary/40 text-primary hover:bg-primary/20 hover:shadow-[0_0_12px_hsl(190,100%,50%/0.3)]"
          }`}
        >
          {isAutoRotating ? "⟳ Rotação Auto LIGADA" : "⟳ Rotação Auto"}
        </button>
        <button
          className="flex-1 py-2 rounded-sm text-[10px] font-display uppercase tracking-widest border transition-all duration-200 bg-secondary/10 border-secondary/40 text-secondary hover:bg-secondary/20 hover:shadow-[0_0_12px_hsl(var(--secondary)/0.3)]"
        >
          ⊞ Acessar Grid
        </button>
      </div>
    </div>
  );
};

export default SecurityCameraPanel;
