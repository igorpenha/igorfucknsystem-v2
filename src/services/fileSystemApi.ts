import { FILE_API_BASE_URL } from "@/config/api";

export interface FsEntry {
  name: string;
  type: "file" | "folder";
  size: number;
  lastModified: string;
  totalFiles?: number;
  totalSize?: number;
}

export interface FolderInfo {
  name: string;
  totalFiles: number;
  totalSize: number;
}

export async function fetchFolders(): Promise<FolderInfo[]> {
  const res = await fetch(`${FILE_API_BASE_URL}/api/folders`, { cache: "no-store" });
  if (!res.ok) throw new Error("Backend offline");
  return res.json();
}

export async function fetchFiles(folder: string): Promise<FsEntry[]> {
  const res = await fetch(
    `${FILE_API_BASE_URL}/api/files?folder=${encodeURIComponent(folder)}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Backend offline");
  return res.json();
}

export function getDownloadUrl(folder: string, fileName: string): string {
  return `${FILE_API_BASE_URL}/api/download?folder=${encodeURIComponent(folder)}&file=${encodeURIComponent(fileName)}`;
}
