import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, Play, Pause, Radio, Music2 } from "lucide-react";
import AudioVisualizer from "./radio/AudioVisualizer";
import AlbumArtRings from "./radio/AlbumArtRings";
import CyberPlayBtn from "./radio/CyberPlayBtn";

export interface TrackInfo {
  title: string;
  artist: string;
  albumArt?: string;
  timestamp: number;
}

const STREAM_URL = "https://stream.igorfucknsystem.com.br/live";
const METADATA_INTERVAL = 10000;

async function fetchAlbumArt(artist: string, title: string): Promise<string> {
  const query = `${artist} ${title}`.trim();
  if (!query) return "";
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`,
      { signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    if (data.results?.[0]?.artworkUrl100) {
      return data.results[0].artworkUrl100.replace("100x100", "600x600");
    }
  } catch {}
  try {
    const res = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1&output=json`,
      { signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    if (data.data?.[0]?.album?.cover_big) return data.data[0].album.cover_big;
  } catch {}
  return "";
}

async function fetchStreamMetadata(): Promise<{ title: string; artist: string } | null> {
  try {
    const res = await fetch(`https://stream.igorfucknsystem.com.br/status-json.xsl`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    const source = data?.icestats?.source;
    const src = Array.isArray(source) ? source[0] : source;
    if (src?.title) {
      const parts = src.title.split(" - ");
      return { artist: parts[0]?.trim() || "", title: parts.slice(1).join(" - ").trim() || src.title };
    }
  } catch {}
  try {
    const res = await fetch(`https://stream.igorfucknsystem.com.br/stats?json=1`, {
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json();
    const title = data?.songtitle || data?.title || "";
    if (title) {
      const parts = title.split(" - ");
      return { artist: parts[0]?.trim() || "", title: parts.slice(1).join(" - ").trim() || title };
    }
  } catch {}
  return null;
}

const WebRadio = () => {
  const [playing, setPlaying] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [metadata, setMetadata] = useState({ title: "Aguardando sinal...", artist: "", albumArt: "" });
  const [history, setHistory] = useState<TrackInfo[]>([]);
  const [energy, setEnergy] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const fetchMeta = useCallback(async () => {
    const result = await fetchStreamMetadata();
    if (!result) return;
    const { title, artist } = result;
    if (title !== metadata.title || artist !== metadata.artist) {
      const albumArt = await fetchAlbumArt(artist, title);
      setMetadata({ title, artist, albumArt });
      setHistory((prev) => {
        const newTrack: TrackInfo = { title, artist, albumArt, timestamp: Date.now() };
        return [newTrack, ...prev].slice(0, 5);
      });
    }
  }, [metadata.title, metadata.artist]);

  useEffect(() => {
    if (!playing) return;
    fetchMeta();
    const interval = setInterval(fetchMeta, METADATA_INTERVAL);
    return () => clearInterval(interval);
  }, [playing, fetchMeta]);

  const startAnalyser = useCallback(() => {
    if (!audioRef.current) return;
    try {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
      const ctx = audioContextRef.current;
      if (!sourceRef.current) sourceRef.current = ctx.createMediaElementSource(audioRef.current);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      sourceRef.current.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < 20; i++) sum += dataArray[i];
        setEnergy(sum / (20 * 255));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.warn("AudioContext failed:", e);
    }
  }, []);

  const stopAnalyser = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (analyserRef.current) { analyserRef.current.disconnect(); analyserRef.current = null; }
    setEnergy(0);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlaying = () => { setConnecting(false); setPlaying(true); fetchMeta(); startAnalyser(); };
    const onPause = () => { setPlaying(false); setConnecting(false); stopAnalyser(); };
    const onError = () => { setConnecting(false); setPlaying(false); setMetadata(p => ({ ...p, title: "Erro de conexão", artist: "Tente novamente" })); stopAnalyser(); };
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    audio.addEventListener("stalled", onError);
    return () => { audio.removeEventListener("playing", onPlaying); audio.removeEventListener("pause", onPause); audio.removeEventListener("error", onError); audio.removeEventListener("stalled", onError); };
  }, [fetchMeta, startAnalyser, stopAnalyser]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing || connecting) { audio.pause(); return; }
    setConnecting(true);
    setMetadata(p => ({ ...p, title: "Conectando...", artist: "" }));
    audio.src = `${STREAM_URL}?t=${Date.now()}`;
    audio.preload = "none";
    audio.volume = muted ? 0 : volume;
    audio.muted = muted;
    audio.load();
    audio.play().catch(() => {
      setConnecting(false);
      setMetadata(p => ({ ...p, title: "Erro ao reproduzir", artist: "Toque play novamente" }));
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
    if (audioRef.current) { audioRef.current.volume = muted ? 0 : v; }
  }, [muted]);

  const statusColor = playing ? "text-neon-green" : connecting ? "text-accent" : "text-muted-foreground";
  const statusText = playing ? "NO AR" : connecting ? "CONECTANDO" : "OFFLINE";

  return (
    <div className="flex flex-col h-full font-mono select-none overflow-hidden">
      <audio ref={audioRef} playsInline />

      {/* === ALBUM ART — large, centered, with SVG rings === */}
      <div className="flex flex-col items-center pt-3 pb-1 px-2">
        <div className="relative">
          <AlbumArtRings playing={playing} energy={energy} size={150} />
          {/* Album art inside the rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-[100px] h-[100px] rounded-full overflow-hidden border border-border/40"
              style={{
                boxShadow: playing
                  ? "0 0 20px hsl(190 100% 50% / 0.3), 0 0 40px hsl(190 100% 50% / 0.1)"
                  : "0 0 8px hsl(0 0% 0% / 0.4)",
              }}
            >
              {metadata.albumArt ? (
                <img src={metadata.albumArt} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                  <Music2 className="w-6 h-6 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-1.5 mt-2">
          <Radio className={`w-2.5 h-2.5 ${statusColor}`} />
          <span className={`text-[8px] tracking-[0.25em] uppercase font-display ${statusColor}`}>
            {statusText}
          </span>
        </div>

        {/* Metadata below art */}
        <p className="text-[11px] text-foreground font-display truncate leading-tight mt-1 max-w-full text-center">
          {metadata.title}
        </p>
        <p className="text-[9px] text-muted-foreground truncate leading-tight mt-0.5 max-w-full text-center">
          {metadata.artist || "—"}
        </p>
      </div>

      {/* === CONTROLS: Play + Volume === */}
      <div className="flex items-center justify-center gap-3 px-3 py-1.5 border-t border-border/20">
        <button onClick={toggleMute} className="text-muted-foreground hover:text-primary transition-colors shrink-0" aria-label="Mute">
          {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
        </button>

        <input
          type="range" min={0} max={1} step={0.01}
          value={muted ? 0 : volume}
          onChange={handleVolume}
          className="flex-1 h-1 appearance-none rounded-full cursor-pointer max-w-[60px]"
          style={{
            background: `linear-gradient(to right, hsl(190 100% 50%) ${(muted ? 0 : volume) * 100}%, hsl(230 20% 15%) ${(muted ? 0 : volume) * 100}%)`,
          }}
          aria-label="Volume"
        />

        <CyberPlayBtn playing={playing} connecting={connecting} onClick={togglePlay} energy={energy} />

        <span className="text-[7px] text-muted-foreground tabular-nums w-8 text-center shrink-0">
          {Math.round((muted ? 0 : volume) * 100)}%
        </span>
      </div>

      {/* === HISTORY === */}
      <div className="border-t border-border/20 px-2 py-1 flex-1 min-h-0 overflow-y-auto">
        <p className="text-[7px] text-muted-foreground tracking-[0.2em] uppercase mb-0.5">Histórico</p>
        {history.length === 0 ? (
          <p className="text-[8px] text-muted-foreground/30 text-center py-1">AGUARDANDO SINAL...</p>
        ) : (
          <div className="space-y-px">
            {history.map((t, i) => (
              <div key={t.timestamp} className={`flex items-center gap-1.5 px-1 py-0.5 rounded-sm text-[8px] ${i === 0 ? "bg-primary/10 border-l-2 border-primary" : "border-l-2 border-transparent opacity-40"}`}>
                {t.albumArt ? (
                  <img src={t.albumArt} alt="" className="w-4 h-4 rounded-sm object-cover shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-sm bg-muted/20 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate leading-tight">{t.title}</p>
                  <p className="text-muted-foreground truncate leading-tight text-[7px]">{t.artist}</p>
                </div>
                {i === 0 && <div className="w-1 h-1 rounded-full bg-primary animate-pulse-glow shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === VISUALIZER === */}
      <div className="h-10 border-t border-border/20 shrink-0">
        <AudioVisualizer analyser={analyserRef.current} playing={playing} />
      </div>
    </div>
  );
};

export default WebRadio;
