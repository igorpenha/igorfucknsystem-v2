import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import LoadingScreen from "@/components/LoadingScreen";
import HeaderGlitchLogo from "@/components/HeaderGlitchLogo";
import HudClock from "@/components/HudClock";
import HudPanel from "@/components/HudPanel";

import TypingText from "@/components/TypingText";
import Calculator from "@/components/Calculator";
import NetworkDeviceMonitor from "@/components/NetworkDeviceMonitor";
import ToolProjection from "@/components/ToolProjection";
import WebRadio from "@/components/WebRadio";
import InfoWidgets from "@/components/InfoWidgets";
import SecurityCameraPanel from "@/components/SecurityCameraPanel";
import FileMenu from "@/components/FileMenu";
import FileViewer from "@/components/FileViewer";
import SpaceBackground from "@/components/SpaceBackground";
import { AnimatePresence } from "framer-motion";
import { fetchFiles, type FsEntry } from "@/services/fileSystemApi";
import { toast } from "sonner";
import { CalculatorIcon, Wifi } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<FsEntry[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [rescanning, setRescanning] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const webRadioRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);

  const loadFiles = useCallback(async (folderName: string) => {
    try {
      const data = await fetchFiles(folderName);
      setFiles(data);
      setTotalSize(data.reduce((acc, f) => acc + f.size, 0));
    } catch {
      setFiles([]);
      setTotalSize(0);
    }
  }, []);

  const handleSelectFolder = useCallback((name: string) => {
    setActiveFolder(name);
    loadFiles(name);
  }, [loadFiles]);

  // Auto-refresh files every 30s
  useEffect(() => {
    if (!activeFolder) return;
    const interval = setInterval(() => loadFiles(activeFolder), 30000);
    return () => clearInterval(interval);
  }, [activeFolder, loadFiles]);

  const handleRescan = useCallback(async () => {
    setRescanning(true);
    try {
      if (activeFolder) await loadFiles(activeFolder);
      await new Promise((r) => setTimeout(r, 800));
    } catch {
      toast.error("SCAN FAILED - CHECK BACKEND");
    }
    setRescanning(false);
  }, [activeFolder, loadFiles]);

  // No height sync needed - fixed heights via CSS

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <div className="bg-background hud-grid relative overflow-hidden w-screen h-screen flex flex-col">
        <SpaceBackground />
        {/* Header */}
        <header className="border-b border-border px-4 md:px-6 py-2 flex items-center justify-between relative z-10 shrink-0">
          <div className="flex items-center gap-4">
            <HeaderGlitchLogo />
            <div>
              <h1 className="font-display text-sm md:text-base tracking-[0.2em] flex gap-2 items-center header-shine-container">
                <span className="header-shine-word" style={{ color: "hsl(50 100% 55%)", textShadow: "0 0 8px hsl(50 100% 50% / 0.5)" }}>IGOR</span>
                <span className="header-shine-word" style={{ color: "hsl(320 100% 55%)", textShadow: "0 0 8px hsl(320 100% 50% / 0.5)" }}>FUCKN</span>
                <span className="header-shine-word" style={{ color: "hsl(190 100% 55%)", textShadow: "0 0 8px hsl(190 100% 50% / 0.5)" }}>SYSTEM</span>
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest">
                <TypingText text="SISTEMA DE GERENCIAMENTO // v2.0" speed={30} />
              </p>
            </div>
          </div>
          <HudClock />
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-3 relative z-10 flex-1 min-h-0 overflow-hidden">
          {/* Left Column - File Menu + Tool Buttons */}
          <div ref={leftColRef} className="lg:col-span-3 flex flex-col gap-3 min-h-0 overflow-hidden">
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="shrink-0">
              <HudPanel title="Pastas" className="overflow-hidden flex flex-col h-[50vh] max-h-[50vh]">
                <div className="flex-1 min-h-0 overflow-y-auto hud-scroll">
                  <FileMenu
                    activeFolder={activeFolder}
                    onSelectFolder={handleSelectFolder}
                    onRescan={handleRescan}
                    rescanning={rescanning}
                  />
                </div>
              </HudPanel>
            </motion.div>

            {/* Tool Corner */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="shrink-0">
              <HudPanel title="Ferramentas">
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => { setCalcOpen(v => !v); setNetworkOpen(false); }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-sm transition-all duration-200
                      border backdrop-blur-sm group
                      ${calcOpen
                        ? "border-accent/60 bg-accent/15 text-foreground shadow-[0_0_12px_hsl(var(--accent)/0.2)]"
                        : "border-accent/20 bg-accent/5 hover:border-accent/50 hover:bg-accent/10 hover:shadow-[0_0_15px_hsl(var(--accent)/0.15)] text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <div className={`w-7 h-7 rounded flex items-center justify-center border transition-all
                      ${calcOpen ? "border-accent/60 bg-accent/20 shadow-[0_0_8px_hsl(var(--accent)/0.3)]" : "border-accent/30 bg-accent/10 group-hover:border-accent/60"}`}>
                      <CalculatorIcon className={`w-4 h-4 transition-colors ${calcOpen ? "text-accent" : "text-accent/70 group-hover:text-accent"}`} />
                    </div>
                    <span className="text-[10px] tracking-[0.2em] font-display">CALCULADORA</span>
                  </button>
                  <button
                    onClick={() => { setNetworkOpen(v => !v); setCalcOpen(false); }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-sm transition-all duration-200
                      border backdrop-blur-sm group
                      ${networkOpen
                        ? "border-accent/60 bg-accent/15 text-foreground shadow-[0_0_12px_hsl(var(--accent)/0.2)]"
                        : "border-accent/20 bg-accent/5 hover:border-accent/50 hover:bg-accent/10 hover:shadow-[0_0_15px_hsl(var(--accent)/0.15)] text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <div className={`w-7 h-7 rounded flex items-center justify-center border transition-all
                      ${networkOpen ? "border-accent/60 bg-accent/20 shadow-[0_0_8px_hsl(var(--accent)/0.3)]" : "border-accent/30 bg-accent/10 group-hover:border-accent/60"}`}>
                      <Wifi className={`w-4 h-4 transition-colors ${networkOpen ? "text-accent" : "text-accent/70 group-hover:text-accent"}`} />
                    </div>
                    <span className="text-[10px] tracking-[0.2em] font-display">IPS DA REDE</span>
                  </button>
                </div>
              </HudPanel>
            </motion.div>
          </div>

          {/* Center Column - File Viewer + Camera */}
          <div className="lg:col-span-6 flex flex-col gap-3 min-h-0">
            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="shrink-0 h-[50vh] max-h-[50vh]">
              <HudPanel title="Lista de Arquivos" className="overflow-hidden flex flex-col h-full">
                <div className="overflow-y-auto flex-1 min-h-0 hud-scroll">
                  {activeFolder ? (
                    <FileViewer
                      folderName={activeFolder}
                      files={files}
                      totalSize={totalSize}
                      onFolderClick={(subfolder) => handleSelectFolder(`${activeFolder}/${subfolder}`)}
                      onBack={() => {
                        if (!activeFolder) return;
                        const parts = activeFolder.split('/');
                        parts.pop();
                        handleSelectFolder(parts.join('/'));
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[80px]">
                      <span className="text-xs text-muted-foreground tracking-wider">
                        SELECIONE UMA PASTA PARA VISUALIZAR OS ARQUIVOS
                      </span>
                    </div>
                  )}
                </div>
              </HudPanel>
            </motion.div>

            {/* Security Camera Panel - fills remaining space */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="flex-1 min-h-[350px] overflow-hidden">
              <SecurityCameraPanel />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 min-h-0 grid grid-rows-[minmax(0,1fr)_auto] gap-3 overflow-hidden">
            <motion.div ref={webRadioRef} custom={1} initial="hidden" animate="visible" variants={fadeUp} className="min-h-0 overflow-hidden">
              <HudPanel title="WebRadio" className="h-full overflow-hidden flex flex-col">
                <WebRadio />
              </HudPanel>
            </motion.div>

            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="shrink-0">
              <HudPanel title="Info do Sistema">
                <InfoWidgets />
              </HudPanel>
            </motion.div>
          </div>
        </main>

        {/* Central Projection Zone — tools pop-out from bottom-left to center */}
        <AnimatePresence>
          {calcOpen && (
            <ToolProjection title="Calculadora" onClose={() => setCalcOpen(false)}>
              <Calculator />
            </ToolProjection>
          )}
          {networkOpen && (
            <ToolProjection title="IPs da Rede" onClose={() => setNetworkOpen(false)}>
              <NetworkDeviceMonitor asContent />
            </ToolProjection>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="border-t border-border px-4 md:px-6 py-2 flex items-center justify-between relative z-10 shrink-0">
          <span className="text-[10px] text-muted-foreground tracking-widest">© 2026 IGOR FUCKN SYSTEM</span>
          <span className="text-[10px] text-muted-foreground tracking-widest">BUILD 2.0.0 // ALL SYSTEMS NOMINAL</span>
        </footer>
      </div>
    </>
  );
};

export default Index;
