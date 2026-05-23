"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function emptySupplier() {
  return {
    name: "",
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    status: "ACTIVE",
    externalId: "",
    source: "LOCAL",
  };
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#344054]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function inputClass(readOnly) {
  return `h-12 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 ${
    readOnly ? "cursor-not-allowed bg-[#f2f4f7] text-[#667085]" : ""
  }`;
}

export default function SupplierForm({ mode, supplier, canManage }) {
  const router = useRouter();
  const [form, setForm] = useState(() => ({ ...emptySupplier(), ...(supplier || {}) }));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const readOnly = !canManage;

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(mode === "edit" ? `/api/admin/suppliers/${form.id}` : "/api/admin/suppliers", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save supplier");
      router.push("/admin/suppliers");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (readOnly || mode !== "edit" || !window.confirm("Delete this supplier? Existing purchases will keep their records.")) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/suppliers/${form.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to delete supplier");
      }
      router.push("/admin/suppliers");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Supplier Management</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">{mode === "edit" ? form.name : "Add Supplier"}</h1>
            {!canManage ? <p className="mt-2 text-sm font-bold text-[#ef3338]">Read-only mode for your role.</p> : null}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => router.push("/admin/suppliers")} className="h-11 rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              Back
            </button>
            {mode === "edit" && canManage ? (
              <button type="button" onClick={handleDelete} disabled={saving} className="h-11 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-[#ef3338]">
                Delete
              </button>
            ) : null}
            {canManage ? (
              <button type="submit" disabled={saving} className="h-11 rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)]">
                {saving ? "Saving..." : "Save Supplier"}
              </button>
            ) : null}
          </div>
        </div>
        {message ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[#ef3338]">{message}</div> : null}
      </section>

      <section className="grid gap-6 rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-2">
        <Field label="Supplier name">
          <input value={form.name || ""} onChange={(event) => setField("name", event.target.value)} disabled={readOnly} required className={inputClass(readOnly)} />
        </Field>
        <Field label="Company name">
          <input value={form.companyName || ""} onChange={(event) => setField("companyName", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
        </Field>
        <Field label="Contact person">
          <input value={form.contactPerson || ""} onChange={(event) => setField("contactPerson", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
        </Field>
        <Field label="Status">
          <select value={form.status || "ACTIVE"} onChange={(event) => setField("status", event.target.value)} disabled={readOnly} className={inputClass(readOnly)}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </Field>
        <Field label="Phone">
          <input value={form.phone || ""} onChange={(event) => setField("phone", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email || ""} onChange={(event) => setField("email", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
        </Field>
        <Field label="Address">
          <textarea value={form.address || ""} onChange={(event) => setField("address", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} min-h-28 py-3`} />
        </Field>
        <Field label="Notes">
          <textarea value={form.notes || ""} onChange={(event) => setField("notes", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} min-h-28 py-3`} />
        </Field>
        <Field label="External supplier ID">
          <input value={form.externalId || ""} onChange={(event) => setField("externalId", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
        </Field>
        <Field label="Source">
          <input value={form.source || "LOCAL"} onChange={(event) => setField("source", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
        </Field>
      </section>
    </form>
  );
}
