"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ACCEPT = ".jpg,.jpeg,.png,.webp,.svg";

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeItem(item) {
  return {
    ...item,
    fileName: item.fileName || item.filename || item.url?.split("/").pop() || "media",
    originalName: item.originalName || item.fileName || item.filename || "media",
    fileSize: item.fileSize ?? item.size ?? 0,
  };
}

export default function MediaPicker({ label = "Select Media", folder = "general", multiple = false, disabled = false, onSelect, triggerClassName = "" }) {
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const selectedIds = useMemo(() => new Set(selected.map((item) => item.id)), [selected]);

  const loadMedia = useCallback(async () => {
    const params = new URLSearchParams({ limit: "80" });
    if (query.trim()) params.set("q", query.trim());
    const response = await fetch(`/api/admin/media?${params.toString()}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to load media");
    setItems((payload.items || []).map(normalizeItem));
  }, [query]);

  useEffect(() => {
    if (!open) return;
    loadMedia().catch((err) => setError(err.message));
  }, [loadMedia, open]);

  async function uploadFiles(files) {
    const list = Array.from(files || []);
    if (!list.length) return;

    setError("");
    setUploading(true);
    setProgress(12);

    try {
      const invalid = list.find((file) => !["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type));
      if (invalid) throw new Error("Supported files: jpg, jpeg, png, webp, svg.");

      const formData = new FormData();
      formData.append("folder", folder);
      list.forEach((file) => formData.append("files", file));
      setProgress(42);

      const response = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
      setProgress(78);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Upload failed");

      const uploaded = (payload.items || []).map(normalizeItem);
      setItems((current) => [...uploaded, ...current]);
      setSelected((current) => (multiple ? [...uploaded, ...current] : uploaded.slice(0, 1)));
      setProgress(100);
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 350);
    }
  }

  function toggleItem(item) {
    if (multiple) {
      setSelected((current) => (current.some((selectedItem) => selectedItem.id === item.id) ? current.filter((selectedItem) => selectedItem.id !== item.id) : [...current, item]));
      return;
    }
    setSelected([item]);
  }

  function confirmSelection() {
    if (!selected.length) return;
    onSelect?.(multiple ? selected : selected[0]);
    setOpen(false);
    setSelected([]);
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={`rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-[#ef3338] transition hover:border-[#ef3338] hover:bg-white hover:shadow-[0_14px_28px_rgba(239,51,56,0.16)] disabled:cursor-not-allowed disabled:opacity-60 ${triggerClassName}`}
      >
        {label}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Media Library</p>
                <h3 className="text-xl font-black text-[#111827]">Select or upload image</h3>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="size-10 rounded-full border border-[#d0d5dd] text-xl font-black text-[#667085]">
                ×
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-5 lg:grid-cols-[280px_1fr]">
              <aside className="space-y-4">
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    uploadFiles(event.dataTransfer.files);
                  }}
                  className={`rounded-2xl border border-dashed p-5 text-center transition ${dragging ? "border-[#ef3338] bg-red-50" : "border-[#d0d5dd] bg-[#f8fafc]"}`}
                >
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">⇧</div>
                  <p className="mt-3 text-sm font-black text-[#111827]">Drag & drop images</p>
                  <p className="mt-1 text-xs font-semibold text-[#667085]">JPG, PNG, WEBP, SVG up to 10MB</p>
                  <button type="button" onClick={() => inputRef.current?.click()} className="mt-4 h-10 rounded-xl bg-[#111827] px-4 text-sm font-black text-white">
                    Browse Files
                  </button>
                  <input ref={inputRef} type="file" multiple={multiple} accept={ACCEPT} hidden onChange={(event) => uploadFiles(event.target.files)} />
                  {uploading ? (
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-red-100">
                      <div className="h-full rounded-full bg-[#ef3338] transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  ) : null}
                </div>

                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search media..." className="h-11 w-full rounded-xl border border-[#d0d5dd] px-4 text-sm font-semibold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
                {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-[#b42318]">{error}</p> : null}
              </aside>

              <section className="min-h-0">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {items.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleItem(item)}
                      className={`group overflow-hidden rounded-2xl border bg-white text-left transition hover:border-[#ef3338] hover:shadow-[0_16px_36px_rgba(239,51,56,0.14)] ${
                        selectedIds.has(item.id) ? "border-[#ef3338] ring-4 ring-red-100" : "border-[#e5e7eb]"
                      }`}
                    >
                      <img src={item.url} alt={item.alt || item.fileName} className="aspect-square w-full bg-[#f8fafc] object-cover" />
                      <div className="p-3">
                        <p className="truncate text-xs font-black text-[#111827]">{item.originalName}</p>
                        <p className="mt-1 text-[11px] font-semibold text-[#667085]">{formatBytes(item.fileSize)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e7eb] p-5">
              <p className="text-sm font-bold text-[#667085]">{selected.length} selected</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-xl border border-[#d0d5dd] px-5 text-sm font-black text-[#344054]">
                  Cancel
                </button>
                <button type="button" onClick={confirmSelection} disabled={!selected.length} className="h-11 rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white disabled:opacity-50">
                  Use Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
