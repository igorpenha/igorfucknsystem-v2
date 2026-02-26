import { useState, useRef, useCallback } from "react";
import Hls from "hls.js";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause } from "lucide-react";

interface CameraData {
  label: string;
  url: string | null;
}

interface SecurityCameraGridProps {
  cameras: CameraData[];
  onClose: () => void;
}

/* ── Single grid cell with manual play/pause ── */
const GridCell = ({
  cam,
  index,
  onExpand,
}: {
  cam: CameraData;
  index: number;
  onExpand: (index: number) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isReserved = !cam.url;

  const startStream = useCallback(() => {
    if (!cam.url || !videoRef.current || !Hls.isSupported()) return;
    if (hlsRef.current) return; // already loaded

    const hls = new Hls({
      enableWorker: false,
      lowLatencyMode: true,
      manifestLoadingTimeOut: 10000,
      manifestLoadingMaxRetry: 1,
      levelLoadingTimeOut: 10000,
      levelLoadingMaxRetry: 1,
      maxBufferLength: 5,
      maxMaxBufferLength: 10,
    });

    hls.loadSource(cam.url);
    hls.attachMedia(videoRef.current);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setLoaded(true);
      setError(false);
      videoRef.current?.play().catch(() => {});
      setPlaying(true);
    });

    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (data.fatal) {
        setError(true);
        setPlaying(false);
        setLoaded(false);
        hls.destroy();
        hlsRef.current = null;
      }
    });

    hlsRef.current = hls;
  }, [cam.url]);

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReserved) return;

    if (!loaded && !hlsRef.current) {
      startStream();
      return;
    }

    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
        setPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setPlaying(true);
      }
    }
  }, [isReserved, loaded, playing, startStream]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isReserved) onExpand(index);
  }, [isReserved, index, onExpand]);

  // Show play icon when not playing; show pause icon on hover when playing
  const showPlayIcon = !isReserved && !error && !playing;
  const showPauseIcon = !isReserved && !error && playing && hovered;

  return (
    <div
      className={`relative w-full h-full overflow-hidden border transition-colors select-none
        ${isReserved
          ? "border-border/20 bg-muted/10"
          : error
            ? "border-destructive/30 bg-black"
            : playing
              ? "border-primary/30 bg-black"
              : "border-border/30 bg-black"
        }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={togglePlay}
      onDoubleClick={handleDoubleClick}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-1.5 px-2 py-1 bg-black/70">
        <div
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            playing
              ? "bg-green-400 shadow-[0_0_4px_hsl(120,60%,50%/0.8)]"
              : isReserved
                ? "bg-muted-foreground/20"
                : error
                  ? "bg-destructive shadow-[0_0_4px_hsl(0,80%,50%/0.6)]"
                  : "bg-muted-foreground/30"
          }`}
        />
        <span className="text-[8px] font-mono text-muted-foreground tracking-widest truncate">
          {cam.label}
        </span>
      </div>

      {/* Reserved */}
      {isReserved && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[7px] text-muted-foreground/30 tracking-widest">RESERVA</span>
        </div>
      )}

      {/* Error */}
      {error && !isReserved && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[7px] text-destructive/60 tracking-widest">SEM SINAL</span>
        </div>
      )}

      {/* Play icon overlay */}
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center backdrop-blur-sm hover:bg-primary/30 transition-colors">
            <Play className="w-5 h-5 text-primary fill-primary/50" />
          </div>
        </div>
      )}

      {/* Pause icon on hover while playing */}
      <AnimatePresence>
        {showPauseIcon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer bg-black/20"
          >
            <div className="w-10 h-10 rounded-full bg-black/40 border border-muted-foreground/30 flex items-center justify-center backdrop-blur-sm">
              <Pause className="w-5 h-5 text-muted-foreground fill-muted-foreground/50" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video element */}
      {!isReserved && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
          style={{ opacity: playing ? 1 : 0, transition: "opacity 0.3s" }}
        />
      )}
    </div>
  );
};

