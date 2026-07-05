"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const templateCategories = ["TRANSACTIONAL", "MARKETING", "AUTH", "ORDER", "SHIPPING", "SUPPORT", "NEWSLETTER"];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyTemplate() {
  return {
    name: "",
    slug: "",
    category: "TRANSACTIONAL",
    subject: "",
    htmlBody: "",
    textBody: "",
    variablesJson: "",
    isActive: true,
  };
}

function jsonInputValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function normalizeTemplate(template) {
  if (!template) return emptyTemplate();
  return {
    ...emptyTemplate(),
    ...template,
    variablesJson: jsonInputValue(template.variablesJson),
  };
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

function textAreaClass(readOnly, height = "h-40") {
  return `${inputClass(readOnly)} ${height} py-3 leading-6`;
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

function parseJsonField(value) {
  if (!String(value || "").trim()) return null;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || (typeof parsed !== "object" && !Array.isArray(parsed))) {
      throw new Error("Variables JSON must be a JSON object or array.");
    }
    return parsed;
  } catch (error) {
    throw new Error(error.message || "Variables JSON must be valid JSON.");
  }
}

function label(value) {
  return String(value || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value) {
  if (!value) return "Not saved";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not saved";
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function TemplateSummary({ template }) {
  return (
    <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Template Summary</p>
          <h3 className="mt-1 text-2xl font-black text-[#111827]">{template.name}</h3>
          <p className="mt-2 text-sm font-bold text-[#667085]">{template.slug}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${template.isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-slate-200"}`}>
          {template.isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Category", label(template.category)],
          ["Subject", template.subject || "Not configured"],
          ["Created", formatDateTime(template.createdAt)],
          ["Updated", formatDateTime(template.updatedAt)],
        ].map(([itemLabel, value]) => (
          <div key={itemLabel} className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">{itemLabel}</p>
            <p className="mt-2 line-clamp-2 text-sm font-black text-[#111827]">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function EmailTemplateForm({ mode, template, canManage }) {
  const router = useRouter();
  const [form, setForm] = useState(() => normalizeTemplate(template));
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
      ...form,
      slug: form.slug || slugify(form.name),
      variablesJson: parseJsonField(form.variablesJson),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(mode === "edit" ? `/api/admin/email-templates/${form.id}` : "/api/admin/email-templates", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to save email template");
      router.push("/admin/email-templates");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (readOnly || mode !== "edit" || !window.confirm("Delete this email template?")) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/email-templates/${form.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to delete email template");
      }
      router.push("/admin/email-templates");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === "edit" ? <TemplateSummary template={form} /> : null}

      <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">{mode === "edit" ? "Edit Template" : "Add Template"}</p>
            <h2 className="mt-1 text-2xl font-black text-[#111827]">{mode === "edit" ? form.name : "Create email template"}</h2>
            {!canManage ? <p className="mt-2 text-sm font-bold text-[#ef3338]">Read-only mode. Your role can view templates but cannot save changes.</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push("/admin/email-templates")} className="h-11 rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              Cancel
            </button>
            {mode === "edit" && canManage ? (
              <button type="button" onClick={handleDelete} disabled={saving} className="h-11 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-[#ef3338] disabled:opacity-60">
                Delete
              </button>
            ) : null}
            {canManage ? (
              <button type="submit" disabled={saving} className="h-11 rounded-xl bg-[#ef3338] px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] disabled:opacity-60">
                {saving ? "Saving..." : "Save Template"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {message ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[#b42318]">{message}</div> : null}

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-black text-[#111827]">Template Details</h3>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Name">
            <input value={form.name || ""} onChange={(event) => setName(event.target.value)} disabled={readOnly} className={inputClass(readOnly)} required />
          </Field>
          <Field label="Slug">
            <input value={form.slug || ""} onChange={(event) => setField("slug", slugify(event.target.value))} disabled={readOnly} className={inputClass(readOnly)} required />
          </Field>
          <Field label="Category">
            <select value={form.category || "TRANSACTIONAL"} onChange={(event) => setField("category", event.target.value)} disabled={readOnly} className={inputClass(readOnly)}>
              {templateCategories.map((category) => <option key={category} value={category}>{label(category)}</option>)}
            </select>
          </Field>
          <div className="flex items-end">
            <Toggle label="Active" checked={Boolean(form.isActive)} disabled={readOnly} onChange={(value) => setField("isActive", value)} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-black text-[#111827]">Message Content</h3>
        <div className="mt-5 space-y-5">
          <Field label="Subject">
            <input value={form.subject || ""} onChange={(event) => setField("subject", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} required />
          </Field>
          <Field label="HTML Body" hint="Stored only. Preview and sending are intentionally out of scope for this task.">
            <textarea value={form.htmlBody || ""} onChange={(event) => setField("htmlBody", event.target.value)} disabled={readOnly} className={`${textAreaClass(readOnly, "h-96")} font-mono text-xs`} required />
          </Field>
          <Field label="Text Body">
            <textarea value={form.textBody || ""} onChange={(event) => setField("textBody", event.target.value)} disabled={readOnly} className={textAreaClass(readOnly, "h-44")} />
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-black text-[#111827]">Variables</h3>
        <div className="mt-5">
          <Field label="Variables JSON" hint='Example: {"orderNumber":"JP-123","customerName":"Fazlur"}'>
            <textarea value={form.variablesJson || ""} onChange={(event) => setField("variablesJson", event.target.value)} disabled={readOnly} className={`${textAreaClass(readOnly, "h-56")} font-mono text-xs`} />
          </Field>
        </div>
      </section>
    </form>
  );
}
