import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoadingScreen from "@/components/LoadingScreen";
import HeaderGlitchLogo from "@/components/HeaderGlitchLogo";
import HudPanel from "@/components/HudPanel";
import InfoWidgets from "@/components/InfoWidgets";
import WebRadio from "@/components/WebRadio";
import SecurityCameraPanel from "@/components/SecurityCameraPanel";
import NetworkDeviceMonitor from "@/components/NetworkDeviceMonitor";
import BackgroundParticles from "@/components/BackgroundParticles";

const Index = () => {
  const [loading, setLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => setLoading(false), []);

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      {!loading && (
        <motion.div
          className="min-h-screen bg-background relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <BackgroundParticles />

          {/* Header */}
          <header className="relative z-10 flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <HeaderGlitchLogo />
              <h1 className="font-display text-sm tracking-[0.2em] text-primary">
                IGORP FUCKN SYSTEM
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse-glow" />
              <span className="text-[9px] text-neon-green tracking-wider font-display">
                SISTEMA OPERACIONAL
              </span>
            </div>
          </header>

          {/* Main grid */}
          <main className="relative z-10 p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 max-w-[1600px] mx-auto">
            {/* Left column */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <HudPanel title="Info do Sistema">
                <div className="p-3">
                  <InfoWidgets />
                </div>
              </HudPanel>

              <NetworkDeviceMonitor />
            </div>

            {/* Center column */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <SecurityCameraPanel />
            </div>

            {/* Right column */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <WebRadio />
            </div>
          </main>
        </motion.div>
      )}
    </>
  );
};

export default Index;
