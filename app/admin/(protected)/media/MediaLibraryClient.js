"use client";

import { useEffect, useRef, useState } from "react";

const folders = ["products", "categories", "brands", "general"];

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryClient({ mode = "library" }) {
  const inputRef = useRef(null);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("general");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [previewFiles, setPreviewFiles] = useState([]);

  async function loadMedia() {
    const params = new URLSearchParams({ limit: "100" });
    if (query.trim()) params.set("q", query.trim());
    const response = await fetch(`/api/admin/media?${params.toString()}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to load media");
    setItems(payload.items || []);
  }

  useEffect(() => {
    loadMedia().catch((error) => setMessage(error.message));
  }, [query]);

  function preview(files) {
    const list = Array.from(files || []);
    setPreviewFiles(
      list.map((file) => ({
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      })),
    );
  }

  async function upload(files) {
    const list = Array.from(files || []);
    if (!list.length) return;
    setUploading(true);
    setProgress(15);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("folder", folder);
      list.forEach((file) => formData.append("files", file));
      setProgress(45);
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
      setProgress(80);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Upload failed");
      setItems((current) => [...(payload.items || []), ...current]);
      setPreviewFiles([]);
      setProgress(100);
      setMessage(`${payload.items?.length || 0} file uploaded successfully.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 350);
    }
  }

  async function deleteItem(id) {
    if (!window.confirm("Delete this media item?")) return;
    const response = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json();
      setMessage(payload.error || "Unable to delete media");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
  }

  async function copyUrl(url) {
    await navigator.clipboard.writeText(`${window.location.origin}${url}`);
    setMessage("Image URL copied.");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Media Library</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">{mode === "upload" ? "Upload Media" : "Centralized Media"}</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Manage images for products, categories, brands, and homepage CMS.</p>
          </div>
          <button type="button" onClick={() => inputRef.current?.click()} className="h-12 rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)]">
            Upload Images
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <section
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              preview(event.dataTransfer.files);
              upload(event.dataTransfer.files);
            }}
            className={`rounded-3xl border border-dashed p-6 text-center shadow-sm transition ${dragging ? "border-[#ef3338] bg-red-50" : "border-[#d0d5dd] bg-white"}`}
          >
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#111827] text-3xl text-white">⇧</div>
            <h2 className="mt-4 text-lg font-black text-[#111827]">Drag & drop upload</h2>
            <p className="mt-2 text-sm font-semibold text-[#667085]">JPG, PNG, WEBP, SVG. Single or multiple images.</p>
            <select value={folder} onChange={(event) => setFolder(event.target.value)} className="mt-5 h-11 w-full rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold text-[#344054]">
              {folders.map((item) => (
                <option key={item} value={item}>
                  /uploads/{item}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => inputRef.current?.click()} className="mt-4 h-11 w-full rounded-xl border border-red-200 bg-red-50 text-sm font-black text-[#ef3338]">
              Choose Files
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.svg"
              hidden
              onChange={(event) => {
                preview(event.target.files);
                upload(event.target.files);
              }}
            />
            {uploading ? (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-red-100">
                <div className="h-full rounded-full bg-[#ef3338] transition-all" style={{ width: `${progress}%` }} />
              </div>
            ) : null}
          </section>

          {previewFiles.length ? (
            <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-black text-[#111827]">Preview before upload</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {previewFiles.map((file) => (
                  <div key={file.url} className="overflow-hidden rounded-2xl border border-[#e5e7eb]">
                    <img src={file.url} alt={file.name} className="aspect-square w-full object-cover" />
                    <p className="truncate p-2 text-[11px] font-bold text-[#667085]">{file.name}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>

        <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black text-[#111827]">Media Gallery</h2>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search media..." className="h-11 w-full rounded-xl border border-[#d0d5dd] px-4 text-sm font-semibold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 sm:w-80" />
          </div>
          {message ? <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-[#b42318]">{message}</p> : null}

          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-5">
            {items.map((item) => (
              <article key={item.id} className="group overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white transition hover:border-[#ef3338] hover:shadow-[0_16px_36px_rgba(239,51,56,0.14)]">
                <button type="button" onClick={() => copyUrl(item.url)} className="block w-full">
                  <img src={item.url} alt={item.alt || item.fileName || "Media"} className="aspect-square w-full bg-[#f8fafc] object-cover" />
                </button>
                <div className="space-y-2 p-3">
                  <p className="truncate text-xs font-black text-[#111827]">{item.originalName || item.fileName || item.filename}</p>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#667085]">
                    <span>{formatBytes(item.fileSize ?? item.size)}</span>
                    <span>{item.width && item.height ? `${item.width}×${item.height}` : "Image"}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#98a2b3]">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => copyUrl(item.url)} className="rounded-lg border border-[#d0d5dd] px-2 py-2 text-xs font-black text-[#344054]">
                      Copy URL
                    </button>
                    <button type="button" onClick={() => deleteItem(item.id)} className="rounded-lg border border-red-200 px-2 py-2 text-xs font-black text-[#ef3338]">
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
