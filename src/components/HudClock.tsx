import { useEffect, useState } from "react";

const HudClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  return (
    <div className="font-display text-2xl md:text-3xl text-foreground text-glow tracking-widest">
      {hours}:{minutes}
      <span className="text-2xl md:text-3xl text-secondary animate-pulse-glow">
        :{seconds}
      </span>
    </div>
  );
};

export default HudClock;
