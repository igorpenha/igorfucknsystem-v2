import { useState, useEffect, useCallback, useRef } from "react";
import {
  Folder, ChevronRight, RefreshCw,
} from "lucide-react";
import { fetchFolders, type FolderInfo } from "@/services/fileSystemApi";
import { Badge } from "@/components/ui/badge";

const playHoverSound = (() => {
  let ctx: AudioContext | null = null;
  return () => {
    if (!ctx) ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(1800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  };
})();

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

interface FileMenuProps {
  activeFolder: string | null;
  onSelectFolder: (name: string) => void;
  onRescan: () => void;
  rescanning: boolean;
}

const FileMenu = ({ activeFolder, onSelectFolder, onRescan, rescanning }: FileMenuProps) => {
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [newFolders, setNewFolders] = useState<Set<string>>(new Set());
  const prevFolderNames = useRef<Set<string>>(new Set());

  const loadFolders = useCallback(async () => {
    try {
      const data = await fetchFolders();
      if (prevFolderNames.current.size > 0) {
        const newOnes = data
          .filter((f) => !prevFolderNames.current.has(f.name))
          .map((f) => f.name);
        if (newOnes.length > 0) {
          setNewFolders((prev) => new Set([...prev, ...newOnes]));
          setTimeout(() => {
            setNewFolders((prev) => {
              const copy = new Set(prev);
              newOnes.forEach((n) => copy.delete(n));
              return copy;
            });
          }, 60000);
        }
      }
      prevFolderNames.current = new Set(data.map((f) => f.name));
      setFolders(data);
    } catch {
      // silent — backend may be offline
    }
  }, []);

  useEffect(() => {
    loadFolders();
    const interval = setInterval(loadFolders, 30000);
    return () => clearInterval(interval);
  }, [loadFolders]);

  useEffect(() => {
    if (!rescanning) loadFolders();
  }, [rescanning, loadFolders]);

  return (
    <div className="flex flex-col gap-1.5">
      {/* Rescan button */}
      <button
        onMouseEnter={playHoverSound}
        className="hud-panel flex items-center gap-2.5 px-3 py-2 rounded-sm text-left transition-all duration-200 border-[hsl(var(--secondary))]/30 hover:bg-[hsl(var(--secondary))]/5 text-[hsl(var(--secondary))]"
      >
        <div className="w-6 rounded-sm flex items-center justify-center border border-[hsl(142,76%,46%)]/40 bg-[hsl(142,76%,46%)]/10">
          <RefreshCw
            className={`w-3.5 h-3.5 text-[hsl(142,76%,46%)] ${rescanning ? "animate-spin" : ""}`}
          />
        </div>
        <span className="text-[10px] tracking-wider font-display flex-1 text-[hsl(142,76%,46%)]">
          {rescanning ? "RESCANNING..." : "RESCAN"}
        </span>
      </button>

      {/* Dynamic Folders */}
      {folders.length === 0 && (
        <div className="text-[10px] text-muted-foreground text-center py-3 tracking-wider">
          BACKEND OFFLINE — NO FOLDERS
        </div>
      )}
      {folders.map((folder) => {
        const isActive = activeFolder === folder.name || (activeFolder?.startsWith(folder.name + '/'));
        const isNew = newFolders.has(folder.name);
        return (
          <button
            key={folder.name}
            onClick={() => onSelectFolder(folder.name)}
            onMouseEnter={playHoverSound}
            className={`
              hud-panel flex items-center gap-2.5 px-3 py-2 rounded-sm text-left transition-all duration-200
              ${isActive
                ? "border-primary/50 bg-primary/10 text-foreground glow-primary"
                : "hover:border-primary/20 hover:bg-primary/5 text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <div className={`w-6 h-6 rounded-sm flex items-center justify-center border ${isActive ? "border-primary/40 bg-primary/15" : "border-secondary/20 bg-secondary/5"}`}>
              <Folder className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-secondary/60"}`} />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] tracking-wider font-display truncate">{folder.name.toUpperCase()}</span>
                {isNew && (
                  <Badge variant="default" className="text-[8px] px-1 py-0 h-3.5 bg-[hsl(142,76%,46%)] text-black border-none animate-pulse">
                    NEW
                  </Badge>
                )}
              </div>
              <span className="text-[8px] text-muted-foreground/60">
                {folder.totalFiles} files · {formatSize(folder.totalSize)}
              </span>
            </div>
            <ChevronRight
              className={`w-3 h-3 transition-transform duration-200 ${isActive ? "rotate-90 text-primary" : "text-muted-foreground/30"}`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default FileMenu;
