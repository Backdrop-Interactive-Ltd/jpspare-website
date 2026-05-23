"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import MediaPicker from "../components/MediaPicker";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyBrand() {
  return {
    name: "",
    slug: "",
    description: "",
    logoUrl: "",
    coverImageUrl: "",
    websiteUrl: "",
    isActive: true,
    isFeatured: false,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  };
}

function normalizeBrand(brand) {
  if (!brand) return emptyBrand();
  return { ...emptyBrand(), ...brand };
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#344054]">{label}</span>
      <div className="mt-2">{children}</div>
      {hint ? <span className="mt-1 block text-xs font-semibold text-[#98a2b3]">{hint}</span> : null}
    </label>
  );
}

function inputClass(readOnly) {
  return `h-12 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 ${
    readOnly ? "cursor-not-allowed bg-[#f2f4f7] text-[#667085]" : ""
  }`;
}

function Toggle({ label, checked, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex h-12 items-center justify-between rounded-xl border px-4 text-sm font-black transition ${
        checked ? "border-red-200 bg-red-50 text-[#ef3338]" : "border-[#d0d5dd] bg-white text-[#344054]"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span>{label}</span>
      <span className={`h-6 w-11 rounded-full p-1 transition ${checked ? "bg-[#ef3338]" : "bg-[#d0d5dd]"}`}>
        <span className={`block size-4 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

export default function BrandForm({ mode, brand, canManage }) {
  const router = useRouter();
  const [form, setForm] = useState(() => normalizeBrand(brand));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [message, setMessage] = useState("");
  const readOnly = !canManage;

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setName(value) {
    setForm((current) => ({ ...current, name: value, slug: current.slug ? current.slug : slugify(value) }));
  }

  async function uploadImage(files, target) {
    if (readOnly || !files?.length) return;
    setUploading(target);
    setMessage("");

    try {
      const data = new FormData();
      data.append("folder", "brands");
      Array.from(files).forEach((file) => data.append("files", file));
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: data });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Upload failed");
      setField(target, payload.items[0].url);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading("");
    }
  }

  function selectMedia(item, target) {
    if (!item?.url) return;
    setField(target, item.url);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(mode === "edit" ? `/api/admin/brands/${form.id}` : "/api/admin/brands", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug: form.slug || slugify(form.name) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save brand");
      router.push("/admin/brands");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (readOnly || mode !== "edit" || !window.confirm("Delete this brand?")) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/brands/${form.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to delete brand");
      }
      router.push("/admin/brands");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">{mode === "edit" ? "Edit Brand" : "Add Brand"}</p>
            <h2 className="mt-1 text-2xl font-black text-[#111827]">{mode === "edit" ? form.name : "Create premium brand"}</h2>
            {!canManage ? <p className="mt-2 text-sm font-bold text-[#ef3338]">Read-only mode. Your role can view brands but cannot save changes.</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push("/admin/brands")} className="h-11 rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              Cancel
            </button>
            {mode === "edit" && canManage ? (
              <button type="button" onClick={handleDelete} className="h-11 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-[#ef3338]">
                Delete
              </button>
            ) : null}
            {canManage ? (
              <button type="submit" disabled={saving} className="h-11 rounded-xl bg-[#ef3338] px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] disabled:opacity-60">
                {saving ? "Saving..." : "Save Brand"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {message ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[#b42318]">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-black text-[#111827]">Brand Details</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Brand name">
              <input value={form.name || ""} onChange={(event) => setName(event.target.value)} disabled={readOnly} className={inputClass(readOnly)} required />
            </Field>
            <Field label="Slug">
              <input value={form.slug || ""} onChange={(event) => setField("slug", slugify(event.target.value))} disabled={readOnly} className={inputClass(readOnly)} required />
            </Field>
            <Field label="Website URL">
              <input value={form.websiteUrl || ""} onChange={(event) => setField("websiteUrl", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} placeholder="https://brand.example" />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Description">
              <textarea value={form.description || ""} onChange={(event) => setField("description", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} h-36 py-3`} />
            </Field>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-[#111827]">Publishing</h3>
            <div className="mt-5 space-y-3">
              <Toggle label="Active status" checked={Boolean(form.isActive)} disabled={readOnly} onChange={(value) => setField("isActive", value)} />
              <Toggle label="Featured brand" checked={Boolean(form.isFeatured)} disabled={readOnly} onChange={(value) => setField("isFeatured", value)} />
            </div>
          </section>

          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-[#111827]">Images</h3>
            <div className="mt-5 space-y-5">
              <Field label="Brand logo">
                {form.logoUrl ? <img src={form.logoUrl} alt={form.name} className="mb-3 h-20 w-full rounded-2xl border border-[#e5e7eb] object-contain p-3" /> : null}
                <div className="grid gap-3">
                  <MediaPicker label="Choose Brand Logo" folder="brands" disabled={readOnly || uploading === "logoUrl"} onSelect={(item) => selectMedia(item, "logoUrl")} triggerClassName="w-full" />
                  <input type="file" accept=".jpg,.jpeg,.png,.webp,.svg" disabled={readOnly || uploading === "logoUrl"} onChange={(event) => uploadImage(event.target.files, "logoUrl")} className="w-full text-sm font-bold text-[#667085]" />
                </div>
              </Field>
              <Field label="Cover image">
                {form.coverImageUrl ? <img src={form.coverImageUrl} alt={`${form.name} cover`} className="mb-3 h-28 w-full rounded-2xl border border-[#e5e7eb] object-cover" /> : null}
                <div className="grid gap-3">
                  <MediaPicker label="Choose Cover Image" folder="brands" disabled={readOnly || uploading === "coverImageUrl"} onSelect={(item) => selectMedia(item, "coverImageUrl")} triggerClassName="w-full" />
                  <input type="file" accept=".jpg,.jpeg,.png,.webp,.svg" disabled={readOnly || uploading === "coverImageUrl"} onChange={(event) => uploadImage(event.target.files, "coverImageUrl")} className="w-full text-sm font-bold text-[#667085]" />
                </div>
              </Field>
            </div>
          </section>
        </aside>
      </div>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-black text-[#111827]">SEO</h3>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="SEO title">
            <input value={form.seoTitle || ""} onChange={(event) => setField("seoTitle", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
          </Field>
          <Field label="SEO keywords">
            <input value={form.seoKeywords || ""} onChange={(event) => setField("seoKeywords", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
          </Field>
        </div>
        <div className="mt-5">
          <Field label="SEO description">
            <textarea value={form.seoDescription || ""} onChange={(event) => setField("seoDescription", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} h-28 py-3`} />
          </Field>
        </div>
      </section>
    </form>
  );
}
