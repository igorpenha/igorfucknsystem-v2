import { useState, useCallback, useRef, useEffect } from "react";
import { Camera, StopCircle, RotateCcw } from "lucide-react";
import HudPanel from "./HudPanel";

const CAMERAS = [
  { label: "Câmera 1", url: "http://192.168.0.57:3000/cam1.m3u8" },
  { label: "Câmera 2", url: "http://192.168.0.57:3000/cam2.m3u8" },
  { label: "Câmera 3", url: "http://192.168.0.57:3000/cam3.m3u8" },
];

const SecurityCameraPanel = () => {
  const [activeCamera, setActiveCamera] = useState<number | null>(null);
  const [autoRotation, setAutoRotation] = useState(false);
  const [status, setStatus] = useState<"standby" | "online" | "error">("standby");
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const rotationRef = useRef<ReturnType<typeof setInterval>>();

  const loadCamera = useCallback(async (index: number) => {
    setActiveCamera(index);
    setStatus("online");

    // Dynamic import hls.js
    try {
      const Hls = (await import("hls.js")).default;
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (videoRef.current && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(CAMERAS[index].url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.ERROR, () => {
          setStatus("error");
        });
        hlsRef.current = hls;
      }
    } catch {
      setStatus("error");
    }
  }, []);

  const stopAll = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setActiveCamera(null);
    setAutoRotation(false);
    setStatus("standby");
    if (rotationRef.current) clearInterval(rotationRef.current);
  }, []);

  const toggleAutoRotation = useCallback(() => {
    if (autoRotation) {
      setAutoRotation(false);
      if (rotationRef.current) clearInterval(rotationRef.current);
    } else {
      setAutoRotation(true);
      let idx = 0;
      loadCamera(idx);
      rotationRef.current = setInterval(() => {
        idx = (idx + 1) % CAMERAS.length;
        loadCamera(idx);
      }, 60000);
    }
  }, [autoRotation, loadCamera]);

  useEffect(() => {
    return () => {
      if (rotationRef.current) clearInterval(rotationRef.current);
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, []);

  return (
    <HudPanel title="Sistema de Monitoramento">
      <div className="flex flex-col h-full">
        {/* Video area */}
        <div className="relative flex-1 min-h-[200px] bg-background/50 flex items-center justify-center">
          {status === "standby" || status === "error" ? (
            <div className="text-center">
              <Camera className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground tracking-wider">
                {status === "error"
                  ? "SISTEMA DE SEGURANÇA EM STAND BY"
                  : "SELECIONE UMA CÂMERA PARA MONITORAR"}
              </p>
              {status === "error" && (
                <p className="text-[8px] text-muted-foreground/50 mt-1">
                  Acesso restrito à rede local.
                </p>
              )}
            </div>
          ) : (
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
          )}

          {/* Scan lines overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(190 100% 50% / 0.02) 2px, hsl(190 100% 50% / 0.02) 4px)",
            }}
          />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(hsl(190 100% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(190 100% 50%) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 p-2 border-t border-border/50">
          {CAMERAS.map((cam, i) => (
            <button
              key={i}
              onClick={() => {
                if (autoRotation) {
                  setAutoRotation(false);
                  if (rotationRef.current) clearInterval(rotationRef.current);
                }
                loadCamera(i);
              }}
              className={`flex-1 px-2 py-1.5 text-[9px] tracking-wider rounded-sm border transition-all ${
                activeCamera === i
                  ? "bg-primary/20 border-primary text-primary"
                  : "bg-muted/20 border-border/50 text-muted-foreground hover:border-primary/50"
              }`}
            >
              {cam.label}
            </button>
          ))}
          <button
            onClick={stopAll}
            className="p-1.5 rounded-sm border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all"
            title="Parar Tudo"
          >
            <StopCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleAutoRotation}
            className={`p-1.5 rounded-sm border transition-all ${
              autoRotation
                ? "border-neon-green text-neon-green bg-neon-green/10"
                : "border-border/50 text-muted-foreground hover:border-primary/50"
            }`}
            title="Rotação Auto"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotation ? "animate-spin" : ""}`} style={autoRotation ? { animationDuration: "3s" } : {}} />
          </button>
        </div>
      </div>
    </HudPanel>
  );
};

export default SecurityCameraPanel;
