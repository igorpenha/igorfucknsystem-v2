import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import HudPanel from "./HudPanel";

interface NetworkDevice {
  ip: string;
  mac: string;
  status: string;
}

const BACKEND_URL = "http://localhost:4000/api/network";

const NetworkDeviceMonitor = ({ asContent = false }: { asContent?: boolean }) => {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [online, setOnline] = useState(false);
  const [scanning, setScanning] = useState(false);

  const fetchDevices = async () => {
    setScanning(true);
    try {
      const res = await fetch(BACKEND_URL, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      setDevices(data.devices || []);
      setOnline(true);
    } catch {
      setOnline(false);
      setDevices([]);
    }
    setScanning(false);
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 60000);
    return () => clearInterval(interval);
  }, []);

  const content = (
    <>
      <div className="flex justify-end -mt-2 mb-2">
        <span className={`text-[8px] tracking-wider ${online ? "text-neon-green" : "text-destructive"}`}>
          {scanning ? "ESCANEANDO..." : online ? `${devices.length} ATIVOS` : "OFFLINE"}
        </span>
      </div>
      <div>
        {!online ? (
          <div className="flex flex-col items-center py-4 gap-2">
            <WifiOff className="w-5 h-5 text-muted-foreground/30" />
            <p className="text-[9px] text-muted-foreground text-center tracking-wider">
              ACESSO REMOTO
            </p>
            <p className="text-[8px] text-muted-foreground/50 text-center">
              DADOS INDISPONÍVEIS
            </p>
          </div>
        ) : devices.length === 0 ? (
          <p className="text-[9px] text-muted-foreground text-center py-4">
            NENHUM DISPOSITIVO DETECTADO
          </p>
        ) : (
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {devices.map((d) => (
              <div
                key={d.ip}
                className="flex items-center gap-2 px-2 py-1 bg-muted/10 border border-border/30 rounded-sm"
              >
                <Wifi className="w-2.5 h-2.5 text-primary" />
                <span className="text-[9px] text-foreground flex-1">{d.ip}</span>
                <span className="text-[8px] text-muted-foreground">{d.mac}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (asContent) return content;

  return (
    <HudPanel title="IPs da Rede">
      {content}
    </HudPanel>
  );
};

export default NetworkDeviceMonitor;
