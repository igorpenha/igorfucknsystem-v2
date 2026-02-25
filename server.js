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

const RADIO_DATA_DIR = "D:\\IGORFUCKNSYSTEM\\RADIODATA";

app.get("/api/radio/now-playing", async (_req, res) => {
  try {
    const filePath = path.join(RADIO_DATA_DIR, "nowplaying.txt");
    const text = (await fs.readFile(filePath, "utf8")).trim();

    let title = text || "Nenhuma música tocando";
    let artist = "";

    if (text && text.includes(" - ")) {
      const parts = text.split(" - ");
      artist = parts[0];
      title = parts.slice(1).join(" - ");
    }

    res.json({
      title,
      artist,
      album: "TRANSMISSÃO AO VIVO",
      coverUrl: `http://localhost:4000/api/radio/artwork?t=${Date.now()}`,
    });
  } catch {
    res.json({
      title: "Nenhuma música tocando",
      artist: "",
      album: "TRANSMISSÃO AO VIVO",
      coverUrl: `http://localhost:4000/api/radio/artwork?t=${Date.now()}`,
    });
  }
});

// ── Artwork helper ───────────────────────────────────────

function serveArtwork(baseName, _req, res) {
  const pngPath = path.join(RADIO_DATA_DIR, `${baseName}.png`);
  const jpgPath = path.join(RADIO_DATA_DIR, `${baseName}.jpg`);

  if (fsSync.existsSync(pngPath)) return res.sendFile(pngPath);
  if (fsSync.existsSync(jpgPath)) return res.sendFile(jpgPath);

  // fallback: serve main artwork if prev/next don't exist yet
  if (baseName !== "artwork") {
    const fallbackPng = path.join(RADIO_DATA_DIR, "artwork.png");
    const fallbackJpg = path.join(RADIO_DATA_DIR, "artwork.jpg");
    if (fsSync.existsSync(fallbackPng)) return res.sendFile(fallbackPng);
    if (fsSync.existsSync(fallbackJpg)) return res.sendFile(fallbackJpg);
  }

  return res.status(404).json({ error: "Artwork not found" });
}

// ── GET /api/radio/artwork ───────────────────────────────
app.get("/api/radio/artwork", (req, res) => serveArtwork("artwork", req, res));

// ── GET /api/radio/artwork-prev ──────────────────────────
app.get("/api/radio/artwork-prev", (req, res) => serveArtwork("artwork_prev", req, res));

// ── GET /api/radio/artwork-next ──────────────────────────
app.get("/api/radio/artwork-next", (req, res) => serveArtwork("artwork_next", req, res));

// ── GET /api/network/scan ─────────────────────────────────

const { exec } = require("child_process");

app.get("/api/network/scan", (_req, res) => {
  exec("arp -a", (err, stdout) => {
    if (err) {
      console.error("ARP scan error:", err);
      return res.status(500).json({ error: "Failed to run arp scan" });
    }

    const devices = [];
    const lines = stdout.split("\n");
    for (const line of lines) {
      // Match patterns like: 192.168.0.1    00-aa-bb-cc-dd-ee   dynamic
      const match = line.match(
        /(\d+\.\d+\.\d+\.\d+)\s+([\da-fA-F]{2}[:-][\da-fA-F]{2}[:-][\da-fA-F]{2}[:-][\da-fA-F]{2}[:-][\da-fA-F]{2}[:-][\da-fA-F]{2})\s+(\w+)/
      );
      if (match) {
        devices.push({ ip: match[1], mac: match[2], type: match[3] });
      }
    }

    res.json({ devices });
  });
});

// ── GET /api/speedtest ────────────────────────────────────
// Pure JS: usa Cloudflare Speedtest API — zero dependências nativas.

app.get("/api/speedtest", async (_req, res) => {
  try {
    // ── PING ──
    let ping = 0;
    try {
      const t0 = performance.now();
      await fetch("https://speed.cloudflare.com/__down?bytes=0");
      ping = Math.round(performance.now() - t0);
    } catch (e) {
      console.error("Speedtest PING error:", e.message);
    }

    // ── DOWNLOAD (15 MB) ──
    let download = "0.00";
    try {
      const bytes = 15_000_000;
      const t0 = performance.now();
      const r = await fetch(`https://speed.cloudflare.com/__down?bytes=${bytes}`);
      await r.arrayBuffer();
      const secs = (performance.now() - t0) / 1000;
      download = ((bytes * 8) / secs / 1_000_000).toFixed(2);
    } catch (e) {
      console.error("Speedtest DOWNLOAD error:", e.message);
    }

    // ── UPLOAD (5 MB) ──
    let upload = "0.00";
    try {
      const size = 5_000_000;
      const payload = new Uint8Array(size);
      // preenche com dados pseudo-aleatórios baratos
      for (let i = 0; i < size; i += 4096) payload[i] = i & 0xff;
      const t0 = performance.now();
      await fetch("https://speed.cloudflare.com/__up", {
        method: "POST",
        body: payload,
      });
      const secs = (performance.now() - t0) / 1000;
      upload = ((size * 8) / secs / 1_000_000).toFixed(2);
    } catch (e) {
      console.error("Speedtest UPLOAD error:", e.message);
    }

    res.json({ ping, download, upload });
  } catch (err) {
    console.error("GET /api/speedtest critical error:", err);
    res.status(500).json({ error: "Speed test failed" });
  }
});

// ── Start ────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`IGOR FUCKN FILES API running on http://localhost:${PORT}`);
});
