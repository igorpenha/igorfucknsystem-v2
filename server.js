const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs/promises");
const fsSync = require("fs");

const app = express();
const PORT = 4000;
const ROOT_DIR = "D:\\FILES FOR WEB";

app.use(cors({ origin: "*" }));

// ── Helpers ──────────────────────────────────────────────

function safePath(relativePath) {
  const resolved = path.resolve(ROOT_DIR, relativePath);
  if (!resolved.startsWith(ROOT_DIR)) {
    throw new Error("Path traversal detected");
  }
  return resolved;
}

async function getDirStats(dirPath) {
  let totalFiles = 0;
  let totalSize = 0;

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isFile()) {
      totalFiles++;
      const stat = await fs.stat(fullPath);
      totalSize += stat.size;
    } else if (entry.isDirectory()) {
      const sub = await getDirStats(fullPath);
      totalFiles += sub.totalFiles;
      totalSize += sub.totalSize;
    }
  }
  return { totalFiles, totalSize };
}

// ── GET /api/folders ─────────────────────────────────────

app.get("/api/folders", async (_req, res) => {
  try {
    const entries = await fs.readdir(ROOT_DIR, { withFileTypes: true });
    const folders = entries.filter((e) => e.isDirectory());

    const result = await Promise.all(
      folders.map(async (f) => {
        const fullPath = path.join(ROOT_DIR, f.name);
        const { totalFiles, totalSize } = await getDirStats(fullPath);
        return { name: f.name, totalFiles, totalSize };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("GET /api/folders error:", err);
    res.status(500).json({ error: "Failed to read folders" });
  }
});

// ── GET /api/files?folder=NOME ───────────────────────────

app.get("/api/files", async (req, res) => {
  try {
    const folder = req.query.folder;
    if (!folder) return res.status(400).json({ error: "Missing folder param" });

    const dirPath = safePath(folder);
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    const result = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name);
        const stat = await fs.stat(fullPath);

        const item = {
          name: entry.name,
          type: entry.isDirectory() ? "folder" : "file",
          size: stat.size,
          lastModified: stat.mtime.toISOString(),
        };

        if (entry.isDirectory()) {
          const { totalFiles, totalSize } = await getDirStats(fullPath);
          item.totalFiles = totalFiles;
          item.totalSize = totalSize;
        }

        return item;
      })
    );

    res.json(result);
  } catch (err) {
    if (err.message === "Path traversal detected") {
      return res.status(403).json({ error: "Forbidden" });
    }
    console.error("GET /api/files error:", err);
    res.status(500).json({ error: "Failed to read files" });
  }
});

// ── GET /api/download?folder=NOME&file=NOME ──────────────

app.get("/api/download", async (req, res) => {
  try {
    const { folder, file } = req.query;
    if (!folder || !file) return res.status(400).json({ error: "Missing params" });

    const filePath = safePath(path.join(folder, file));
    await fs.access(filePath);

    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) return res.status(400).json({ error: "Cannot download a folder" });

    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(file)}"`);
    res.setHeader("Content-Length", stat.size);

    const stream = fsSync.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    if (err.message === "Path traversal detected") {
      return res.status(403).json({ error: "Forbidden" });
    }
    console.error("GET /api/download error:", err);
    res.status(500).json({ error: "File not found or unreadable" });
  }
});

// ── GET /api/radio/now-playing ────────────────────────────
// Retorna metadados da música atual do stream Icecast.
// TODO: Conectar ao Icecast status-json.xsl para dados reais.

app.get("/api/radio/now-playing", async (_req, res) => {
  try {
    // Exemplo: buscar do Icecast (descomente e ajuste a URL quando pronto)
    // const icecastRes = await fetch("http://localhost:8000/status-json.xsl");
    // const icecastData = await icecastRes.json();
    // const source = icecastData.icestats?.source;
    // const title = source?.title || "LIVE BROADCAST";
    // const artist = source?.artist || "---";
    // res.json({ title, artist, album: "---", coverUrl: "" });

    // RadioBOSS envia metadados no formato "%artist - %title" via stream header.
    // Para ler em tempo real, faça fetch dos headers do stream ou use a API do RadioBOSS.
    // Exemplo com fetch do stream (descomente quando pronto):
    // const streamRes = await fetch("https://stream.igorfucknsystem.com.br/live", { method: "HEAD" });
    // const icyTitle = streamRes.headers.get("icy-metadata") || "";
    // const [artist, title] = icyTitle.includes(" - ") ? icyTitle.split(" - ", 2) : ["---", icyTitle || "LIVE BROADCAST"];
    // res.json({ title, artist, album: "---", coverUrl: "" });

    // Placeholder até conectar ao RadioBOSS:
    res.json({
      title: "LIVE BROADCAST",
      artist: "IGOR FUCKN SYSTEM",
      album: "STREAMING",
      coverUrl: "",
    });
  } catch (err) {
    console.error("GET /api/radio/now-playing error:", err);
    res.status(500).json({ error: "Failed to fetch now-playing metadata" });
  }
});

// ── Start ────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`IGOR FUCKN FILES API running on http://localhost:${PORT}`);
});
