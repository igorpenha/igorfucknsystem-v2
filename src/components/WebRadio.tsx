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

const STREAM_URL = "https://stream.igorfucknsystem.com.br/live";
const METADATA_INTERVAL = 10000;

// Metadata fetcher with 3 fallback sources
async function fetchAlbumArt(artist: string, title: string): Promise<string> {
  const query = `${artist} ${title}`.trim();
  if (!query) return "";

  // Source 1: iTunes Search API
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

  // Source 2: Deezer API (via CORS proxy or direct)
  try {
    const res = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1&output=json`,
      { signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    if (data.data?.[0]?.album?.cover_big) {
      return data.data[0].album.cover_big;
    }
  } catch {}

  // Source 3: MusicBrainz + Cover Art Archive
  try {
    const res = await fetch(
      `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&limit=1&fmt=json`,
      { signal: AbortSignal.timeout(5000), headers: { "User-Agent": "IgorFunkSystem/1.0" } }
    );
    const data = await res.json();
    const releaseId = data.recordings?.[0]?.releases?.[0]?.id;
    if (releaseId) {
      const coverRes = await fetch(
        `https://coverartarchive.org/release/${releaseId}`,
        { signal: AbortSignal.timeout(4000) }
      );
      const coverData = await coverRes.json();
      if (coverData.images?.[0]?.thumbnails?.large) {
        return coverData.images[0].thumbnails.large;
      }
      if (coverData.images?.[0]?.image) {
        return coverData.images[0].image;
      }
    }
  } catch {}

  return "";
}

// Fetch stream metadata from Icecast/Shoutcast status
async function fetchStreamMetadata(): Promise<{ title: string; artist: string } | null> {
  // Source 1: Try Icecast JSON status
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

  // Source 2: Try 7.html (Shoutcast v1 style)
  try {
    const res = await fetch(`https://stream.igorfucknsystem.com.br/7.html`, {
      signal: AbortSignal.timeout(4000),
    });
    const text = await res.text();
    // Format: <body>X,X,X,X,X,X,current title</body>
    const match = text.match(/<body>(.*?)<\/body>/i);
    if (match) {
      const fields = match[1].split(",");
      const songTitle = fields.slice(6).join(",").trim();
      if (songTitle) {
        const parts = songTitle.split(" - ");
        return { artist: parts[0]?.trim() || "", title: parts.slice(1).join(" - ").trim() || songTitle };
      }
    }
  } catch {}

  // Source 3: Try stats endpoint
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
    const result = await fetchStreamMetadata();
    if (!result) return;

    const { title, artist } = result;
    if (title !== metadata.title || artist !== metadata.artist) {
      // Fetch album art with fallback chain
      const albumArt = await fetchAlbumArt(artist, title);
      setMetadata({ title, artist, albumArt });
      setHistory((prev) => {
        const newTrack: TrackInfo = { title, artist, albumArt, timestamp: Date.now() };
        return [newTrack, ...prev].slice(0, 3);
      });
    }
  }, [metadata.title, metadata.artist]);

  useEffect(() => {
    if (!playing) return;
    fetchMetadata();
    const interval = setInterval(fetchMetadata, METADATA_INTERVAL);
    return () => clearInterval(interval);
  }, [playing, fetchMetadata]);

  const startAnalyser = useCallback(() => {
    if (!audioRef.current) return;
    try {
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
        let sum = 0;
        for (let i = 0; i < 20; i++) sum += dataArray[i];
        setEnergy(sum / (20 * 255));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.warn("AudioContext analyser failed (CORS), skipping visualizer:", e);
    }
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
      const audio = new Audio();
      audio.volume = muted ? 0 : 1;
      audioRef.current = audio;

      // Direct MP3 stream playback — no crossOrigin to avoid CORS block
      audio.src = STREAM_URL;
      audio.load();
      audio.play().then(() => {
        setPlaying(true);
        // Try analyser separately — may fail due to CORS taint
        try {
          audio.crossOrigin = "anonymous";
          startAnalyser();
        } catch {}
      }).catch((err) => {
        console.error("Play failed:", err);
        setMetadata(prev => ({ ...prev, title: "Erro ao reproduzir", artist: "Verifique a conexão" }));
      });
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
          IGOR·FUCKN·STATION
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
