import { useState, useEffect } from "react";
import { Thermometer, Users, DollarSign, Activity } from "lucide-react";

const InfoWidgets = () => {
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [temp, setTemp] = useState("--");
  const [city, setCity] = useState("...");

  useEffect(() => {
    // Simulated data
    setOnlineUsers(Math.floor(Math.random() * 5) + 1);
    setTemp(`${Math.floor(Math.random() * 15 + 20)}°C`);
    setCity("São Paulo");
  }, []);

  const widgets = [
    { icon: Activity, label: "STATUS", value: "ATIVO", color: "text-neon-green" },
    { icon: Users, label: "ONLINE", value: String(onlineUsers), color: "text-primary" },
    { icon: Thermometer, label: city, value: temp, color: "text-primary" },
    { icon: DollarSign, label: "USD/BRL", value: "R$ 5.87", color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {widgets.map((w) => (
        <div
          key={w.label}
          className="flex items-center gap-2 px-2 py-1.5 bg-muted/20 border border-border/50 rounded-sm"
        >
          <w.icon className={`w-3 h-3 ${w.color}`} />
          <div className="flex flex-col">
            <span className="text-[8px] text-muted-foreground tracking-wider">{w.label}</span>
            <span className={`text-xs font-display ${w.color}`}>{w.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InfoWidgets;
