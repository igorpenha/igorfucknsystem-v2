import { useState, useEffect, useRef, useCallback } from "react";
import Hls from "hls.js";
import { motion, AnimatePresence } from "framer-motion";
import SecurityCameraGrid from "./SecurityCameraGrid";

const CAMERAS = [
  // DVR 0.4
  { label: "CAM 01 (0.4)",  url: "https://cctv.igorfucknsystem.com.br/ch_cam1.m3u8" },
  { label: "CAM 04 (0.4)",  url: "https://cctv.igorfucknsystem.com.br/ch_cam4.m3u8" },
  { label: "CAM 06 (0.4)",  url: "https://cctv.igorfucknsystem.com.br/ch_cam6.m3u8" },
  { label: "CAM 10 (0.4)",  url: "https://cctv.igorfucknsystem.com.br/ch_cam10.m3u8" },
  { label: "CAM 17 (0.4)",  url: "https://cctv.igorfucknsystem.com.br/ch_cam17.m3u8" },
  // DVR 0.94
  { label: "CAM 11 (0.94)", url: "https://cctv.igorfucknsystem.com.br/ch_cam11.m3u8" },
  { label: "CAM 12 (0.94)", url: "https://cctv.igorfucknsystem.com.br/ch_cam12.m3u8" },
  { label: "CAM 13 (0.94)", url: "https://cctv.igorfucknsystem.com.br/ch_cam13.m3u8" },
  // IP / Mobile
  { label: "IP 0.3",        url: "https://cctv.igorfucknsystem.com.br/ch_cam03.m3u8" },
  { label: "IP 0.9",        url: "https://cctv.igorfucknsystem.com.br/ch_cam09.m3u8" },
  { label: "CAM PALCO",     url: "https://cctv.igorfucknsystem.com.br/ch_campalco.m3u8" },
  { label: "CAM MOBILE",    url: "https://cctv.igorfucknsystem.com.br/ch_mobile.m3u8" },
];

const ROTATION_INTERVAL = 60000;

/* ── Tactical clock ── */
const useLiveClock = () => {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

/* ── No-signal static noise (CSS only) ── */
const NoSignalPlaceholder = () => (
  <div className="absolute inset-0 flex items-center justify-center z-[7]">
    {/* Static noise via repeating gradient */}
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "128px 128px",
      }}
    />
    <motion.div
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      className="text-center z-10"
    >
      <div className="text-destructive text-sm font-display tracking-[0.4em] mb-1">SEM SINAL</div>
      <div className="text-muted-foreground/40 text-[8px] tracking-[0.3em]">CONEXÃO LOCAL EXIGIDA</div>
    </motion.div>
  </div>
);

/* ── Tactical HUD overlay on video ── */
const TacticalOverlay = ({ camIndex, clock }: { camIndex: number; clock: Date }) => {
  const ts = clock.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const ds = clock.toLocaleDateString("pt-BR");

  return (
    <div className="absolute inset-0 z-[8] pointer-events-none select-none">
      {/* Corner crosshairs */}
      {/* Top-left */}
      <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-primary/60" />
      {/* Top-right */}
      <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-primary/60" />
      {/* Bottom-left */}
      <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-primary/60" />
      {/* Bottom-right */}
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-primary/60" />

      {/* Center crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-6 h-px bg-primary/20" />
        <div className="w-px h-6 bg-primary/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* REC indicator */}
      <div className="absolute top-2.5 left-8 flex items-center gap-1.5">
        <motion.div
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-destructive shadow-[0_0_6px_hsl(0,80%,50%/0.8)]"
        />
        <span className="text-[9px] font-mono text-destructive tracking-widest">REC</span>
      </div>

      {/* LIVE badge */}
      <div className="absolute top-2.5 right-8">
        <span className="text-[8px] font-mono text-primary tracking-[0.3em] border border-primary/30 px-1.5 py-0.5 bg-primary/10">
          LIVE
        </span>
      </div>

      {/* Bottom bar: cam label + timestamp */}
      <div className="absolute bottom-2.5 left-8 right-8 flex items-center justify-between">
        <span className="text-[9px] font-mono text-primary/70 tracking-widest">
          CAM-{String(camIndex + 1).padStart(2, "0")}
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/60 tabular-nums tracking-wider">
          {ds} {ts}
        </span>
      </div>
    </div>
  );
};

