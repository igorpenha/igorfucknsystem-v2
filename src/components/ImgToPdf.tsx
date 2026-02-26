import { useState, useCallback, useRef } from "react";
import { FileDown, ImagePlus, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

const ImgToPdf = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const accepted = Array.from(fileList).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    if (accepted.length === 0) {
      toast.error("Apenas JPG, PNG ou WEBP são aceitos.");
      return;
    }
    const newItems: ImageItem[] = accepted.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newItems]);
    // Auto-select the first added image for preview
    if (!selectedId) setSelectedId(newItems[0].id);
  }, [selectedId]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const generatePdf = useCallback(async () => {
    if (images.length === 0) return;
    setGenerating(true);
    try {
      const loadImg = (src: string): Promise<HTMLImageElement> =>
        new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = src;
        });

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 10;

      for (let i = 0; i < images.length; i++) {
        if (i > 0) doc.addPage();
        const img = await loadImg(images[i].preview);
        const ratio = img.width / img.height;
        const availW = pageW - margin * 2;
        const availH = pageH - margin * 2;
        let w = availW;
        let h = w / ratio;
        if (h > availH) {
          h = availH;
          w = h * ratio;
        }
        const x = (pageW - w) / 2;
        const y = (pageH - h) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

        doc.addImage(dataUrl, "JPEG", x, y, w, h);
      }

      doc.save("images-output.pdf");
      toast.success("PDF gerado com sucesso!");
    } catch {
      toast.error("Erro ao gerar o PDF.");
    }
    setGenerating(false);
  }, [images]);

  const selectedImage = images.find((i) => i.id === selectedId);

  return (
    <div className="flex gap-4 min-h-0">
      {/* Left column — controls */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-sm cursor-pointer
            border-2 border-dashed transition-all duration-300
            ${dragOver
              ? "border-accent bg-accent/10 shadow-[inset_0_0_30px_hsl(var(--accent)/0.1)]"
              : "border-accent/30 bg-muted/10 hover:border-accent/60 hover:bg-accent/5"
            }`}
        >
          <ImagePlus className="w-6 h-6 text-accent/70" />
          <span className="font-display text-[9px] tracking-[0.2em] text-muted-foreground text-center">
            ARRASTE IMAGENS OU CLIQUE
          </span>
          <span className="text-[8px] text-muted-foreground/50">JPG · PNG · WEBP</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
        />

        {/* Thumbnails */}
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedId(img.id)}
                className={`relative group aspect-square rounded-sm overflow-hidden cursor-pointer
                  border bg-muted/20 transition-all duration-200
                  ${selectedId === img.id
                    ? "border-primary/80 shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                    : "border-border/40 hover:border-accent/50"
                  }`}
              >
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                {selectedId === img.id && (
                  <div className="absolute top-0.5 left-0.5">
                    <Eye className="w-3 h-3 text-primary drop-shadow-[0_0_4px_hsl(var(--primary)/0.8)]" />
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Counter + Generate */}
        <div className="flex items-center justify-between">
          <span className="font-display text-[9px] tracking-[0.2em] text-muted-foreground">
            {images.length} {images.length === 1 ? "IMAGEM" : "IMAGENS"}
          </span>
          <button
            onClick={generatePdf}
            disabled={images.length === 0 || generating}
            className="px-4 py-2 rounded-sm font-display text-[10px] tracking-[0.25em] uppercase transition-all duration-300 border
              border-primary/40 bg-primary/10 text-primary
              hover:bg-primary/20 hover:border-primary/70 hover:shadow-[0_0_20px_hsl(var(--primary)/0.25)]
              disabled:opacity-30 disabled:pointer-events-none
              flex items-center gap-2"
          >
            <FileDown className="w-3.5 h-3.5" />
            {generating ? "GERANDO..." : "GERAR PDF"}
          </button>
        </div>
      </div>

      {/* Right column — preview */}
      {images.length > 0 && (
        <div className="w-[280px] shrink-0 flex flex-col gap-2 border-l border-accent/20 pl-4">
          <span className="font-display text-[9px] tracking-[0.25em] text-muted-foreground uppercase">
            Prévia
          </span>
          <div className="flex-1 flex items-center justify-center rounded-sm border border-border/30 bg-muted/10 overflow-hidden min-h-[200px]">
            {selectedImage ? (
              <img
                src={selectedImage.preview}
                alt="Preview"
                className="max-w-full max-h-[50vh] object-contain"
              />
            ) : (
              <span className="text-[9px] text-muted-foreground/50 font-display tracking-[0.2em]">
                SELECIONE UMA IMAGEM
              </span>
            )}
          </div>
          {selectedImage && (
            <span className="text-[8px] text-muted-foreground/60 font-mono truncate">
              {selectedImage.file.name}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ImgToPdf;
