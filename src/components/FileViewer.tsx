import { useState, useEffect, useRef } from "react";
import { FileIcon, Download, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type FsEntry, getDownloadUrl } from "@/services/fileSystemApi";

interface FileViewerProps {
  folderName: string;
  files: FsEntry[];
  totalSize: number;
  onFolderClick: (name: string) => void;
  onBack: () => void;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
};

const FileViewer = ({ folderName, files, totalSize, onFolderClick, onBack }: FileViewerProps) => {
  const [newFiles, setNewFiles] = useState<Set<string>>(new Set());
  const prevNames = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (prevNames.current.size > 0) {
      const added = files.filter((f) => !prevNames.current.has(f.name)).map((f) => f.name);
      if (added.length > 0) {
        setNewFiles((prev) => new Set([...prev, ...added]));
        setTimeout(() => {
          setNewFiles((prev) => { const copy = new Set(prev); added.forEach((n) => copy.delete(n)); return copy; });
        }, 60000);
      }
    }
    prevNames.current = new Set(files.map((f) => f.name));
  }, [files]);

  const fileCount = files.filter((f) => f.type === "file").length;
  const folderCount = files.filter((f) => f.type === "folder").length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/30">
        <div className="flex items-center gap-3">
          {folderName.includes('/') && (
            <button onClick={onBack} className="text-[10px] font-display bg-primary/20 text-primary px-2 py-1 rounded-sm hover:bg-primary/40 transition-colors cursor-pointer">
              &lt; VOLTAR
            </button>
          )}
          <span className="text-xs tracking-wider font-display text-primary">{folderName.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
          <span>{fileCount} files</span>
          {folderCount > 0 && <span>{folderCount} folders</span>}
          <span>{formatSize(totalSize)}</span>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Pasta vazia</span>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {files.map((file) => {
            const isNew = newFiles.has(file.name);
            const isFolder = file.type === "folder";

            return (
              <div
                key={file.name}
                onClick={() => isFolder && onFolderClick(file.name)}
                className={`flex items-center gap-3 py-2 px-3 rounded-sm group transition-all duration-300 border border-transparent
                  hover:border-accent/30 hover:shadow-[0_0_8px_hsl(var(--accent)/0.15),0_0_20px_hsl(var(--accent)/0.08)] hover:animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]
                  ${isFolder ? "cursor-pointer hover:bg-primary/10" : "hover:bg-muted/20"}`}
              >
                {isFolder ? (
                  <FolderOpen className="w-4 h-4 text-accent/60 flex-shrink-0" />
                ) : (
                  <FileIcon className="w-4 h-4 text-primary/60 flex-shrink-0" />
                )}

                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-xs text-foreground truncate" title={file.name}>{file.name}</span>
                  {isNew && (
                    <Badge variant="default" className="text-[8px] px-1 py-0 h-3.5 bg-[hsl(142,76%,46%)] text-black border-none animate-pulse">NEW</Badge>
                  )}
                </div>

                <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatSize(file.size)}</span>
                <span className="text-[9px] text-muted-foreground/50 flex-shrink-0 hidden md:block">{formatDate(file.lastModified)}</span>

                {!isFolder && (
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <a href={getDownloadUrl(folderName, file.name)} target="_blank" rel="noopener noreferrer" title="Download" onClick={(e) => e.stopPropagation()}>
                      <Download className="w-3.5 h-3.5 text-primary hover:text-primary/80" />
                    </a>
                  </div>
                )}

                {isFolder && file.totalFiles !== undefined && (
                  <span className="text-[9px] text-muted-foreground/40 flex-shrink-0">{file.totalFiles} items</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileViewer;
