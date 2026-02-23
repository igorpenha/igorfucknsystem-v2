import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import VinylDisc from "./radio/VinylDisc";
import CyberPlayButton from "./radio/CyberPlayButton";
import TrackHistory from "./radio/TrackHistory";
import AudioVisualizer from "./radio/AudioVisualizer";

export interface TrackInfo {
  title: string;
  artist: string;
  albumArt?: string;
  timestamp: number;
}

const STREAM_URL = "https://stream.zeno.fm/yn65fsaurfhvv";
const METADATA_INTERVAL = 10000;

const WebRadio = () => {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [metadata, setMetadata] = useState({ title: "Aguardando sinal...", artist: "", albumArt: "" });
  const [history, setHistory] = useState<TrackInfo[]>([]);
  const [energy, setEnergy] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const fetchMetadata = useCallback(async () => {
    try {
      // Try fetching from stream info
      const res = await fetch(`https://api.zeno.fm/mounts/metadata/subscribe/yn65fsaurfhvv`, {
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json();
      if (data?.streamTitle) {
        const parts = data.streamTitle.split(" - ");
        const artist = parts[0]?.trim() || "";
        const title = parts[1]?.trim() || data.streamTitle;

        // Search album art from iTunes
        let albumArt = "";
        try {
          const searchQuery = encodeURIComponent(`${artist} ${title}`);
          const itunesRes = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&media=music&limit=1`);
          const itunesData = await itunesRes.json();
          if (itunesData.results?.[0]?.artworkUrl100) {
            albumArt = itunesData.results[0].artworkUrl100.replace("100x100", "600x600");
          }
        } catch {}

        if (title !== metadata.title || artist !== metadata.artist) {
          setMetadata({ title, artist, albumArt });
          setHistory((prev) => {
            const newTrack: TrackInfo = { title, artist, albumArt, timestamp: Date.now() };
            return [newTrack, ...prev].slice(0, 3);
          });
        }
      }
    } catch {}
  }, [metadata.title, metadata.artist]);

  useEffect(() => {
    if (!playing) return;
    fetchMetadata();
    const interval = setInterval(fetchMetadata, METADATA_INTERVAL);
    return () => clearInterval(interval);
  }, [playing, fetchMetadata]);

  const startAnalyser = useCallback(() => {
    if (!audioRef.current) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;
    if (!sourceRef.current) {
      sourceRef.current = ctx.createMediaElementSource(audioRef.current);
    }
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.4;
    sourceRef.current.connect(analyser);
    analyser.connect(ctx.destination);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      // Calculate energy from low frequencies
      let sum = 0;
      for (let i = 0; i < 20; i++) sum += dataArray[i];
      setEnergy(sum / (20 * 255));
      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const stopAnalyser = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    setEnergy(0);
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) {
      audioRef.current?.pause();
      audioRef.current = null;
      stopAnalyser();
      setPlaying(false);
    } else {
      const audio = new Audio(STREAM_URL);
      audio.crossOrigin = "anonymous";
      audio.volume = muted ? 0 : 1;
      audioRef.current = audio;
      audio.play().then(() => {
        setPlaying(true);
        startAnalyser();
      }).catch(console.error);
    }
  }, [playing, muted, startAnalyser, stopAnalyser]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (audioRef.current) audioRef.current.volume = m ? 1 : 0;
      return !m;
    });
  }, []);

  return (
    <div className="flex flex-col bg-card/90 backdrop-blur-md border border-border rounded-sm overflow-hidden font-mono relative max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30">
        <button onClick={toggleMute} className="text-muted-foreground hover:text-primary transition-colors">
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
        <span className="text-[10px] font-display tracking-[0.2em] text-primary">
          IGORP-PUNK-STATION
        </span>
        <span className={`text-[9px] tracking-wider ${playing ? "text-neon-green" : "text-muted-foreground"}`}>
          {playing ? "NO AR" : "OFFLINE"}
        </span>
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/40" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/40" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/40" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/40" />

      {/* Vinyl + Metadata */}
      <div className="flex flex-col items-center pt-5 pb-2 px-4">
        <VinylDisc albumArt={metadata.albumArt} playing={playing} />

        <div className="mt-3 text-center overflow-hidden max-w-full">
          <h3 className="text-sm font-display text-foreground truncate max-w-full">
            {metadata.title}
          </h3>
          <p
            className="text-xs mt-0.5 truncate max-w-full"
            style={playing ? {
              animation: "artist-glow-pulse 3s ease-in-out infinite",
            } : { color: "hsl(190 30% 50%)" }}
          >
            {/* Blinking dashes */}
            {playing && (
              <svg className="inline-block w-2 h-2 mr-1 animate-pulse-glow" viewBox="0 0 8 2">
                <rect width="8" height="2" fill="hsl(190,100%,50%)" rx="1" />
              </svg>
            )}
            {metadata.artist}
            {playing && (
              <svg className="inline-block w-2 h-2 ml-1 animate-pulse-glow" viewBox="0 0 8 2">
                <rect width="8" height="2" fill="hsl(190,100%,50%)" rx="1" />
              </svg>
            )}
          </p>
        </div>
      </div>

      {/* Play button */}
      <div className="flex items-center justify-center py-1 pb-3">
        <CyberPlayButton playing={playing} onClick={togglePlay} energy={energy} />
      </div>

      {/* Track History */}
      <TrackHistory tracks={history} />

      {/* Visualizer */}
      <AudioVisualizer analyser={analyserRef.current} playing={playing} />
    </div>
  );
};

export default WebRadio;
