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
  const [fileViewerMaxH, setFileViewerMaxH] = useState<number | undefined>(undefined);
  const webRadioRef = useRef<HTMLDivElement>(null);
  const fileViewerRef = useRef<HTMLDivElement>(null);

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

  // Sync file viewer height with WebRadio bottom
  useEffect(() => {
    const sync = () => {
      if (webRadioRef.current && fileViewerRef.current) {
        const radioBottom = webRadioRef.current.getBoundingClientRect().bottom;
        const viewerTop = fileViewerRef.current.getBoundingClientRect().top;
        const maxH = radioBottom - viewerTop - 1;
        if (maxH > 200) setFileViewerMaxH(maxH);
      }
    };
    sync();
    window.addEventListener("resize", sync);
    const timer = setTimeout(sync, 500);
    return () => { window.removeEventListener("resize", sync); clearTimeout(timer); };
  }, []);

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <div className="min-h-screen bg-background hud-grid relative overflow-hidden">
        <SpaceBackground />
        {/* Header */}
        <header className="border-b border-border px-4 md:px-8 py-2 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <HeaderGlitchLogo />
            <div>
              <h1 className="font-display text-sm md:text-base text-foreground text-glow tracking-[0.2em]">
                IGOR FUCKN SYSTEM
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest">
                <TypingText text="SISTEMA DE GERENCIAMENTO // v2.0" speed={30} />
              </p>
            </div>
          </div>
          <HudClock />
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10 lg:grid-rows-[auto]">
          {/* Left Column - File Menu */}
          <div className="lg:col-span-3 flex flex-col gap-4">
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

            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
              <HudPanel title="Calculadora">
                <Calculator />
              </HudPanel>
            </motion.div>

            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
              <NetworkDeviceMonitor />
            </motion.div>
          </div>

          {/* Center Column - File Viewer */}
          <div ref={fileViewerRef} className="lg:col-span-6 flex flex-col gap-4 min-h-0">
            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col flex-1 min-h-0" style={{ height: fileViewerMaxH, maxHeight: fileViewerMaxH } as undefined}>
              <HudPanel title="Lista de Arquivos" className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto min-h-0">
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
                    <div className="flex items-center justify-center h-full min-h-[200px]">
                      <span className="text-xs text-muted-foreground tracking-wider">
                        SELECIONE UMA PASTA PARA VISUALIZAR OS ARQUIVOS
                      </span>
                    </div>
                  )}
                </div>
              </HudPanel>
            </motion.div>

            {/* Security Camera Panel - stretches to fill remaining space */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="flex-1">
              <SecurityCameraPanel />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <motion.div ref={webRadioRef} custom={1} initial="hidden" animate="visible" variants={fadeUp}>
              <HudPanel title="WebRadio">
                <WebRadio />
              </HudPanel>
            </motion.div>

            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
              <HudPanel title="Info do Sistema">
                <InfoWidgets />
              </HudPanel>
            </motion.div>

          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border px-4 md:px-8 py-3 flex items-center justify-between relative z-10">
          <span className="text-[10px] text-muted-foreground tracking-widest">© 2026 IGOR FUCKN SYSTEM</span>
          <span className="text-[10px] text-muted-foreground tracking-widest">BUILD 2.0.0 // ALL SYSTEMS NOMINAL</span>
        </footer>
      </div>
    </>
  );
};

export default Index;
