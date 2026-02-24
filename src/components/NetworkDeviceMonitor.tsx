import { useState, useEffect, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import HudPanel from "./HudPanel";
import { FILE_API_BASE_URL } from "@/config/api";

interface NetworkDevice {
  ip: string;
  mac: string;
  type: string;
}

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
      setDevices(data.devices || []);
      setHasScanned(true);
    } catch {
      setError(true);
      setDevices([]);
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const content = (
    <div className="flex flex-col gap-2">
      {/* Header status + rescan */}
      <div className="flex items-center justify-between -mt-1 mb-1">
        <span className={`text-[8px] tracking-[0.2em] font-display ${
          scanning ? "text-accent animate-pulse" : error ? "text-destructive" : "text-primary"
        }`}>
          {scanning ? "SCANNING..." : error ? "CONEXÃO FALHOU" : `${devices.length} DISPOSITIVOS DETECTADOS`}
        </span>
        <button
          onClick={fetchDevices}
          disabled={scanning}
          className="p-1 rounded border border-accent/30 bg-accent/5 hover:bg-accent/15 hover:border-accent/60 transition-all disabled:opacity-30"
        >
          <RefreshCw className={`w-3 h-3 text-accent ${scanning ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Scanning animation */}
      {scanning && (
        <div className="flex flex-col items-center py-6 gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-2 border-accent/30 rounded-full" />
            <div className="absolute inset-0 border-2 border-t-accent border-transparent rounded-full animate-spin" />
            <Wifi className="absolute inset-0 m-auto w-4 h-4 text-accent animate-pulse" />
          </div>
          <p className="text-[9px] text-accent tracking-[0.3em] font-display animate-pulse">
            EXECUTANDO ARP SCAN
          </p>
        </div>
      )}

      {/* Error state */}
      {!scanning && error && (
        <div className="flex flex-col items-center py-4 gap-2">
          <WifiOff className="w-5 h-5 text-destructive/50" />
          <p className="text-[9px] text-destructive/70 text-center tracking-wider">
            BACKEND INDISPONÍVEL
          </p>
          <p className="text-[8px] text-muted-foreground/50 text-center">
            VERIFIQUE O SERVIDOR NA PORTA 4000
          </p>
        </div>
      )}

      {/* Device list */}
      {!scanning && !error && hasScanned && (
        devices.length === 0 ? (
          <p className="text-[9px] text-muted-foreground text-center py-4 tracking-wider">
            NENHUM DISPOSITIVO NA REDE
          </p>
        ) : (
          <div className="space-y-1 max-h-60 overflow-y-auto hud-scroll">
            {devices.map((d, i) => (
              <div
                key={`${d.ip}-${i}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-sm transition-all duration-200
                  border border-accent/20 bg-accent/5
                  hover:border-accent/50 hover:bg-accent/10 hover:shadow-[0_0_10px_hsl(var(--accent)/0.15)]"
              >
                <Wifi className="w-2.5 h-2.5 text-primary shrink-0" />
                <span className="text-[9px] text-primary font-mono flex-1 tracking-wide">{d.ip}</span>
                <span className="text-[8px] text-accent/70 font-mono">{d.mac}</span>
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
