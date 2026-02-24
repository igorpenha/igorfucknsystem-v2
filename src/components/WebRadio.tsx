import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

const STREAM_URL = "https://stream.igorfucknsystem.com.br/live";
const BAR_COUNT = 32;

const WebRadio = () => {
  const [playing, setPlaying] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef(0);
  const barsRef = useRef<HTMLDivElement[]>([]);

  // Metadata placeholders
  const [track, setTrack] = useState({
    title: "Aguardando sinal...",
    artist: "---",
    album: "---",
    cover: "",
  });

  // Simulated visualizer using direct DOM manipulation (no re-renders)
  const startVisualizer = useCallback(() => {
    const tick = () => {
      for (let i = 0; i < BAR_COUNT; i++) {
        const bar = barsRef.current[i];
        if (!bar) continue;
        const freq = i / BAR_COUNT;
        const base = (1 - freq * 0.55) * volume;
        const rand = Math.random() * 0.45 + 0.55;
        const wave = Math.sin(Date.now() / (280 + i * 35)) * 0.35;
        const val = base * rand * (0.65 + wave);
        const h = Math.max(val * 100, 1.5);
        const hue = 185 + (i / BAR_COUNT) * 135;
        bar.style.height = `${h}%`;
        bar.style.background = `linear-gradient(to top, hsla(${hue}, 100%, 50%, 0.08), hsla(${hue}, 100%, 55%, ${0.35 + val * 0.65}))`;
        bar.style.boxShadow = val > 0.35
          ? `0 0 ${val * 10}px hsla(${hue}, 100%, 50%, ${val * 0.4})`
          : "none";
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [volume]);

  // Fallback simulated visualizer (when CORS blocks frequency data)
  

  const stopVisualizer = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    // Smooth decay to zero
    let decaying = true;
    const decay = () => {
      let allDone = true;
      for (let i = 0; i < BAR_COUNT; i++) {
        const bar = barsRef.current[i];
        if (!bar) continue;
        const current = parseFloat(bar.style.height) || 0;
        const next = current * 0.82;
        if (next > 0.5) allDone = false;
        const hue = 185 + (i / BAR_COUNT) * 135;
        bar.style.height = `${Math.max(next, 1.5)}%`;
        bar.style.background = `linear-gradient(to top, hsla(${hue}, 100%, 50%, 0.04), hsla(${hue}, 100%, 55%, 0.1))`;
        bar.style.boxShadow = "none";
      }
      if (!allDone && decaying) requestAnimationFrame(decay);
    };
    decay();
    return () => { decaying = false; };
  }, []);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlaying = () => {
      setConnecting(false);
      setPlaying(true);
      startVisualizer();
      setTrack(t => ({ ...t, title: t.title === "Aguardando sinal..." || t.title === "Conectando..." ? "LIVE BROADCAST" : t.title }));
    };
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
    setTrack(t => ({ ...t, title: "Conectando..." }));
    audio.src = `${STREAM_URL}?t=${Date.now()}`;
    audio.volume = muted ? 0 : volume;
    audio.muted = muted;
    audio.load();
    audio.play().catch(() => {
      setConnecting(false);
      setTrack(t => ({ ...t, title: "Erro de conexão" }));
    });
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

      {/* ── Top decorative ── */}
      <div className="px-2 pt-1.5 pb-1 flex items-center justify-between text-[6px] tracking-[0.3em] uppercase text-muted-foreground/30">
        <span>SYS.NODE // 8050</span>
        <span className="text-primary/40">STREAM_ENCRYPTED</span>
        <span>BPM: SYNCING</span>
      </div>

      {/* ── Title ── */}
      <div className="text-center px-2 pb-1">
        <h2 className="text-[11px] font-display tracking-[0.35em] uppercase leading-none">
          <span className="text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]">IGOR </span>
          <span className="text-accent drop-shadow-[0_0_6px_hsl(var(--accent)/0.5)]">FUCKN </span>
          <span className="text-neon-green drop-shadow-[0_0_6px_hsl(var(--neon-green)/0.5)]">STATION</span>
        </h2>
      </div>

      {/* ── LIVE Badge ── */}
      <div className="flex justify-center pb-1.5">
        <AnimatePresence mode="wait">
          {playing ? (
            <motion.div
              key="live"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 border border-red-500/40 bg-red-500/10"
              style={{ clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)" }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-[7px] tracking-[0.3em] text-red-400 font-display">ON AIR</span>
            </motion.div>
          ) : (
            <motion.div
              key="offline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 border border-muted-foreground/15 bg-muted/5"
              style={{ clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/25" />
              <span className="text-[7px] tracking-[0.3em] text-muted-foreground/40 font-display">
                {connecting ? "LINKING..." : "OFFLINE"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Album Art + Metadata ── */}
      <div className="px-2 pb-1.5 flex items-center gap-2.5">
        <div
          className="w-14 h-14 shrink-0 border overflow-hidden flex items-center justify-center"
          style={{
            borderColor: playing ? "hsl(var(--primary))" : "hsl(var(--border))",
            boxShadow: playing ? "0 0 12px hsl(var(--primary) / 0.25), inset 0 0 8px hsl(var(--primary) / 0.1)" : "none",
            background: "hsl(var(--muted) / 0.15)",
            clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)",
            transition: "border-color 0.3s, box-shadow 0.3s",
          }}
        >
          {track.cover ? (
            <img src={track.cover} alt="Album cover" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <div className="w-5 h-5 border border-primary/20 flex items-center justify-center" style={{ clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)" }}>
                <span className="text-[8px] text-primary/30">♫</span>
              </div>
              <span className="text-[5px] text-muted-foreground/20 tracking-widest">NO DATA</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-[10px] text-foreground font-display tracking-wider truncate leading-tight drop-shadow-[0_0_4px_hsl(var(--primary)/0.3)]">
            {track.title}
          </p>
          <p className="text-[8px] text-accent/70 truncate leading-tight tracking-wider">{track.artist}</p>
          <p className="text-[7px] text-muted-foreground/40 truncate leading-tight tracking-widest uppercase">{track.album}</p>
        </div>
      </div>

      {/* ── Spectrum Visualizer (DOM refs — no React re-renders) ── */}
      <div className="px-2 flex-1 min-h-0 flex items-end justify-center gap-[1.5px] pb-1">
        {Array.from({ length: BAR_COUNT }).map((_, i) => {
          const hue = 185 + (i / BAR_COUNT) * 135;
          return (
            <div
              key={i}
              ref={el => { if (el) barsRef.current[i] = el; }}
              className="flex-1 min-w-0 transition-none"
              style={{
                height: "1.5%",
                background: `linear-gradient(to top, hsla(${hue}, 100%, 50%, 0.04), hsla(${hue}, 100%, 55%, 0.1))`,
                clipPath: "polygon(1px 0, calc(100% - 1px) 0, 100% 100%, 0 100%)",
                willChange: "height, background, box-shadow",
              }}
            />
          );
        })}
      </div>

      {/* ── Signal line ── */}
      <div className="mx-2 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      {/* ── Status ── */}
      <div className="px-2 py-0.5 flex justify-between text-[6px] tracking-[0.15em] text-muted-foreground/25 uppercase">
        <span>SIGNAL: {playing ? "OPTIMAL" : "STANDBY"}</span>
        <span>NODE: {playing ? "ACTV" : "IDLE"}</span>
        <span>FREQ: 8050Hz</span>
      </div>

      {/* ── Controls ── */}
      <div className="px-2 py-1.5 flex items-center gap-1.5 border-t border-border/15">
        <button
          onClick={togglePlay}
          className="relative w-9 h-9 shrink-0 border border-primary/40 bg-primary/8 hover:bg-primary/18 transition-all flex items-center justify-center"
          style={{ clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)" }}
          aria-label={playing ? "Pausar" : "Play"}
        >
          {connecting ? (
            <motion.div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />
          ) : playing ? (
            <Pause className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Play className="w-3.5 h-3.5 text-primary ml-0.5" />
          )}
          {playing && (
            <motion.div
              className="absolute inset-0 border border-primary/20"
              style={{ clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)" }}
              animate={{ opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          )}
        </button>

        <button
          onClick={toggleMute}
          className="w-7 h-7 shrink-0 border border-accent/25 bg-accent/5 hover:bg-accent/12 transition-all flex items-center justify-center"
          style={{ clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)" }}
          aria-label="Mute"
        >
          {muted ? <VolumeX className="w-3 h-3 text-accent/50" /> : <Volume2 className="w-3 h-3 text-accent/80" />}
        </button>

        <div className="flex-1 relative flex items-center">
          <input
            type="range" min={0} max={1} step={0.01}
            value={muted ? 0 : volume}
            onChange={handleVolume}
            className="w-full h-1.5 appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) ${(muted ? 0 : volume) * 100}%, hsl(var(--muted)) ${(muted ? 0 : volume) * 100}%)`,
              clipPath: "polygon(0 25%, 100% 0, 100% 75%, 0 100%)",
            }}
            aria-label="Volume"
          />
        </div>

        <span className="text-[7px] text-muted-foreground/50 tabular-nums w-6 text-right shrink-0 tracking-wider">
          {Math.round((muted ? 0 : volume) * 100)}%
        </span>
      </div>

      {/* ── Bottom ── */}
      <div className="px-2 py-0.5 flex justify-between text-[5px] tracking-[0.2em] text-muted-foreground/15 uppercase border-t border-border/8">
        <span>CODEC: MP3</span>
        <span>LATENCY: LOW</span>
        <span>CIPHER: AES-256</span>
      </div>
    </div>
  );
};

export default WebRadio;
