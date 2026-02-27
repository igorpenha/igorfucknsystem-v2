
import { useState, useEffect, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw, ShieldAlert } from "lucide-react";
import HudPanel from "./HudPanel";
import { FILE_API_BASE_URL } from "@/config/api";

interface NetworkDevice {
  ip: string;
  mac: string;
  type: string;
  isIntruder?: boolean;
}

// TODO: Mover para uma configuração externa ou API
const MAC_WHITELIST = new Set([
  "00:1a:2b:3c:4d:5e", // Exemplo: Servidor Principal
  "f6:a5:b4:c3:d2:e1", // Exemplo: PC do Igor
  "a1:b2:c3:d4:e5:f6", // Exemplo: Smartphone
]);

const SCAN_URL = `${FILE_API_BASE_URL}/api/network/scan`;

const NetworkDeviceMonitor = ({ asContent = false }: { asContent?: boolean }) => {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const fetchDevices = useCallback(async () => {
    setScanning(true);
    setError(false);
    try {
      const res = await fetch(SCAN_URL, { signal: AbortSignal.timeout(10000) });
      const data = await res.json();

      if (data && Array.isArray(data.devices)) {
        // Cria uma cópia e adiciona o status de intruso
        const processedDevices = data.devices.map((device: NetworkDevice) => ({
          ...device,
          mac: device.mac.toLowerCase().replace(/-/g, ":"),
          isIntruder: !MAC_WHITELIST.has(device.mac.toLowerCase().replace(/-/g, ":")),
        }));
        setDevices(processedDevices);
      } else {
        setDevices([]);
      }

      setHasScanned(true);
    } catch {
      setError(true);
      setDevices([]);
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 30000); // Re-escanear a cada 30 segundos
    return () => clearInterval(interval);
  }, [fetchDevices]);

  const intruders = devices.filter(d => d.isIntruder);

  const content = (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between -mt-1 mb-1">
        <span className={`text-[8px] tracking-[0.2em] font-display ${
          scanning ? "text-accent animate-pulse" : error ? "text-destructive" : "text-primary"
        }`}>
          {scanning ? "SCANNING..." : error ? "CONEXÃO FALHOU" : `${devices.length} DISPOSITIVOS ${intruders.length > 0 ? `(${intruders.length} INTRUSO${intruders.length > 1 ? 'S' : ''})` : ''}`}
        </span>
        <button
          onClick={fetchDevices}
          disabled={scanning}
          className="p-1 rounded border border-accent/30 bg-accent/5 hover:bg-accent/15 hover:border-accent/60 transition-all disabled:opacity-30"
        >
          <RefreshCw className={`w-3 h-3 text-accent ${scanning ? "animate-spin" : ""}`} />
        </button>
      </div>

      {scanning && (
        <div className="flex flex-col items-center py-6 gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-2 border-accent/30 rounded-full" />
            <div className="absolute inset-0 border-2 border-t-accent border-transparent rounded-full animate-spin" />
            <Wifi className="absolute inset-0 m-auto w-4 h-4 text-accent animate-pulse" />
          </div>
          <p className="text-[9px] text-accent tracking-[0.3em] font-display animate-pulse">EXECUTANDO ARP SCAN</p>
        </div>
      )}

      {!scanning && error && (
        <div className="flex flex-col items-center py-4 gap-2">
          <WifiOff className="w-5 h-5 text-destructive/50" />
          <p className="text-[9px] text-destructive/70 text-center tracking-wider">BACKEND INDISPONÍVEL</p>
          <p className="text-[8px] text-muted-foreground/50 text-center">VERIFIQUE O SERVIDOR NA PORTA 4000</p>
        </div>
      )}

      {!scanning && !error && hasScanned && (
        devices.length === 0 ? (
          <p className="text-[9px] text-muted-foreground text-center py-4 tracking-wider">NENHUM DISPOSITIVO NA REDE</p>
        ) : (
          <div className="space-y-1 max-h-60 overflow-y-auto hud-scroll">
            {devices.map((d, i) => (
              <div
                key={`${d.mac}-${i}`}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-sm transition-all duration-300 border ${d.isIntruder
                  ? "border-destructive/60 bg-destructive/10 hover:bg-destructive/20 hover:border-destructive/80"
                  : "border-accent/20 bg-accent/5 hover:bg-accent/10 hover:border-accent/50"}`}
              >
                {d.isIntruder ? (
                  <ShieldAlert className="w-3 h-3 text-destructive shrink-0" />
                ) : (
                  <Wifi className="w-2.5 h-2.5 text-primary shrink-0" />
                )}
                <a
                  href={`http://${d.ip}`}
                  target="_blank" rel="noopener noreferrer"
                  className={`text-[9px] font-mono flex-1 tracking-wide transition-all duration-150 cursor-pointer ${d.isIntruder
                    ? "text-destructive/90 hover:text-destructive"
                    : "text-primary hover:text-cyan-400 hover:drop-shadow-[0_0_6px_rgba(0,255,255,0.7)]"}`}
                >
                  {d.ip}
                </a>
                <span className={`text-[8px] font-mono tracking-wide ${d.isIntruder ? "text-destructive/70" : "text-accent/70"}`}>{d.mac}</span>
                <span className="text-[7px] text-muted-foreground/60 uppercase tracking-wider">{d.type}</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );

  if (asContent) return content;

  return (
    <HudPanel title="IPs da Rede">
      {content}
    </HudPanel>
  );
};

export default NetworkDeviceMonitor;
