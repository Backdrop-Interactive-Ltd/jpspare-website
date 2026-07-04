"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function emptyCoupon() {
  return {
    code: "",
    description: "",
    discountType: "FIXED",
    discountValue: "",
    minOrderValue: "",
    maxDiscount: "",
    startsAt: "",
    endsAt: "",
    usageLimit: "",
    usedCount: 0,
    isActive: true,
    _count: { orders: 0, redemptions: 0 },
  };
}

function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function normalizeCoupon(coupon) {
  if (!coupon) return emptyCoupon();
  return {
    ...emptyCoupon(),
    ...coupon,
    startsAt: toDateTimeLocal(coupon.startsAt),
    endsAt: toDateTimeLocal(coupon.endsAt),
    discountValue: coupon.discountValue ?? "",
    minOrderValue: coupon.minOrderValue ?? "",
    maxDiscount: coupon.maxDiscount ?? "",
    usageLimit: coupon.usageLimit ?? "",
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

export default function CouponForm({ mode, coupon, canManage }) {
  const router = useRouter();
  const [form, setForm] = useState(() => normalizeCoupon(coupon));
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
      const response = await fetch(mode === "edit" ? `/api/admin/coupons/${form.id}` : "/api/admin/coupons", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, code: String(form.code || "").trim().toUpperCase() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to save coupon");
      router.push("/admin/coupons");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (readOnly || mode !== "edit" || !window.confirm("Delete this coupon?")) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/coupons/${form.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to delete coupon");
      }
      router.push("/admin/coupons");
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
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">{mode === "edit" ? "Edit Coupon" : "Add Coupon"}</p>
            <h2 className="mt-1 text-2xl font-black text-[#111827]">{mode === "edit" ? form.code : "Create coupon"}</h2>
            {!canManage ? <p className="mt-2 text-sm font-bold text-[#ef3338]">Read-only mode. Your role can view coupons but cannot save changes.</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push("/admin/coupons")} className="h-11 rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              Cancel
            </button>
            {mode === "edit" && canManage ? (
              <button type="button" onClick={handleDelete} disabled={saving} className="h-11 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-[#ef3338] disabled:opacity-60">
                Delete
              </button>
            ) : null}
            {canManage ? (
              <button type="submit" disabled={saving} className="h-11 rounded-xl bg-[#ef3338] px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] disabled:opacity-60">
                {saving ? "Saving..." : "Save Coupon"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {message ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[#b42318]">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-black text-[#111827]">Coupon Details</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Coupon code">
              <input value={form.code || ""} onChange={(event) => setField("code", event.target.value.toUpperCase())} disabled={readOnly} className={inputClass(readOnly)} required />
            </Field>
            <Field label="Discount type">
              <select value={form.discountType || "FIXED"} onChange={(event) => setField("discountType", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} required>
                <option value="FIXED">Fixed amount</option>
                <option value="PERCENT">Percentage</option>
              </select>
            </Field>
            <Field label="Discount value">
              <input type="number" min="0.01" step="0.01" value={form.discountValue || ""} onChange={(event) => setField("discountValue", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} required />
            </Field>
            <Field label="Minimum order value">
              <input type="number" min="0" step="0.01" value={form.minOrderValue || ""} onChange={(event) => setField("minOrderValue", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
            </Field>
            <Field label="Maximum discount">
              <input type="number" min="0" step="0.01" value={form.maxDiscount || ""} onChange={(event) => setField("maxDiscount", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
            </Field>
            <Field label="Usage limit">
              <input type="number" min="0" step="1" value={form.usageLimit || ""} onChange={(event) => setField("usageLimit", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
            </Field>
            <Field label="Starts at">
              <input type="datetime-local" value={form.startsAt || ""} onChange={(event) => setField("startsAt", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
            </Field>
            <Field label="Expires at">
              <input type="datetime-local" value={form.endsAt || ""} onChange={(event) => setField("endsAt", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
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
              <Toggle label="Active coupon" checked={Boolean(form.isActive)} disabled={readOnly} onChange={(value) => setField("isActive", value)} />
            </div>
          </section>

          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-[#111827]">Usage</h3>
            <div className="mt-4 grid gap-3 text-sm font-bold text-[#667085]">
              <p>
                Used count: <span className="font-black text-[#111827]">{form.usedCount || 0}</span>
              </p>
              <p>
                Orders: <span className="font-black text-[#111827]">{form._count?.orders || 0}</span>
              </p>
              <p>
                Redemptions: <span className="font-black text-[#111827]">{form._count?.redemptions || 0}</span>
              </p>
            </div>
            <p className="mt-4 text-xs font-semibold leading-5 text-[#98a2b3]">Usage count is managed by checkout/redemption logic and is read-only here.</p>
          </section>
        </aside>
      </div>
    </form>
  );
}
