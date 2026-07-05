"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptySegment() {
  return {
    name: "",
    slug: "",
    description: "",
    rulesJson: "",
    isActive: true,
    lastEvaluatedAt: null,
  };
}

function jsonInputValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function normalizeSegment(segment) {
  if (!segment) return emptySegment();
  return {
    ...emptySegment(),
    ...segment,
    rulesJson: jsonInputValue(segment.rulesJson),
  };
}

function parseJsonField(value) {
  if (!String(value || "").trim()) return null;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || (typeof parsed !== "object" && !Array.isArray(parsed))) {
      throw new Error("Rules JSON must be an object or array.");
    }
    return parsed;
  } catch (error) {
    throw new Error(error.message || "Rules JSON must be valid JSON.");
  }
}

function formatDateTime(value) {
  if (!value) return "Never evaluated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never evaluated";
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function prettyJson(value) {
  if (!String(value || "").trim()) return "Not configured";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
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

function SegmentReadOnlySummary({ segment }) {
  return (
    <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Segment Summary</p>
          <h3 className="mt-1 text-2xl font-black text-[#111827]">{segment.name}</h3>
          <p className="mt-2 text-sm font-bold text-[#667085]">{segment.slug}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${segment.isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-slate-200"}`}>
          {segment.isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Last evaluated", formatDateTime(segment.lastEvaluatedAt)],
          ["Created", formatDateTime(segment.createdAt)],
          ["Updated", formatDateTime(segment.updatedAt)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">{label}</p>
            <p className="mt-2 text-sm font-black text-[#111827]">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CustomerSegmentForm({ mode, segment, canManage }) {
  const router = useRouter();
  const [form, setForm] = useState(() => normalizeSegment(segment));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const readOnly = !canManage;

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setName(value) {
    setForm((current) => ({ ...current, name: value, slug: current.slug ? current.slug : slugify(value) }));
  }

  function payload() {
    return {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      rulesJson: parseJsonField(form.rulesJson),
      isActive: Boolean(form.isActive),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(mode === "edit" ? `/api/admin/customer-segments/${form.id}` : "/api/admin/customer-segments", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to save customer segment");
      router.push("/admin/customer-segments");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (readOnly || mode !== "edit" || !window.confirm("Delete this customer segment?")) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/customer-segments/${form.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to delete customer segment");
      }
      router.push("/admin/customer-segments");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === "edit" ? <SegmentReadOnlySummary segment={form} /> : null}

      <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">{mode === "edit" ? "Edit Segment" : "Add Segment"}</p>
            <h2 className="mt-1 text-2xl font-black text-[#111827]">{mode === "edit" ? form.name : "Create customer segment"}</h2>
            {!canManage ? <p className="mt-2 text-sm font-bold text-[#ef3338]">Read-only mode. Your role can view segments but cannot save changes.</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push("/admin/customer-segments")} className="h-11 rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              Cancel
            </button>
            {mode === "edit" && canManage ? (
              <button type="button" onClick={handleDelete} disabled={saving} className="h-11 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-[#ef3338] disabled:opacity-60">
                Delete
              </button>
            ) : null}
            {canManage ? (
              <button type="submit" disabled={saving} className="h-11 rounded-xl bg-[#ef3338] px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] disabled:opacity-60">
                {saving ? "Saving..." : "Save Segment"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {message ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[#b42318]">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-black text-[#111827]">Segment Details</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Name">
              <input value={form.name || ""} onChange={(event) => setName(event.target.value)} disabled={readOnly} className={inputClass(readOnly)} required />
            </Field>
            <Field label="Slug">
              <input value={form.slug || ""} onChange={(event) => setField("slug", slugify(event.target.value))} disabled={readOnly} className={inputClass(readOnly)} required />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <textarea value={form.description || ""} onChange={(event) => setField("description", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} h-28 py-3`} />
              </Field>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-[#111827]">Status</h3>
            <div className="mt-5">
              <Toggle label="Active segment" checked={Boolean(form.isActive)} disabled={readOnly} onChange={(value) => setField("isActive", value)} />
            </div>
            <p className="mt-4 text-xs font-semibold leading-5 text-[#98a2b3]">This stores audience rules only. Preview and evaluation are not wired in this task.</p>
          </section>
          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-[#111827]">Evaluation</h3>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">Last evaluated</p>
            <p className="mt-2 text-sm font-black text-[#111827]">{formatDateTime(form.lastEvaluatedAt)}</p>
          </section>
        </aside>
      </div>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-black text-[#111827]">Rules JSON</h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Field label="Rules JSON" hint='Example: {"orders":{"minCount":3},"customer":{"status":"ACTIVE"}}'>
            <textarea value={form.rulesJson || ""} onChange={(event) => setField("rulesJson", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} h-72 py-3 font-mono leading-6`} />
          </Field>
          <div>
            <p className="text-sm font-black text-[#344054]">Stored preview</p>
            <pre className="mt-2 h-72 overflow-auto rounded-2xl bg-[#111827] p-4 text-xs font-semibold leading-5 text-white">{prettyJson(form.rulesJson)}</pre>
          </div>
        </div>
      </section>
    </form>
  );
}
