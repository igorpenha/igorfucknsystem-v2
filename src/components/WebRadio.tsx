import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

const STREAM_URL = "https://stream.igorfucknsystem.com.br/live";
const BAR_COUNT = 24;

// Simulated spectrum — generates organic-looking bar heights
function generateBars(prev: number[], vol: number): number[] {
  return prev.map((old, i) => {
    const freq = i / BAR_COUNT;
    // Bass-heavy curve: lower bars are taller
    const base = (1 - freq * 0.6) * vol;
    const rand = Math.random() * 0.5 + 0.5;
    const target = base * rand * (0.6 + Math.sin(Date.now() / (300 + i * 40)) * 0.4);
    // Smooth interpolation
    return old * 0.3 + target * 0.7;
  });
}

const WebRadio = () => {
  const [playing, setPlaying] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef(0);
  const [bars, setBars] = useState<number[]>(new Array(BAR_COUNT).fill(0));

  // Simulated visualizer loop
  const startVisualizer = useCallback(() => {
    const tick = () => {
      setBars(prev => generateBars(prev, volume));
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [volume]);

  const stopVisualizer = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    // Smooth decay
    const decay = () => {
      setBars(prev => {
        const next = prev.map(v => v * 0.85);
        if (next.every(v => v < 0.01)) return new Array(BAR_COUNT).fill(0);
        requestAnimationFrame(decay);
        return next;
      });
    };
    decay();
  }, []);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlaying = () => { setConnecting(false); setPlaying(true); startVisualizer(); };
    const onPause = () => { setPlaying(false); setConnecting(false); stopVisualizer(); };
    const onError = () => { setConnecting(false); setPlaying(false); stopVisualizer(); };
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
    };
  }, [startVisualizer, stopVisualizer]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing || connecting) { audio.pause(); return; }
    setConnecting(true);
    audio.src = `${STREAM_URL}?t=${Date.now()}`;
    audio.volume = muted ? 0 : volume;
    audio.muted = muted;
    audio.load();
    audio.play().catch(() => setConnecting(false));
  }, [playing, connecting, muted, volume]);

  const toggleMute = useCallback(() => {
    setMuted(m => {
      const next = !m;
      if (audioRef.current) { audioRef.current.muted = next; audioRef.current.volume = next ? 0 : volume; }
      return next;
    });
  }, [volume]);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = muted ? 0 : v;
  }, [muted]);

  return (
    <div className="flex flex-col h-full font-mono select-none overflow-hidden relative">
      <audio ref={audioRef} playsInline />

      {/* Decorative HUD text */}
      <div className="px-3 pt-2 pb-1 flex items-center justify-between text-[7px] tracking-[0.3em] text-muted-foreground/40 uppercase">
        <span>SYS.NODE // 8050</span>
        <span>ENCRYPTED STREAM</span>
      </div>

      {/* Title: IGOR FUCKN STATION */}
      <div className="px-3 pb-1 text-center">
        <h2 className="text-sm font-display tracking-[0.3em] uppercase leading-tight">
          <span className="text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]">IGOR </span>
          <span className="text-accent drop-shadow-[0_0_8px_hsl(var(--accent)/0.6)]">FUCKN </span>
          <span className="text-neon-green drop-shadow-[0_0_8px_hsl(var(--neon-green)/0.6)]">STATION</span>
        </h2>
      </div>

      {/* LIVE badge */}
      <div className="flex items-center justify-center gap-2 pb-2">
        <AnimatePresence>
          {playing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-2 py-0.5 border border-red-500/50 bg-red-500/10"
              style={{ clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }}
            >
              <motion.div
                className="w-1.5 h-1.5 bg-red-500 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-[8px] tracking-[0.3em] text-red-400 font-display">ON AIR</span>
            </motion.div>
          )}
        </AnimatePresence>
        {!playing && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 border border-muted-foreground/20 bg-muted/10"
            style={{ clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }}>
            <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full" />
            <span className="text-[8px] tracking-[0.3em] text-muted-foreground/50 font-display">
              {connecting ? "LINKING..." : "OFFLINE"}
            </span>
          </div>
        )}
      </div>

      {/* Spectrum Visualizer */}
      <div className="px-3 flex-1 min-h-0 flex items-end justify-center gap-[2px] pb-2">
        {bars.map((val, i) => {
          const hue = 180 + (i / BAR_COUNT) * 140; // cyan → magenta
          const height = Math.max(val * 100, 2);
          return (
            <motion.div
              key={i}
              className="flex-1 min-w-0"
              style={{
                background: `linear-gradient(to top, hsla(${hue}, 100%, 50%, 0.15), hsla(${hue}, 100%, 55%, ${0.4 + val * 0.6}))`,
                boxShadow: val > 0.3 ? `0 0 ${val * 12}px hsla(${hue}, 100%, 50%, ${val * 0.5})` : "none",
                clipPath: "polygon(1px 0, calc(100% - 1px) 0, 100% 100%, 0 100%)",
              }}
              animate={{ height: `${height}%` }}
              transition={{ type: "spring", stiffness: 400, damping: 20, mass: 0.3 }}
            />
          );
        })}
      </div>

      {/* Decorative line */}
      <div className="mx-3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Signal info */}
      <div className="px-3 py-1 flex justify-between text-[7px] tracking-[0.2em] text-muted-foreground/30 uppercase">
        <span>SIGNAL: {playing ? "OPTIMAL" : "STANDBY"}</span>
        <span>FREQ: 8050Hz</span>
      </div>

      {/* Controls */}
      <div className="px-3 py-2 flex items-center gap-2 border-t border-border/20">
        {/* Play button - angular cyberpunk style */}
        <button
          onClick={togglePlay}
          className="relative w-10 h-10 shrink-0 border border-primary/50 bg-primary/10 hover:bg-primary/20 transition-all flex items-center justify-center group"
          style={{ clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)" }}
          aria-label={playing ? "Pausar" : "Play"}
        >
          {connecting ? (
            <motion.div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
          ) : playing ? (
            <Pause className="w-4 h-4 text-primary" />
          ) : (
            <Play className="w-4 h-4 text-primary ml-0.5" />
          )}
          {playing && (
            <motion.div
              className="absolute inset-0 border border-primary/30"
              style={{ clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)" }}
              animate={{ opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </button>

        {/* Mute */}
        <button
          onClick={toggleMute}
          className="w-8 h-8 shrink-0 border border-accent/30 bg-accent/5 hover:bg-accent/15 transition-all flex items-center justify-center"
          style={{ clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)" }}
          aria-label="Mute"
        >
          {muted ? <VolumeX className="w-3.5 h-3.5 text-accent/60" /> : <Volume2 className="w-3.5 h-3.5 text-accent" />}
        </button>

        {/* Volume slider - cyberpunk track */}
        <div className="flex-1 relative h-8 flex items-center">
          <input
            type="range" min={0} max={1} step={0.01}
            value={muted ? 0 : volume}
            onChange={handleVolume}
            className="w-full h-2 appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) ${(muted ? 0 : volume) * 100}%, hsl(var(--muted)) ${(muted ? 0 : volume) * 100}%)`,
              clipPath: "polygon(0 30%, 100% 0, 100% 70%, 0 100%)",
            }}
            aria-label="Volume"
          />
        </div>

        <span className="text-[8px] text-muted-foreground tabular-nums w-7 text-right shrink-0 tracking-wider">
          {Math.round((muted ? 0 : volume) * 100)}%
        </span>
      </div>

      {/* Bottom decorative */}
      <div className="px-3 py-1 flex justify-between text-[6px] tracking-[0.2em] text-muted-foreground/20 uppercase border-t border-border/10">
        <span>CODEC: MP3/MPEG</span>
        <span>LATENCY: LOW</span>
        <span>NODE: ACTIVE</span>
      </div>
    </div>
  );
};

export default WebRadio;
