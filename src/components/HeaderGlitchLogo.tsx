import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import logoImage from "@/assets/logo.png";

const HeaderGlitchLogo = () => {
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const schedule = () => {
      const delay = 3000 + Math.random() * 5000;
      setTimeout(() => {
        setGlitchActive(true);
        setTimeout(() => {
          setGlitchActive(false);
          schedule();
        }, 80 + Math.random() * 120);
      }, delay);
    };
    schedule();
  }, []);

  return (
    <div className="relative w-10 h-10 overflow-hidden">
      <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
      <motion.img
        src={logoImage}
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ filter: "hue-rotate(90deg) saturate(2)", mixBlendMode: "screen" }}
        animate={{
          x: glitchActive ? 2 : 0,
          opacity: glitchActive ? 0.5 : 0,
          clipPath: glitchActive
            ? `inset(${Math.random() * 50}% 0% ${Math.random() * 30}% 0%)`
            : "inset(0% 0% 100% 0%)",
        }}
        transition={{ duration: 0.02 }}
      />
    </div>
  );
};

export default HeaderGlitchLogo;