/* ── Expanded single camera view ── */
const ExpandedView = ({
  cam,
  onBack,
}: {
  cam: CameraData;
  onBack: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [live, setLive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);

  const startStream = useCallback(() => {
    if (!cam.url || !videoRef.current || !Hls.isSupported() || hlsRef.current) return;

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      manifestLoadingTimeOut: 8000,
      manifestLoadingMaxRetry: 2,
    });

    hls.loadSource(cam.url);
    hls.attachMedia(videoRef.current);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoRef.current?.play().catch(() => {});
      setLive(true);
      setPlaying(true);
    });

    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (data.fatal) {
        setLive(false);
        setPlaying(false);
        hls.destroy();
        hlsRef.current = null;
      }
    });

    hlsRef.current = hls;
  }, [cam.url]);

  // Auto-start on mount for expanded view
  useState(() => {
    setTimeout(() => startStream(), 100);
  });

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (!live && !hlsRef.current) {
      startStream();
      return;
    }
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    }
  }, [live, playing, startStream]);

  // Cleanup on unmount
  const cleanupRef = useRef(false);
  if (!cleanupRef.current) {
    cleanupRef.current = true;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 bg-black flex flex-col"
      onAnimationComplete={(def: any) => {
        // Cleanup HLS when exiting
        if (def?.opacity === 0 && hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/80 border-b border-primary/20 shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${live ? "bg-green-400 animate-pulse" : "bg-destructive"}`} />
          <span className="text-xs font-mono text-primary tracking-[0.3em]">{cam.label}</span>
          {live && (
            <span className="text-[8px] font-mono text-destructive tracking-widest border border-destructive/40 px-1.5 py-0.5">
              ● REC
            </span>
          )}
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest
            border border-primary/40 text-primary bg-primary/10
            hover:bg-primary/20 hover:border-primary/60 hover:shadow-[0_0_12px_hsl(190,100%,50%/0.3)]
            transition-all rounded-sm"
        >
          <X className="w-3 h-3" />
          Voltar ao Grid
        </button>
      </div>

      {/* Video */}
      <div
        className="flex-1 relative cursor-pointer select-none"
        onDoubleClick={onBack}
        onClick={togglePlay}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {!live && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3">
            <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center cursor-pointer">
              <Play className="w-8 h-8 text-primary fill-primary/40" />
            </div>
            <span className="text-[10px] text-muted-foreground tracking-widest">CLIQUE PARA INICIAR</span>
          </div>
        )}

        {/* Pause overlay on hover while playing */}
        <AnimatePresence>
          {playing && hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center z-20 bg-black/15"
            >
              <div className="w-14 h-14 rounded-full bg-black/40 border border-muted-foreground/30 flex items-center justify-center backdrop-blur-sm">
                <Pause className="w-7 h-7 text-muted-foreground fill-muted-foreground/40" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          muted
          playsInline
          style={{ opacity: live ? 1 : 0, transition: "opacity 0.4s" }}
        />
        {live && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground/40 tracking-widest pointer-events-none">
            DUPLO CLIQUE PARA VOLTAR
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ── Main full-screen grid overlay ── */
const SecurityCameraGrid = ({ cameras, onClose }: SecurityCameraGridProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleClose = useCallback(() => {
    setExpandedIndex(null);
    onClose();
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-primary/20 bg-black/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(190,100%,50%/0.6)]" />
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary text-glow">
            Central de Monitoramento — Mosaico Tático
          </span>
        </div>
        <button
          onClick={handleClose}
          className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest
            border border-destructive/50 text-destructive bg-destructive/10
            hover:bg-destructive/20 hover:border-destructive/70 hover:shadow-[0_0_12px_hsl(0,80%,55%/0.4)]
            transition-all rounded-sm"
        >
          <X className="w-3.5 h-3.5" />
          Encerrar Mosaico
        </button>
      </div>

      {/* Grid area */}
      <div className="flex-1 p-[2px] min-h-0 relative">
        <AnimatePresence>
          {expandedIndex !== null && cameras[expandedIndex] && (
            <ExpandedView
              cam={cameras[expandedIndex]}
              onBack={() => setExpandedIndex(null)}
            />
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-[1px] h-full auto-rows-fr">
          {cameras.map((cam, i) => (
            <GridCell key={i} cam={cam} index={i} onExpand={setExpandedIndex} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SecurityCameraGrid;
