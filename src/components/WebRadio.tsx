import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FILE_API_BASE_URL } from "@/config/api";
import CoverFlowCarousel from "@/components/radio/CoverFlowCarousel";
import CarouselErrorBoundary from "@/components/radio/CarouselErrorBoundary";
import TrackHistory from "@/components/radio/TrackHistory";
import RadioSvgDecorations from "@/components/radio/RadioSvgDecorations";

const STREAM_URL = "https://stream.igorfucknsystem.com.br/live";
const METADATA_URL = `${FILE_API_BASE_URL}/api/radio/now-playing`;
const METADATA_INTERVAL = 10_000;
const BAR_COUNT = 32;

/* ── Mini Audio Bars ── */
const MiniAudioBars = ({ active }: { active: boolean }) => (
  <svg width="16" height="24" viewBox="0 0 16 24" className="shrink-0">
    {[0, 1, 2, 3].map(i => (
      <rect
        key={i}
        x={i * 4}
        y={active ? 4 : 18}
        width="2.5"
        height={active ? 20 : 6}
        rx="1"
        fill="hsl(var(--primary))"
        opacity={active ? 0.8 : 0.2}
        style={{
          animation: active ? `miniBar ${0.4 + i * 0.15}s ease-in-out infinite alternate` : "none",
        }}
      />
    ))}
    <style>{`
      @keyframes miniBar {
        0% { y: 16; height: 8; }
        100% { y: 4; height: 20; }
      }
    `}</style>
  </svg>
);

/* ── Play/Pause Icon ── */
const PlayPauseIcon = ({ playing, connecting }: { playing: boolean; connecting: boolean }) => {
  if (connecting) {
    return (
      <motion.svg width="18" height="18" viewBox="0 0 18 18" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
        <circle cx="9" cy="9" r="7" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="12 30" strokeLinecap="round" />
      </motion.svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <AnimatePresence mode="wait">
        {playing ? (
          <motion.g key="pause" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.15 }}>
            <rect x="4" y="3" width="3.5" height="12" rx="1" fill="hsl(var(--primary))" />
            <rect x="10.5" y="3" width="3.5" height="12" rx="1" fill="hsl(var(--primary))" />
          </motion.g>
        ) : (
          <motion.g key="play" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.15 }}>
            <path d="M5 3.5 L15 9 L5 14.5Z" fill="hsl(var(--primary))" />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
};

