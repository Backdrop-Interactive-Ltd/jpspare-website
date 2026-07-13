"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyVariant() {
  return {
    id: "",
    name: "",
    slug: "",
    description: "",
    isActive: true,
    sortOrder: 0,
  };
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

export default function VariantsManager({ initialVariants, canManage }) {
  const router = useRouter();
  const [variants, setVariants] = useState(initialVariants || []);
  const [form, setForm] = useState(emptyVariant);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const readOnly = !canManage;
  const editing = Boolean(form.id);

  const filteredVariants = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return variants;
    return variants.filter((variant) => [variant.name, variant.slug, variant.description].some((value) => String(value || "").toLowerCase().includes(needle)));
  }, [variants, query]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setName(value) {
    setForm((current) => ({ ...current, name: value, slug: current.slug ? current.slug : slugify(value) }));
  }

  function resetForm() {
    setForm(emptyVariant());
    setMessage("");
  }

  async function refreshVariants() {
    const response = await fetch("/api/admin/variants?limit=100");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to refresh variants");
    setVariants(payload.items || []);
    router.refresh();
  }

  async function saveVariant(event) {
    event.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(editing ? `/api/admin/variants/${form.id}` : "/api/admin/variants", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug: form.slug || slugify(form.name) }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save variant");
      await refreshVariants();
      resetForm();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteVariant(variant) {
    if (readOnly || !window.confirm(`Delete "${variant.name}"?`)) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/variants/${variant.id}`, { method: "DELETE" });
      const payload = response.status === 204 ? {} : await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to delete variant");
      await refreshVariants();
      if (form.id === variant.id) resetForm();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleVariant(variant) {
    if (readOnly) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/variants/${variant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...variant, isActive: !variant.isActive }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to update variant");
      await refreshVariants();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  function editVariant(variant) {
    setForm({ ...emptyVariant(), ...variant, description: variant.description || "" });
    setMessage("");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Product Configuration</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Variants</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Define reusable variant labels for future product option configuration.</p>
          </div>
          {!canManage ? <span className="inline-flex h-11 items-center rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-black text-amber-700">Read-only</span> : null}
        </div>
      </section>

      {message ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[#b42318]">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={saveVariant} className="space-y-5 rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-xl font-black text-[#111827]">{editing ? "Edit Variant" : "Add Variant"}</h2>
            <p className="mt-1 text-sm font-semibold text-[#667085]">Foundation definitions only. Product assignment is intentionally out of scope.</p>
          </div>

          <Field label="Name">
            <input value={form.name || ""} onChange={(event) => setName(event.target.value)} disabled={readOnly} className={inputClass(readOnly)} required />
          </Field>

          <Field label="Slug">
            <input value={form.slug || ""} onChange={(event) => setField("slug", slugify(event.target.value))} disabled={readOnly} className={inputClass(readOnly)} required />
          </Field>

          <Field label="Sort Order">
            <input type="number" value={form.sortOrder ?? 0} onChange={(event) => setField("sortOrder", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
          </Field>

          <Field label="Description">
            <textarea value={form.description || ""} onChange={(event) => setField("description", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} h-28 py-3`} />
          </Field>

          <Toggle label="Active variant" checked={Boolean(form.isActive)} disabled={readOnly} onChange={(value) => setField("isActive", value)} />

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={resetForm} className="h-11 rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              Clear
            </button>
            {canManage ? (
              <button type="submit" disabled={saving} className="h-11 rounded-xl bg-[#ef3338] px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] disabled:opacity-60">
                {saving ? "Saving..." : editing ? "Save Variant" : "Add Variant"}
              </button>
            ) : null}
          </div>
        </form>

        <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef0f3] p-4">
            <div>
              <h2 className="text-xl font-black text-[#111827]">Variants</h2>
              <p className="mt-1 text-sm font-semibold text-[#667085]">{variants.length} total variant definitions</p>
            </div>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search variants" className="h-11 w-full rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 sm:w-72" />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left">
              <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
                <tr>
                  <th className="px-5 py-4">Variant</th>
                  <th className="px-5 py-4">Sort</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f3]">
                {filteredVariants.map((variant) => (
                  <tr key={variant.id} className="transition hover:bg-red-50/40">
                    <td className="px-5 py-4">
                      <p className="font-black text-[#111827]">{variant.name}</p>
                      <p className="mt-1 text-xs font-bold text-[#667085]">{variant.slug}</p>
                      {variant.description ? <p className="mt-1 max-w-md truncate text-xs font-semibold text-[#98a2b3]">{variant.description}</p> : null}
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-[#111827]">{variant.sortOrder}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(variant.isActive)}`}>{variant.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => editVariant(variant)} className="rounded-xl border border-[#d0d5dd] px-3 py-2 text-xs font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                          {canManage ? "Edit" : "View"}
                        </button>
                        {canManage ? (
                          <>
                            <button type="button" onClick={() => toggleVariant(variant)} disabled={saving} className="rounded-xl border border-[#d0d5dd] px-3 py-2 text-xs font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                              {variant.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button type="button" onClick={() => deleteVariant(variant)} disabled={saving} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-[#ef3338]">
                              Delete
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredVariants.length ? (
                  <tr>
                    <td colSpan="4" className="px-5 py-16 text-center">
                      <p className="text-lg font-black text-[#111827]">No variants found</p>
                      <p className="mt-2 text-sm font-semibold text-[#667085]">Create your first reusable variant or adjust the search.</p>
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
