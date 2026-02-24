import { useState, useEffect } from "react";
import { Thermometer, DollarSign, Users, Wifi } from "lucide-react";

const InfoWidgets = () => {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [temp, setTemp] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [usd] = useState((5.1 + Math.random() * 0.5).toFixed(2));
  const [pulse, setPulse] = useState(false);

  // Pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulated presence
  useEffect(() => {
    setOnlineUsers(Math.floor(Math.random() * 3) + 1);
  }, []);

  // Real weather from public IP geolocation
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Step 1: Get city from public IP
        const geoRes = await fetch("https://ip-api.com/json/?fields=city,regionName,country");
        const geoData = await geoRes.json();
        const detectedCity = geoData.city || "Unknown";
        setCity(detectedCity);

        // Step 2: Get temperature for that city
        const weatherRes = await fetch(`https://wttr.in/${encodeURIComponent(detectedCity)}?format=%t&m`);
        const weatherText = await weatherRes.text();
        const cleaned = weatherText.trim().replace("+", "");
        setTemp(cleaned || "N/A");
      } catch {
        setCity("OFFLINE");
        setTemp("N/A");
      }
    };
    fetchWeather();
  }, []);

  const widgets = [
    {
      icon: Users,
      label: "ONLINE",
      value: String(onlineUsers),
      color: "text-primary",
    },
    {
      icon: Thermometer,
      label: city ? city.toUpperCase() : "TEMP",
      value: temp !== null ? `${temp}` : "...",
      color: "text-accent",
    },
    {
      icon: DollarSign,
      label: "USD/BRL",
      value: `R$ ${usd}`,
      color: "text-secondary",
    },
    {
      icon: Wifi,
      label: "STATUS",
      value: "ATIVO",
      color: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {widgets.map((w) => (
        <div
          key={w.label}
          className="flex items-center gap-2 bg-muted/50 rounded-sm px-3 py-2 border border-border"
        >
          <w.icon className={`w-3.5 h-3.5 ${w.color} ${pulse ? "animate-pulse-glow" : ""}`} />
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground tracking-wider">{w.label}</span>
            <span className={`text-sm font-display ${w.color}`}>{w.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InfoWidgets;