/* ── Volume Icon ── */
const VolumeIcon = ({ muted }: { muted: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 L6 9 H2 V15 H6 L11 19Z" fill="hsl(var(--accent)/0.15)" />
    {muted ? (
      <motion.g key="muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <line x1="23" y1="9" x2="17" y2="15" stroke="hsl(var(--destructive, 0 84% 60%))" />
        <line x1="17" y1="9" x2="23" y2="15" stroke="hsl(var(--destructive, 0 84% 60%))" />
      </motion.g>
    ) : (
      <motion.g key="unmuted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.path d="M15.5 8.5 A4 4 0 0 1 15.5 15.5" animate={{ pathLength: [0, 1] }} transition={{ duration: 0.3 }} />
        <motion.path d="M19 6 A8 8 0 0 1 19 18" opacity={0.5} animate={{ pathLength: [0, 1] }} transition={{ duration: 0.4, delay: 0.1 }} />
      </motion.g>
    )}
  </svg>
);

interface TrackHistoryEntry {
  title: string;
  artist: string;
  albumArt?: string;
  timestamp: number;
}

const WebRadio = () => {
  const [playing, setPlaying] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frameRef = useRef(0);
  const barsRef = useRef<HTMLDivElement[]>([]);

  const [track, setTrack] = useState({
    title: "Aguardando sinal...",
    artist: "SCANNING...",
    album: "NO_DATA",
    cover: "",
    coverPrev: "",
    coverNext: "",
  });
  const [coverError, setCoverError] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);
  const lastTrackRef = useRef("");
  const [trackHistory, setTrackHistory] = useState<TrackHistoryEntry[]>([]);

  // Ref to hold latest track data — prevents stale closures from cloning current into previous
  const trackRef = useRef(track);
  useEffect(() => { trackRef.current = track; }, [track]);

  // ── Metadata polling ──
  useEffect(() => {
    if (!playing) return;
    let active = true;
    const fetchMeta = async () => {
      try {
        const res = await fetch(METADATA_URL);
        if (!res.ok) throw new Error("metadata fetch failed");
        const data = await res.json();
        if (active) {
          const ts = Date.now();
          const newCover = `${FILE_API_BASE_URL}/api/radio/artwork?t=${ts}`;
          const newCoverPrev = `${FILE_API_BASE_URL}/api/radio/artwork-prev?t=${ts}`;
          const newCoverNext = `${FILE_API_BASE_URL}/api/radio/artwork-next?t=${ts}`;
          // Clean metadata: RadioBOSS concatenates current + next track with \r\n
          const cleanTitle = (data.title || "LIVE BROADCAST").split(/\r?\n/)[0].trim();
          const cleanArtist = (data.artist || "SCANNING...").split(/\r?\n/)[0].trim();
          const trackId = `${cleanArtist}-${cleanTitle}`;

          // Read latest track from ref to avoid stale closure
          const prevTrack = trackRef.current;

          if (prevTrack.cover !== newCover) setCoverError(false);

          if (lastTrackRef.current && lastTrackRef.current !== trackId) {
            setTransitionKey(k => k + 1);
            // Add PREVIOUS track to history (the one that just finished)
            setTrackHistory(h => {
              const entry: TrackHistoryEntry = {
                title: prevTrack.title !== "Conectando..." ? prevTrack.title : "UNKNOWN",
                artist: prevTrack.artist !== "SCANNING..." ? prevTrack.artist : "UNKNOWN",
                albumArt: prevTrack.cover,
                timestamp: ts,
              };
              return [entry, ...h].slice(0, 3);
            });
          }
          lastTrackRef.current = trackId;

          setTrack({
            title: cleanTitle,
            artist: cleanArtist,
            album: data.album || "NO_DATA",
            cover: newCover,
            coverPrev: newCoverPrev,
            coverNext: newCoverNext,
          });
        }
      } catch {
        if (active) {
          setTrack(t => ({
            ...t,
            title: t.title === "Conectando..." ? "LIVE BROADCAST" : t.title,
          }));
        }
      }
    };
    fetchMeta();
    const id = setInterval(fetchMeta, METADATA_INTERVAL);
    return () => { active = false; clearInterval(id); };
  }, [playing]);

  // ── Web Audio analyser ──
  const startAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = ctxRef.current;
      if (!sourceRef.current) sourceRef.current = ctx.createMediaElementSource(audio);
      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.85;
        sourceRef.current.connect(analyser);
        analyser.connect(ctx.destination);
        analyserRef.current = analyser;
      }
      if (ctx.state === "suspended") ctx.resume();
      const analyser = analyserRef.current;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      // Dispatch playing state
      window.dispatchEvent(new CustomEvent("radio-state", { detail: { playing: true } }));
      const tick = () => {
        analyser.getByteFrequencyData(dataArray);

        // Calculate bass energy (first 4 bins = sub-bass + bass)
        const bassEnd = Math.min(4, dataArray.length);
        let bassSum = 0;
        for (let b = 0; b < bassEnd; b++) bassSum += dataArray[b];
        const bassEnergy = bassSum / (bassEnd * 255);
        window.dispatchEvent(new CustomEvent("radio-energy", { detail: { energy: bassEnergy } }));

        for (let i = 0; i < BAR_COUNT; i++) {
          const bar = barsRef.current[i];
          if (!bar) continue;
          const highLift = 1 + (i / BAR_COUNT) * 0.35;
          const raw = Math.min((dataArray[i] / 255) * highLift, 1);
          const val = Math.pow(raw, 0.85);
          const h = Math.max(val * 80, 1.5);
          const hue = 185 + (i / BAR_COUNT) * 135;
          const glow = val * val;
          bar.style.height = `${h}%`;
          bar.style.background = `linear-gradient(to top, hsla(${hue}, 100%, 50%, 0.08), hsla(${hue}, 100%, 55%, ${0.3 + val * 0.7}))`;
          bar.style.boxShadow = val > 0.2
            ? `0 0 ${4 + glow * 14}px hsla(${hue}, 100%, 55%, ${0.15 + glow * 0.55}), 0 0 ${2 + glow * 6}px hsla(${hue}, 100%, 70%, ${glow * 0.4})`
            : "none";
        }
        frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    } catch (e) {
      console.warn("AudioContext init failed:", e);
    }
  }, []);

  const stopAnalyser = useCallback(() => {
    window.dispatchEvent(new CustomEvent("radio-state", { detail: { playing: false } }));
    cancelAnimationFrame(frameRef.current);
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlaying = () => { setConnecting(false); setPlaying(true); startAnalyser(); };
    const onPause = () => { setPlaying(false); setConnecting(false); stopAnalyser(); };
    const onError = () => { setConnecting(false); setPlaying(false); stopAnalyser(); };
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    return () => { audio.removeEventListener("playing", onPlaying); audio.removeEventListener("pause", onPause); audio.removeEventListener("error", onError); };
  }, [startAnalyser, stopAnalyser]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing || connecting) { audio.pause(); return; }
    setConnecting(true);
    setTrack(t => ({ ...t, title: "Conectando..." }));
    audio.src = `${STREAM_URL}?t=${Date.now()}`;
    audio.crossOrigin = "anonymous";
    audio.volume = muted ? 0 : volume;
    audio.muted = muted;
    audio.load();
    audio.play().catch(() => { setConnecting(false); setTrack(t => ({ ...t, title: "Erro de conexão" })); });
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
    <div
      className="font-mono select-none overflow-hidden relative flex-1 min-h-0 flex flex-col"
      style={{ height: "100%", width: "100%" }}
    >
      {/* SVG Decorations */}
      <RadioSvgDecorations />

      <audio ref={audioRef} playsInline crossOrigin="anonymous" />

      {/* ═══ METADE SUPERIOR (50%): Controles + Visualizador ancorado na base ═══ */}
      <div className="h-1/2 flex flex-col min-h-0 relative z-10">

      {/* Controles */}
      <div className="px-2 pt-2 pb-1.5 flex items-center gap-2 border-b border-border/15 shrink-0">
        <button
          onClick={togglePlay}
          className="relative w-10 h-10 shrink-0 border border-primary/40 bg-primary/[0.08] hover:bg-primary/[0.18] transition-all flex items-center justify-center"
          style={{ clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)" }}
          aria-label={playing ? "Pausar" : "Play"}
        >
          <PlayPauseIcon playing={playing} connecting={connecting} />
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
          className="w-8 h-8 shrink-0 border border-accent/25 bg-accent/5 hover:bg-accent/[0.12] transition-all flex items-center justify-center"
          style={{ clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)" }}
          aria-label="Mute"
        >
          <VolumeIcon muted={muted} />
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

        <AnimatePresence mode="wait">
          {playing ? (
            <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-1 px-2 py-0.5 border border-destructive/40 bg-destructive/10"
              style={{ clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)" }}
            >
              <motion.div className="w-1.5 h-1.5 rounded-full bg-destructive" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />
              <span className="text-[7px] tracking-[0.3em] text-destructive font-display">LIVE</span>
            </motion.div>
          ) : (
            <motion.div key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-1 px-2 py-0.5 border border-muted-foreground/15 bg-muted/5"
              style={{ clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/25" />
              <span className="text-[7px] tracking-[0.3em] text-muted-foreground/40 font-display">
                {connecting ? "LINK..." : "OFF"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Visualizador de Espectro — mt-auto ancora na base da metade superior */}
      <div className="px-0 flex items-end justify-center gap-[1.5px] py-2 min-h-0 mt-auto flex-1" >
        {Array.from({ length: BAR_COUNT }).map((_, i) => {
          const hue = 185 + (i / BAR_COUNT) * 135;
          return (
            <div
              key={i}
              ref={el => { if (el) barsRef.current[i] = el; }}
              className="flex-1 min-w-0"
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

      </div>{/* Fim da metade superior */}

      {/* ═══ METADE INFERIOR (50%): Capas + Metadados + Histórico ═══ */}
      <div className="h-1/2 flex flex-col min-h-0 relative z-10">

      {/* Carrossel + Metadados */}
      <div className="px-1 flex flex-col items-center justify-center gap-1.5 border-t border-border/15 overflow-hidden py-3 shrink-0">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        <CarouselErrorBoundary>
          <CoverFlowCarousel
            currentCover={coverError ? "" : track.cover}
            prevCover={trackHistory.length > 0 ? trackHistory[0].albumArt || "" : ""}
            nextCover={track.coverNext}
            playing={playing}
            transitionKey={transitionKey}
          />
        </CarouselErrorBoundary>
        <div className="flex items-center gap-2 w-full relative z-10 -mt-8">
          <MiniAudioBars active={playing} />
          <div className="flex-1 min-w-0 space-y-0.5 text-center">
            <p className="text-[11px] text-foreground font-display tracking-wider truncate leading-tight drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]">
              {track.title}
            </p>
            <p className={`tracking-wider truncate leading-tight font-display ${track.artist === "SCANNING..." ? "text-[9px] text-muted-foreground/40" : "text-lg text-accent drop-shadow-[0_0_8px_hsl(var(--accent)/0.5)]"}`}>
              {track.artist}
            </p>
          </div>
          <div className="-scale-x-100">
            <MiniAudioBars active={playing} />
          </div>
        </div>
      </div>

      {/* Histórico de Transmissão — mt-auto ancora na base */}
      <div className="overflow-y-auto hud-scroll mt-auto">
        <TrackHistory tracks={trackHistory} />
      </div>

      {/* Footer decorativo */}
      <div className="px-2 py-0.5 flex justify-between text-[5px] tracking-[0.2em] text-muted-foreground/15 uppercase border-t border-border/8 shrink-0">
        <span>CODEC: MP3</span>
        <span>LATENCY: LOW</span>
        <span>CIPHER: AES-256</span>
      </div>

      </div>{/* Fim da metade inferior */}

    </div>
  );
};

export default WebRadio;
