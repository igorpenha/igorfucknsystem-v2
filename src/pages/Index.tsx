import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import LoadingScreen from "@/components/LoadingScreen";
import HeaderGlitchLogo from "@/components/HeaderGlitchLogo";
import HudClock from "@/components/HudClock";
import HudPanel from "@/components/HudPanel";

import TypingText from "@/components/TypingText";
import Calculator from "@/components/Calculator";
import NetworkDeviceMonitor from "@/components/NetworkDeviceMonitor";
import WebRadio from "@/components/WebRadio";
import InfoWidgets from "@/components/InfoWidgets";
import SecurityCameraPanel from "@/components/SecurityCameraPanel";
import FileMenu from "@/components/FileMenu";
import FileViewer from "@/components/FileViewer";
import SpaceBackground from "@/components/SpaceBackground";
import { fetchFiles, type FsEntry } from "@/services/fileSystemApi";
import { toast } from "sonner";

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
  const [fileViewerH, setFileViewerH] = useState<number | undefined>(undefined);
  const [cameraMaxH, setCameraMaxH] = useState<number | undefined>(undefined);
  const webRadioRef = useRef<HTMLDivElement>(null);
  const fileViewerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const cameraPanelRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<HTMLDivElement>(null);

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

  // Align: file viewer bottom = calculator bottom; camera panel max height = remaining space
  useEffect(() => {
    const sync = () => {
      if (calcRef.current && fileViewerRef.current) {
        const calcRect = calcRef.current.getBoundingClientRect();
        const viewerTop = fileViewerRef.current.getBoundingClientRect().top;
        // Align file viewer bottom with top of last button row (~20% from calc bottom)
        const lastRowOffset = calcRect.height * 0.2;
        const h = calcRect.bottom - viewerTop - lastRowOffset;
        if (h > 80) setFileViewerH(h);
      }
      // Camera panel: align bottom with left column bottom
      if (leftColRef.current && cameraPanelRef.current) {
        const leftBottom = leftColRef.current.getBoundingClientRect().bottom;
        const camTop = cameraPanelRef.current.getBoundingClientRect().top;
        const camH = leftBottom - camTop;
        if (camH > 100) setCameraMaxH(camH);
      }
    };
    sync();
    window.addEventListener("resize", sync);
    const timer = setTimeout(sync, 500);
    const timer2 = setTimeout(sync, 1000);
    return () => { window.removeEventListener("resize", sync); clearTimeout(timer); clearTimeout(timer2); };
  }, []);

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
          {/* Left Column - File Menu */}
          <div ref={leftColRef} className="lg:col-span-3 flex flex-col gap-3 min-h-0 overflow-hidden">
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
              <HudPanel title="Arquivos">
                <FileMenu
                  activeFolder={activeFolder}
                  onSelectFolder={handleSelectFolder}
                  onRescan={handleRescan}
                  rescanning={rescanning}
                />
              </HudPanel>
            </motion.div>

            <motion.div ref={calcRef} custom={2} initial="hidden" animate="visible" variants={fadeUp}>
              <HudPanel title="Calculadora">
                <Calculator />
              </HudPanel>
            </motion.div>

            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
              <NetworkDeviceMonitor />
            </motion.div>
          </div>

          {/* Center Column - File Viewer + Camera */}
          <div ref={fileViewerRef} className="lg:col-span-6 flex flex-col gap-3 min-h-0">
            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="shrink-0"
              style={fileViewerH ? { height: fileViewerH } : undefined}
            >
              <HudPanel title="Lista de Arquivos" className="overflow-hidden flex flex-col h-full">
                <div className="overflow-y-auto flex-1 min-h-0">
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
            <motion.div ref={cameraPanelRef} custom={3} initial="hidden" animate="visible" variants={fadeUp} className="flex-1 min-h-0 overflow-hidden"
              style={cameraMaxH ? { height: cameraMaxH } : undefined}
            >
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
