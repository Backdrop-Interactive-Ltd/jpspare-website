"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const ATTRIBUTE_TYPES = ["TEXT", "NUMBER", "BOOLEAN", "SELECT", "MULTI_SELECT"];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyAttribute() {
  return {
    id: "",
    name: "",
    slug: "",
    description: "",
    type: "TEXT",
    isActive: true,
    sortOrder: 0,
  };
}

function typeLabel(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(isActive) {
  return isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-gray-100 text-gray-600 ring-gray-200";
}

function inputClass(readOnly) {
  return `h-11 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 ${
    readOnly ? "cursor-not-allowed bg-[#f2f4f7] text-[#667085]" : ""
  }`;
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#344054]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Toggle({ label, checked, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex h-11 items-center justify-between rounded-xl border px-4 text-sm font-black transition ${
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

export default function AttributesManager({ initialAttributes, canManage }) {
  const router = useRouter();
  const [attributes, setAttributes] = useState(initialAttributes || []);
  const [form, setForm] = useState(emptyAttribute);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const readOnly = !canManage;
  const editing = Boolean(form.id);

  const filteredAttributes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return attributes;
    return attributes.filter((attribute) =>
      [attribute.name, attribute.slug, attribute.description, attribute.type].some((value) => String(value || "").toLowerCase().includes(needle))
    );
  }, [attributes, query]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setName(value) {
    setForm((current) => ({ ...current, name: value, slug: current.slug ? current.slug : slugify(value) }));
  }

  function resetForm() {
    setForm(emptyAttribute());
    setMessage("");
  }

  async function refreshAttributes() {
    const response = await fetch("/api/admin/attributes?limit=100");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to refresh attributes");
    setAttributes(payload.items || []);
    router.refresh();
  }

  async function saveAttribute(event) {
    event.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(editing ? `/api/admin/attributes/${form.id}` : "/api/admin/attributes", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug: form.slug || slugify(form.name) }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save attribute");
      await refreshAttributes();
      resetForm();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteAttribute(attribute) {
    if (readOnly || !window.confirm(`Delete "${attribute.name}"?`)) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/attributes/${attribute.id}`, { method: "DELETE" });
      const payload = response.status === 204 ? {} : await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to delete attribute");
      await refreshAttributes();
      if (form.id === attribute.id) resetForm();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAttribute(attribute) {
    if (readOnly) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/attributes/${attribute.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...attribute, isActive: !attribute.isActive }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to update attribute");
      await refreshAttributes();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  function editAttribute(attribute) {
    setForm({ ...emptyAttribute(), ...attribute, description: attribute.description || "" });
    setMessage("");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Product Configuration</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Product Attributes</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Define reusable website-facing attribute names before assigning them to products later.</p>
          </div>
          {!canManage ? <span className="inline-flex h-11 items-center rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-black text-amber-700">Read-only</span> : null}
        </div>
      </section>

      {message ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[#b42318]">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={saveAttribute} className="space-y-5 rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-xl font-black text-[#111827]">{editing ? "Edit Attribute" : "Add Attribute"}</h2>
            <p className="mt-1 text-sm font-semibold text-[#667085]">Reusable definitions only. Product assignment is intentionally out of scope.</p>
          </div>

          <Field label="Name">
            <input value={form.name || ""} onChange={(event) => setName(event.target.value)} disabled={readOnly} className={inputClass(readOnly)} required />
          </Field>

          <Field label="Slug">
            <input value={form.slug || ""} onChange={(event) => setField("slug", slugify(event.target.value))} disabled={readOnly} className={inputClass(readOnly)} required />
          </Field>

          <Field label="Type">
            <select value={form.type || "TEXT"} onChange={(event) => setField("type", event.target.value)} disabled={readOnly} className={inputClass(readOnly)}>
              {ATTRIBUTE_TYPES.map((type) => (
                <option key={type} value={type}>{typeLabel(type)}</option>
              ))}
            </select>
          </Field>

          <Field label="Sort Order">
            <input type="number" value={form.sortOrder ?? 0} onChange={(event) => setField("sortOrder", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
          </Field>

          <Field label="Description">
            <textarea value={form.description || ""} onChange={(event) => setField("description", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} h-28 py-3`} />
          </Field>

          <Toggle label="Active attribute" checked={Boolean(form.isActive)} disabled={readOnly} onChange={(value) => setField("isActive", value)} />

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={resetForm} className="h-11 rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              Clear
            </button>
            {canManage ? (
              <button type="submit" disabled={saving} className="h-11 rounded-xl bg-[#ef3338] px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] disabled:opacity-60">
                {saving ? "Saving..." : editing ? "Save Attribute" : "Add Attribute"}
              </button>
            ) : null}
          </div>
        </form>

        <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef0f3] p-4">
            <div>
              <h2 className="text-xl font-black text-[#111827]">Attributes</h2>
              <p className="mt-1 text-sm font-semibold text-[#667085]">{attributes.length} total definitions</p>
            </div>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search attributes" className="h-11 w-full rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 sm:w-72" />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full text-left">
              <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
                <tr>
                  <th className="px-5 py-4">Attribute</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Sort</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f3]">
                {filteredAttributes.map((attribute) => (
                  <tr key={attribute.id} className="transition hover:bg-red-50/40">
                    <td className="px-5 py-4">
                      <p className="font-black text-[#111827]">{attribute.name}</p>
                      <p className="mt-1 text-xs font-bold text-[#667085]">{attribute.slug}</p>
                      {attribute.description ? <p className="mt-1 max-w-md truncate text-xs font-semibold text-[#98a2b3]">{attribute.description}</p> : null}
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-[#344054]">{typeLabel(attribute.type)}</td>
                    <td className="px-5 py-4 text-sm font-black text-[#111827]">{attribute.sortOrder}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(attribute.isActive)}`}>{attribute.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => editAttribute(attribute)} className="rounded-xl border border-[#d0d5dd] px-3 py-2 text-xs font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                          {canManage ? "Edit" : "View"}
                        </button>
                        {canManage ? (
                          <>
                            <button type="button" onClick={() => toggleAttribute(attribute)} disabled={saving} className="rounded-xl border border-[#d0d5dd] px-3 py-2 text-xs font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                              {attribute.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button type="button" onClick={() => deleteAttribute(attribute)} disabled={saving} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-[#ef3338]">
                              Delete
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredAttributes.length ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-16 text-center">
                      <p className="text-lg font-black text-[#111827]">No attributes found</p>
                      <p className="mt-2 text-sm font-semibold text-[#667085]">Create your first reusable product attribute or adjust the search.</p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
