import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Lock, Volume2, VolumeX, LogIn } from "lucide-react";
import logoImage from "@/assets/logo-new.png";
import { FILE_API_BASE_URL } from "@/config/api";

const STREAM_URL = "https://stream.igorfucknsystem.com.br/live";
const METADATA_URL = `${FILE_API_BASE_URL}/api/radio/now-playing`;

/* ── SVG Circuit Decorations ── */
const CircuitDecorations = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Top-left circuit */}
    <svg className="absolute top-4 left-4 w-32 h-32 opacity-10" viewBox="0 0 128 128" fill="none">
      <motion.path
        d="M0 64 H32 L40 56 H72 L80 64 H112"
        stroke="hsl(var(--primary))"
        strokeWidth="0.8"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
      <motion.path
        d="M32 0 V24 L40 32 V56"
        stroke="hsl(var(--primary))"
        strokeWidth="0.8"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
      />
      <motion.path
        d="M80 128 V100 L72 92 V64"
        stroke="hsl(var(--accent))"
        strokeWidth="0.5"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 2 }}
      />
      <motion.circle cx="40" cy="56" r="3" fill="hsl(var(--primary))" animate={{ opacity: [0.2, 0.9, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.circle cx="80" cy="64" r="2" fill="hsl(var(--accent))" animate={{ opacity: [0.1, 0.7, 0.1] }} transition={{ duration: 2.5, repeat: Infinity }} />
    </svg>

    {/* Bottom-right circuit */}
    <svg className="absolute bottom-4 right-4 w-32 h-32 opacity-10 rotate-180" viewBox="0 0 128 128" fill="none">
      <motion.path
        d="M0 64 H32 L40 56 H72 L80 64 H112"
        stroke="hsl(var(--accent))"
        strokeWidth="0.8"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 0.5 }}
      />
      <motion.circle cx="40" cy="56" r="3" fill="hsl(var(--accent))" animate={{ opacity: [0.1, 0.8, 0.1] }} transition={{ duration: 3, repeat: Infinity }} />
    </svg>

    {/* Top-right rotating HUD */}
    <motion.svg
      className="absolute top-8 right-8 w-20 h-20 opacity-[0.07]"
      viewBox="0 0 80 80"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="40" cy="40" r="36" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeDasharray="6 12" />
      <circle cx="40" cy="40" r="24" stroke="hsl(var(--secondary))" strokeWidth="0.3" strokeDasharray="4 10" />
      <circle cx="40" cy="40" r="12" stroke="hsl(var(--accent))" strokeWidth="0.3" strokeDasharray="2 8" />
      <line x1="40" y1="4" x2="40" y2="16" stroke="hsl(var(--primary))" strokeWidth="0.5" />
      <line x1="76" y1="40" x2="64" y2="40" stroke="hsl(var(--primary))" strokeWidth="0.5" />
    </motion.svg>

    {/* Bottom-left rotating HUD */}
    <motion.svg
      className="absolute bottom-8 left-8 w-16 h-16 opacity-[0.06]"
      viewBox="0 0 64 64"
      fill="none"
      animate={{ rotate: -360 }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
    >
      <polygon points="32,2 62,32 32,62 2,32" stroke="hsl(var(--secondary))" strokeWidth="0.4" fill="none" />
      <polygon points="32,12 52,32 32,52 12,32" stroke="hsl(var(--primary))" strokeWidth="0.3" fill="none" />
    </motion.svg>

    {/* Floating data lines - left */}
    <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-48 opacity-15" viewBox="0 0 16 192" fill="none">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <motion.line
          key={i}
          x1="8" y1={i * 32 + 8} x2="8" y2={i * 32 + 24}
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          strokeLinecap="round"
          animate={{ scaleY: [0.4, 1.6, 0.4], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        />
      ))}
    </svg>

    {/* Floating data lines - right */}
    <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-48 opacity-15" viewBox="0 0 16 192" fill="none">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <motion.line
          key={i}
          x1="8" y1={i * 32 + 8} x2="8" y2={i * 32 + 24}
          stroke="hsl(var(--accent))"
          strokeWidth="1"
          strokeLinecap="round"
          animate={{ scaleY: [0.4, 1.6, 0.4], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 1.8 + i * 0.25, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        />
      ))}
    </svg>

    {/* Horizontal scan pulse */}
    <motion.div
      className="absolute top-1/3 left-0 w-full h-px"
      style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), transparent)" }}
      animate={{ opacity: [0, 0.6, 0], y: [0, 200, 400] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

/* ── Glitch Logo ── */
const GlitchLogo = () => {
  const [glitch, setGlitch] = useState(false);
  const [intensity, setIntensity] = useState(0);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setIntensity(Math.random() < 0.3 ? 2 : 1);
        setGlitch(true);
        t = setTimeout(() => { setGlitch(false); loop(); }, 80 + Math.random() * 120);
      }, 1500 + Math.random() * 2500);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-20 h-20 mx-auto mb-4 overflow-hidden rounded-md">
      <motion.img src={logoImage} alt="System Logo" className="absolute inset-0 w-full h-full object-contain"
        animate={{ x: glitch ? (Math.random() - 0.5) * intensity * 3 : 0 }}
        transition={{ duration: 0.02 }}
      />
      <motion.img src={logoImage} alt="" className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ mixBlendMode: "screen" }}
        animate={{
          x: glitch ? intensity * 2.5 : 0,
          opacity: glitch ? 0.5 : 0,
          filter: glitch ? "hue-rotate(-30deg) saturate(3)" : "none",
          clipPath: glitch ? `inset(${Math.random() * 40}% 0% ${Math.random() * 40}% 0%)` : "inset(0% 0% 100% 0%)",
        }}
        transition={{ duration: 0.02 }}
      />
      <motion.img src={logoImage} alt="" className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ mixBlendMode: "screen" }}
        animate={{
          x: glitch ? -intensity * 3 : 0,
          opacity: glitch ? 0.4 : 0,
          filter: glitch ? "hue-rotate(160deg) saturate(2.5)" : "none",
          clipPath: glitch ? `inset(${20 + Math.random() * 30}% 0% ${10 + Math.random() * 30}% 0%)` : "inset(0% 0% 100% 0%)",
        }}
        transition={{ duration: 0.02 }}
      />
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)" }}
      />
      {/* Neon border pulse */}
      <motion.div className="absolute inset-0 rounded-md pointer-events-none"
        style={{ border: "1px solid hsl(var(--primary))" }}
        animate={{ boxShadow: ["0 0 4px hsl(var(--primary) / 0.3)", "0 0 16px hsl(var(--primary) / 0.6)", "0 0 4px hsl(var(--primary) / 0.3)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
};

/* ── Mini Radio Player ── */
const MiniRadioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [track, setTrack] = useState({ title: "Offline", artist: "" });
  const [artUrl, setArtUrl] = useState("");

  const fetchMeta = useCallback(async () => {
    try {
      const r = await fetch(METADATA_URL);
      if (!r.ok) return;
      const d = await r.json();
      setTrack({ title: d.title || "Desconhecido", artist: d.artist || "" });
      if (d.art) setArtUrl(d.art);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchMeta();
    const iv = setInterval(fetchMeta, 10_000);
    return () => clearInterval(iv);
  }, [fetchMeta]);

  useEffect(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.crossOrigin = "anonymous";
      audioRef.current = a;
    }
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.src = `${STREAM_URL}?t=${Date.now()}`;
      a.volume = muted ? 0 : volume;
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (audioRef.current) audioRef.current.volume = next ? 0 : volume;
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current && !muted) audioRef.current.volume = v;
  };

  return (
    <div className="w-full mt-6 p-3 rounded-md border border-border/50 relative overflow-hidden"
      style={{ background: "hsl(230 20% 5% / 0.8)", backdropFilter: "blur(12px)" }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5), hsl(var(--secondary) / 0.5), transparent)" }}
      />

      <div className="flex items-center gap-3">
        {/* Album art */}
        <button onClick={togglePlay} className="relative w-12 h-12 rounded-sm overflow-hidden shrink-0 border border-border/30 group">
          {artUrl ? (
            <img src={artUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          {/* Play overlay */}
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="2" width="4" height="12" rx="1" fill="hsl(var(--primary))" /><rect x="9" y="2" width="4" height="12" rx="1" fill="hsl(var(--primary))" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16"><polygon points="3,1 14,8 3,15" fill="hsl(var(--primary))" /></svg>
            )}
          </div>
          {/* Vinyl spin indicator */}
          {playing && (
            <motion.div className="absolute inset-0 border border-primary/30 rounded-sm pointer-events-none"
              animate={{ boxShadow: ["inset 0 0 4px hsl(var(--primary)/0.2)", "inset 0 0 8px hsl(var(--primary)/0.5)", "inset 0 0 4px hsl(var(--primary)/0.2)"] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </button>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-display tracking-wider text-foreground truncate">
            {track.title}
          </p>
          {track.artist && (
            <p className="text-[9px] tracking-widest text-muted-foreground truncate mt-0.5">
              {track.artist}
            </p>
          )}
          <p className="text-[8px] tracking-[0.3em] text-primary/50 mt-1 font-display">
            {playing ? "▶ ON AIR" : "■ OFFLINE"}
          </p>
        </div>

        {/* Mute + Volume */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <input
            type="range" min={0} max={1} step={0.01} value={volume}
            onChange={e => handleVolume(parseFloat(e.target.value))}
            className="w-16 h-1 accent-primary bg-muted rounded-full appearance-none cursor-pointer"
            style={{ accentColor: "hsl(var(--primary))" }}
          />
        </div>
      </div>
    </div>
  );
};

/* ── Login Page ── */
const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Aipp9832!") {
      onLogin();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center overflow-hidden z-50">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <motion.div className="absolute inset-0 opacity-[0.02]"
        animate={{ backgroundPosition: ["0px 0px", "60px 60px"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--secondary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--secondary)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Vertical scan line */}
      <motion.div
        className="absolute top-0 bottom-0 w-px z-0"
        style={{ background: "linear-gradient(180deg, transparent, hsl(var(--primary) / 0.2), transparent)" }}
        animate={{ left: ["-5%", "105%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <CircuitDecorations />

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="p-6 rounded-md border border-border/50 relative overflow-hidden"
          style={{ background: "hsl(230 20% 6% / 0.85)", backdropFilter: "blur(20px)" }}
        >
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), hsl(var(--secondary) / 0.6), hsl(var(--accent) / 0.4), transparent)" }}
          />

          <GlitchLogo />

          {/* System title */}
          <div className="text-center mb-6">
            <h1 className="font-display text-sm tracking-[0.25em] flex gap-2 justify-center">
              <span style={{ color: "hsl(50 100% 55%)", textShadow: "0 0 8px hsl(50 100% 50% / 0.5)" }}>IGOR</span>
              <span style={{ color: "hsl(320 100% 55%)", textShadow: "0 0 8px hsl(320 100% 50% / 0.5)" }}>FUCKN</span>
              <span style={{ color: "hsl(190 100% 55%)", textShadow: "0 0 8px hsl(190 100% 50% / 0.5)" }}>SYSTEM</span>
            </h1>
            <p className="text-[9px] text-muted-foreground tracking-[0.3em] mt-1 font-display">ACESSO RESTRITO</p>
          </div>

          {/* Password form */}
          <form onSubmit={handleSubmit}>
            <motion.div
              animate={shaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <div className="relative mb-4">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(false); }}
                  placeholder="SENHA DE ACESSO"
                  autoFocus
                  className="w-full pl-9 pr-4 py-2.5 text-xs tracking-widest bg-muted/30 border rounded-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 transition-all font-mono"
                  style={{
                    borderColor: error ? "hsl(var(--destructive))" : "hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                  onFocus={e => { e.target.style.borderColor = "hsl(var(--primary))"; e.target.style.boxShadow = "0 0 8px hsl(var(--primary) / 0.3)"; }}
                  onBlur={e => { if (!error) { e.target.style.borderColor = "hsl(var(--border))"; e.target.style.boxShadow = "none"; }}}
                />
              </div>
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[9px] tracking-widest text-destructive mb-3 text-center font-display"
              >
                ⚠ ACESSO NEGADO — SENHA INCORRETA
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-sm text-[10px] font-display tracking-[0.3em] border transition-all duration-300 flex items-center justify-center gap-2 group"
              style={{
                background: "hsl(var(--primary) / 0.1)",
                borderColor: "hsl(var(--primary) / 0.4)",
                color: "hsl(var(--primary))",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "hsl(var(--primary) / 0.2)";
                e.currentTarget.style.boxShadow = "0 0 16px hsl(var(--primary) / 0.3)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "hsl(var(--primary) / 0.1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <LogIn className="w-3.5 h-3.5" />
              ENTRAR
            </button>
          </form>

          {/* Mini Radio Player */}
          <MiniRadioPlayer />

          {/* Bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, hsl(var(--secondary) / 0.3), transparent)" }}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-[8px] text-muted-foreground/40 tracking-[0.3em] mt-3 font-display">
          © 2026 IGOR FUCKN SYSTEM // v2.0
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
