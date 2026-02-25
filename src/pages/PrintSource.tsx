import { useEffect, useState } from "react";

interface SourceFile {
  path: string;
  content: string;
}

// List of all source files to include
const SOURCE_FILES = [
  "src/App.tsx",
  "src/App.css",
  "src/main.tsx",
  "src/index.css",
  "src/lib/utils.ts",
  "src/config/api.ts",
  "src/pages/Index.tsx",
  "src/pages/NotFound.tsx",
  "src/pages/PrintSource.tsx",
  "src/pages/PrintMonitoring.tsx",
  "src/services/fileSystemApi.ts",
  "src/components/BackgroundParticles.tsx",
  "src/components/Calculator.tsx",
  "src/components/CollapsibleCalculator.tsx",
  "src/components/FileMenu.tsx",
  "src/components/FileViewer.tsx",
  "src/components/FucknChat.tsx",
  "src/components/HeaderGlitchLogo.tsx",
  "src/components/HudClock.tsx",
  "src/components/HudPanel.tsx",
  "src/components/InfoWidgets.tsx",
  "src/components/NavLink.tsx",
  "src/components/NetworkDeviceMonitor.tsx",
  "src/components/RadarWidget.tsx",
  "src/components/SecurityCameraPanel.tsx",
  "src/components/SpaceBackground.tsx",
  "src/components/ToolButton.tsx",
  "src/components/ToolProjection.tsx",
  "src/components/TypingText.tsx",
  "src/components/WebRadio.tsx",
  "src/components/radio/AlbumArtRings.tsx",
  "src/components/radio/AudioVisualizer.tsx",
  "src/components/radio/CarouselErrorBoundary.tsx",
  "src/components/radio/CoverFlowCarousel.tsx",
  "src/components/radio/CyberPlayBtn.tsx",
  "src/components/radio/CyberPlayButton.tsx",
  "src/components/radio/RadioSvgDecorations.tsx",
  "src/components/radio/TrackHistory.tsx",
  "src/components/radio/VinylDisc.tsx",
  "src/hooks/use-mobile.tsx",
  "src/hooks/use-toast.ts",
  "index.html",
  "tailwind.config.ts",
  "vite.config.ts",
  "components.json",
  "server.js",
];

const PrintSource = () => {
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFiles = async () => {
      const loaded: SourceFile[] = [];

      // Use import.meta.glob to load all source files as raw text
      const allFiles = import.meta.glob(
        [
          "/src/**/*.{tsx,ts,css}",
          "/index.html",
          "/tailwind.config.ts",
          "/vite.config.ts",
          "/components.json",
          "/server.js",
        ],
        { query: "?raw", import: "default" }
      );

      for (const filePath of SOURCE_FILES) {
        const key = filePath.startsWith("src/") ? `/${filePath}` : `/${filePath}`;
        const loader = allFiles[key];
        if (loader) {
          try {
            const content = (await loader()) as string;
            loaded.push({ path: filePath, content });
          } catch {
            loaded.push({ path: filePath, content: "// Erro ao carregar arquivo" });
          }
        }
      }

      setFiles(loaded);
      setLoading(false);
    };

    loadFiles();
  }, []);

  useEffect(() => {
    if (!loading && files.length > 0) {
      // Auto print after a short delay
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, files]);

  if (loading) {
    return (
      <div style={{ padding: "40px", fontFamily: "monospace", textAlign: "center" }}>
        <h1>Carregando código-fonte...</h1>
      </div>
    );
  }

  return (
    <div className="print-source">
      <style>{`
        @media screen {
          .print-source {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: #0a0a0a;
            color: #e0e0e0;
            font-family: 'Courier New', monospace;
            min-height: 100vh;
          }
          .print-source .back-btn {
            display: inline-block;
            margin-bottom: 20px;
            padding: 8px 16px;
            background: #1a1a2e;
            color: #00ff88;
            border: 1px solid #00ff88;
            cursor: pointer;
            font-family: monospace;
            font-size: 14px;
          }
          .print-source .back-btn:hover {
            background: #00ff8822;
          }
        }
        @media print {
          * { color: #000 !important; background: #fff !important; }
          .print-source { padding: 0; max-width: 100%; }
          .print-source .back-btn, .print-source .print-btn { display: none !important; }
          .file-block { page-break-inside: avoid; break-inside: avoid; }
          .file-header { border-bottom: 2px solid #000 !important; }
          pre { 
            white-space: pre-wrap !important; 
            word-wrap: break-word !important;
            font-size: 9px !important;
            line-height: 1.3 !important;
          }
          .cover-page { page-break-after: always; }
        }
      `}</style>

      <button className="back-btn" onClick={() => window.history.back()}>
        ← Voltar
      </button>
      <button
        className="back-btn print-btn"
        style={{ marginLeft: 10 }}
        onClick={() => window.print()}
      >
        🖨️ Imprimir / Salvar PDF
      </button>

      <div className="cover-page" style={{ textAlign: "center", paddingTop: "100px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
          📄 CÓDIGO-FONTE COMPLETO
        </h1>
        <h2 style={{ fontSize: "18px", opacity: 0.7 }}>
          IGOR FUCKN SYSTEM — BUILD 2.0.0
        </h2>
        <p style={{ marginTop: "40px", fontSize: "14px", opacity: 0.5 }}>
          {files.length} arquivos • {new Date().toLocaleDateString("pt-BR")}
        </p>

        <div style={{ marginTop: "60px", textAlign: "left", padding: "0 40px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Índice:</h3>
          <ol style={{ fontSize: "12px", lineHeight: "1.8", columns: 2 }}>
            {files.map((f, i) => (
              <li key={i}>{f.path}</li>
            ))}
          </ol>
        </div>
      </div>

      {files.map((file, i) => (
        <div key={i} className="file-block" style={{ marginBottom: "30px" }}>
          <div
            className="file-header"
            style={{
              borderBottom: "1px solid #00ff8866",
              paddingBottom: "4px",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            📁 {file.path}
          </div>
          <pre
            style={{
              fontSize: "11px",
              lineHeight: "1.4",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              padding: "10px",
              background: "#111",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            {file.content}
          </pre>
        </div>
      ))}

      <div style={{ textAlign: "center", padding: "40px 0", fontSize: "12px", opacity: 0.5 }}>
        — FIM DO CÓDIGO-FONTE —
      </div>
    </div>
  );
};

export default PrintSource;
