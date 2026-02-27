import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { fetchFiles, type FsEntry } from "@/services/fileSystemApi";
import { toast } from "sonner";
import { CalculatorIcon, Wifi, Gauge, FileImage, LogOut, FileDown } from "lucide-react";
import SpeedTest from "@/components/SpeedTest";
import ImgToPdf from "@/components/ImgToPdf";
import PdfExporter from "@/components/PdfExporter";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Index = ({ onLogout }: { onLogout: () => void }) => {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<FsEntry[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [rescanning, setRescanning] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfExporterOpen, setPdfExporterOpen] = useState(false);
  const [activeServer, setActiveServer] = useState<'debian' | 'zorin'>('debian');

  const closeAllTools = () => {
    setCalcOpen(false);
    setNetworkOpen(false);
    setSpeedOpen(false);
    setPdfOpen(false);
    setPdfExporterOpen(false);
  };

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

  return (
    <div className="bg-background relative overflow-hidden w-screen h-screen flex flex-col">
      <SpaceBackground />

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
        <div className="flex items-center gap-3">
          <HudClock />
          <div className="w-px h-5 bg-border/50" />
          <button onClick={onLogout}
            className="flex items-center gap-1.5 text-[9px] font-display tracking-[0.2em] text-muted-foreground hover:text-destructive transition-colors"
            title="Logout">
            <LogOut className="w-3.5 h-3.5" />
            SAIR
          </button>
        </div>
      </header>

      <main
        className="p-4 md:p-6 relative z-10 flex-1 min-h-0 overflow-hidden grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-2 gap-3"
      >
        <div className="lg:col-span-3 lg:row-span-1 min-h-0 overflow-hidden">
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="h-full">
            <HudPanel title="Pastas" className="overflow-hidden flex flex-col h-full">
              <div className="flex-1 min-h-0 overflow-y-auto hud-scroll">
                <FileMenu activeFolder={activeFolder} onSelectFolder={handleSelectFolder} onRescan={handleRescan} rescanning={rescanning} />
              </div>
            </HudPanel>
          </motion.div>
        </div>

        <div className="lg:col-span-6 lg:row-span-1 min-h-0 overflow-hidden">
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="h-full">
            <HudPanel title="Lista de Arquivos" className="overflow-hidden flex flex-col h-full">
              <div className="overflow-y-auto flex-1 min-h-0 hud-scroll rounded-sm" style={{ background: "hsl(230 20% 4% / 0.08)", backdropFilter: "blur(20px)" }}>
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
                    <span className="text-xs text-muted-foreground tracking-wider">SELECIONE UMA PASTA PARA VISUALIZAR OS ARQUIVOS</span>
                  </div>
                )}
              </div>
            </HudPanel>
          </motion.div>
        </div>

        <div className="lg:col-span-3 lg:row-span-2 min-h-0 overflow-hidden">
          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="h-full">
            <HudPanel title="IGOR FUCKN STATION" className="h-full overflow-hidden flex flex-col">
              <WebRadio />
            </HudPanel>
          </motion.div>
        </div>

        <div className="lg:col-span-3 lg:row-span-1 min-h-0 overflow-hidden flex flex-col gap-3">
          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="flex-1 min-h-0">
            <HudPanel title="Ferramentas" className="h-full overflow-hidden flex flex-col">
              <div className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto hud-scroll">
                {[
                  { key: "calc", icon: CalculatorIcon, label: "CALCULADORA", open: calcOpen, toggle: () => { closeAllTools(); setCalcOpen(v => !v); } },
                  { key: "net", icon: Wifi, label: "IPS DA REDE", open: networkOpen, toggle: () => { closeAllTools(); setNetworkOpen(v => !v); } },
                  { key: "speed", icon: Gauge, label: "SPEED TEST", open: speedOpen, toggle: () => { closeAllTools(); setSpeedOpen(v => !v); } },
                  { key: "pdf", icon: FileImage, label: "IMG TO PDF", open: pdfOpen, toggle: () => { closeAllTools(); setPdfOpen(v => !v); } },
                  { key: "pdf-exporter", icon: FileDown, label: "EXPORTAR PDF", open: pdfExporterOpen, toggle: () => { closeAllTools(); setPdfExporterOpen(v => !v); } },
                ].map(({ key, icon: Icon, label, open, toggle }) => (
                  <button
                    key={key}
                    onClick={toggle}
                    className={`flex items-center gap-2 w-full px-2.5 py-1.5 transition-all duration-200 border-l-2 group ${open ? "border-l-primary bg-primary/10 text-foreground shadow-[inset_0_0_12px_hsl(var(--primary)/0.1)]" : "border-l-primary/30 bg-transparent hover:border-l-primary hover:bg-primary/5 text-muted-foreground hover:text-foreground"}`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${open ? "text-primary" : "text-primary/60 group-hover:text-primary"}`} />
                    <span className="text-[9px] tracking-[0.25em] font-display flex-1 text-left">{label}</span>
                    <div className={`w-1 h-1 rounded-full transition-all ${open ? "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]" : "bg-primary/20 group-hover:bg-primary/50"}`} />
                  </button>
                ))}
              </div>
            </HudPanel>
          </motion.div>
          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="flex-1 min-h-0">
            <HudPanel title="Info do Sistema" className="h-full overflow-hidden flex flex-col">
              <div className="flex-1 min-h-0 overflow-hidden">
                <InfoWidgets />
              </div>
            </HudPanel>
          </motion.div>
        </div>

        <div className="lg:col-span-6 lg:row-span-1 min-h-0 overflow-hidden">
          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="h-full">
            <SecurityCameraPanel activeServer={activeServer} setActiveServer={setActiveServer} />
          </motion.div>
        </div>
      </main>

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
        {speedOpen && (
          <ToolProjection title="Speed Test" onClose={() => setSpeedOpen(false)}>
            <SpeedTest />
          </ToolProjection>
        )}
        {pdfOpen && (
          <ToolProjection title="IMG → PDF" onClose={() => setPdfOpen(false)} wide>
            <ImgToPdf />
          </ToolProjection>
        )}
        {pdfExporterOpen && (
          <ToolProjection title="Exportar para PDF" onClose={() => setPdfExporterOpen(false)}>
            <PdfExporter />
          </ToolProjection>
        )}
      </AnimatePresence>

      <footer className="border-t border-border px-4 md:px-6 py-2 flex items-center justify-between relative z-10 shrink-0">
        <span className="text-[10px] text-muted-foreground tracking-widest">© 2026 IGOR FUCKN SYSTEM</span>
        <span className="text-[10px] text-muted-foreground tracking-widest">BUILD 2.0.0 // ALL SYSTEMS NOMINAL</span>
      </footer>
    </div>
  );
};

export default Index;