const SecurityCameraPanel = () => {
  const [activeCamera, setActiveCamera] = useState<number | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isStandby, setIsStandby] = useState(false);
  const [isNoSignal, setIsNoSignal] = useState(false);

  const hlsRef = useRef<Hls | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rotationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  const clock = useLiveClock();

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
      setActiveCamera(index);

      const cam = CAMERAS[index];

      // No URL → NO SIGNAL
      if (!cam.url) {
        setIsLoading(false);
        setIsStreamActive(false);
        setIsStandby(false);
        setIsNoSignal(true);
        return;
      }

      setIsLoading(true);
      setIsStreamActive(false);
      setIsStandby(false);
      setIsNoSignal(false);

      if (!videoRef.current || !Hls.isSupported()) {
        setIsLoading(false);
        setIsStandby(true);
        return;
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 1,
        maxMaxBufferLength: 2,
        maxBufferSize: 0,
        maxBufferHole: 0.5,
        manifestLoadingTimeOut: 8000,
        manifestLoadingMaxRetry: 2,
        levelLoadingTimeOut: 8000,
        levelLoadingMaxRetry: 2,
        liveSyncDurationCount: 1,
        liveMaxLatencyDurationCount: 3,
        highBufferWatchdogPeriod: 1,
      });

      hls.loadSource(cam.url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isMounted.current) {
          videoRef.current?.play().catch(() => {});
          setIsLoading(false);
          setIsStreamActive(true);
          setIsStandby(false);
          setIsNoSignal(false);
        }
      });

      // Live-edge catch-up: jump forward if >3s behind live
      const catchUpInterval = setInterval(() => {
        const v = videoRef.current;
        if (v && v.buffered.length > 0) {
          const liveEdge = v.buffered.end(v.buffered.length - 1);
          if (liveEdge - v.currentTime > 3) {
            v.currentTime = liveEdge - 0.5;
          }
        }
      }, 2000);

      hls.on(Hls.Events.DESTROYING, () => clearInterval(catchUpInterval));

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal && isMounted.current) {
          setIsLoading(false);
          setIsStreamActive(false);
          setIsStandby(true);
          setIsNoSignal(false);
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
    setIsNoSignal(false);
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

  const [showGrid, setShowGrid] = useState(false);

  const hasStream = activeCamera !== null && CAMERAS[activeCamera]?.url;

  return (
    <>
    <AnimatePresence>
      {showGrid && (
        <SecurityCameraGrid cameras={CAMERAS} onClose={() => setShowGrid(false)} />
      )}
    </AnimatePresence>
    <div className="hud-panel rounded-sm p-4 scanlines flex flex-col h-full min-h-0">
      {/* Title bar */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border shrink-0">
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

      <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
        {/* LEFT: Camera buttons */}
        <div className="lg:w-[35%] flex flex-col min-h-0">
          <div className="border border-border/50 rounded-sm p-1.5 flex-1 min-h-0 overflow-hidden">
            <div className="overflow-y-auto h-full pr-1 space-y-1 custom-scrollbar">
              {CAMERAS.map((cam, i) => {
                const hasUrl = !!cam.url;
                return (
                  <button
                    key={i}
                    onClick={() => handleCameraClick(i)}
                    className={`w-full py-1.5 rounded-sm text-[10px] font-display uppercase tracking-widest border transition-all duration-200 ${
                      activeCamera === i
                        ? "bg-primary/20 border-primary text-primary shadow-[0_0_12px_hsl(190,100%,50%/0.3)] ring-1 ring-primary/50"
                        : hasUrl
                        ? "bg-muted/30 border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary"
                        : "bg-muted/10 border-border/30 text-muted-foreground/40 hover:bg-muted/20 hover:text-muted-foreground/60"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full transition-colors ${
                          activeCamera === i && isStreamActive
                            ? "bg-green-400 shadow-[0_0_6px_hsl(120,60%,50%/0.6)]"
                            : activeCamera === i && (isStandby || isNoSignal)
                            ? "bg-destructive shadow-[0_0_6px_hsl(0,80%,55%/0.6)]"
                            : activeCamera === i
                            ? "bg-primary animate-pulse-glow"
                            : hasUrl
                            ? "bg-muted-foreground/30"
                            : "bg-muted-foreground/15"
                        }`}
                      />
                      {cam.label}
                      {!hasUrl && (
                        <span className="text-[7px] text-muted-foreground/30 tracking-normal ml-1">OFF</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Video Display */}
        <div className="lg:w-[65%] relative flex flex-col min-h-0">
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
          <div className="relative bg-muted/20 rounded-sm overflow-hidden crt-filter flex-1 min-h-0">
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
              ) : isNoSignal ? (
                <NoSignalPlaceholder key="nosignal" />
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

            {/* Tactical HUD overlay — only when streaming */}
            {activeCamera !== null && hasStream && isStreamActive && (
              <TacticalOverlay camIndex={activeCamera} clock={clock} />
            )}

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
            <div className="mt-1 flex items-center justify-between px-1 shrink-0">
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
      <div className="flex gap-3 mt-2 pt-2 border-t border-border shrink-0">
        <button
          onClick={handleStopAll}
          disabled={activeCamera === null && !isAutoRotating}
          className="flex-1 py-1.5 rounded-sm text-[10px] font-display uppercase tracking-widest border transition-all duration-200 bg-[hsl(0,70%,40%/0.3)] border-[hsl(0,70%,50%/0.6)] text-[hsl(0,85%,65%)] hover:bg-[hsl(0,70%,40%/0.5)] hover:shadow-[0_0_12px_hsl(0,80%,55%/0.4)] disabled:cursor-not-allowed disabled:hover:shadow-none disabled:opacity-40"
        >
          ■ Parar Tudo
        </button>
        <button
          onClick={handleAutoRotation}
          className={`flex-1 py-1.5 rounded-sm text-[10px] font-display uppercase tracking-widest border transition-all duration-200 ${
            isAutoRotating
              ? "bg-accent/20 border-accent text-accent shadow-[0_0_12px_hsl(300,80%,55%/0.3)] animate-pulse-glow"
              : "bg-primary/10 border-primary/40 text-primary hover:bg-primary/20 hover:shadow-[0_0_12px_hsl(190,100%,50%/0.3)]"
          }`}
        >
          {isAutoRotating ? "⟳ Auto LIGADA" : "⟳ Rotação Auto"}
        </button>
        <button
          onClick={() => setShowGrid(true)}
          className="flex-1 py-1.5 rounded-sm text-[10px] font-display uppercase tracking-widest border transition-all duration-200 bg-secondary/10 border-secondary/40 text-secondary hover:bg-secondary/20 hover:shadow-[0_0_12px_hsl(var(--secondary)/0.3)]"
        >
          ⊞ Grid
        </button>
      </div>
    </div>
    </>
  );
};

export default SecurityCameraPanel;
