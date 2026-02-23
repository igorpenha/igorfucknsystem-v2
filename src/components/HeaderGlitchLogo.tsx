import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import logoImage from "@/assets/logo.png";

const HeaderGlitchLogo = () => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [intensity, setIntensity] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeout = setTimeout(() => {
        const lvl = Math.random() < 0.3 ? 2 : 1;
        setIntensity(lvl);
        setGlitchActive(true);
        timeout = setTimeout(() => {
          setGlitchActive(false);
          schedule();
        }, 80 + Math.random() * 120);
      }, 2000 + Math.random() * 3000);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  const ox = glitchActive ? (Math.random() - 0.5) * intensity * 3 : 0;

  return (
    <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-sm">
      <motion.img
        src={logoImage}
        alt="Igor Fuckn Files"
        className="absolute inset-0 w-full h-full object-contain"
        animate={{ x: ox }}
        transition={{ duration: 0.02 }}
      />
      <motion.img
        src={logoImage}
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ mixBlendMode: "screen" }}
        animate={{
          x: glitchActive ? intensity * 2.5 : 0,
          opacity: glitchActive ? 0.5 : 0,
          filter: glitchActive ? "hue-rotate(-30deg) saturate(3)" : "none",
          clipPath: glitchActive
            ? `inset(${Math.random() * 40}% 0% ${Math.random() * 40}% 0%)`
            : "inset(0% 0% 100% 0%)",
        }}
        transition={{ duration: 0.02 }}
      />
      <motion.img
        src={logoImage}
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ mixBlendMode: "screen" }}
        animate={{
          x: glitchActive ? -intensity * 3 : 0,
          opacity: glitchActive ? 0.4 : 0,
          filter: glitchActive ? "hue-rotate(160deg) saturate(2.5)" : "none",
          clipPath: glitchActive
            ? `inset(${20 + Math.random() * 30}% 0% ${10 + Math.random() * 30}% 0%)`
            : "inset(0% 0% 100% 0%)",
        }}
        transition={{ duration: 0.02 }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
        }}
      />
    </div>
  );
};

export default HeaderGlitchLogo;
