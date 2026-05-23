"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const PURCHASE_STATUSES = ["DRAFT", "ORDERED", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"];

function emptyPurchase() {
  return {
    supplierId: "",
    status: "DRAFT",
    notes: "",
    warehouseId: "",
    externalPurchaseId: "",
    externalId: "",
    source: "LOCAL",
    items: [emptyItem()],
  };
}

function emptyItem() {
  return {
    productId: "",
    productTitle: "",
    sku: "",
    quantity: 1,
    costPrice: "0.00",
  };
}

function normalizePurchase(purchase) {
  if (!purchase) return emptyPurchase();
  return {
    ...emptyPurchase(),
    ...purchase,
    supplierId: purchase.supplierId || "",
    notes: purchase.notes || "",
    warehouseId: purchase.warehouseId || "",
    externalPurchaseId: purchase.externalPurchaseId || "",
    externalId: purchase.externalId || "",
    source: purchase.source || "LOCAL",
    items: purchase.items?.length
      ? purchase.items.map((item) => ({
          id: item.id,
          productId: item.productId || "",
          productTitle: item.productTitle || item.product?.title || "",
          sku: item.sku || item.product?.sku || "",
          quantity: item.quantity || 1,
          receivedQuantity: item.receivedQuantity || 0,
          costPrice: item.costPrice || "0.00",
          total: item.total || "0.00",
        }))
      : [emptyItem()],
  };
}

function currency(value) {
  return `Tk ${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

function statusTone(status) {
  if (status === "RECEIVED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "CANCELLED") return "bg-gray-100 text-gray-600 ring-gray-200";
  if (status === "ORDERED") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "PARTIALLY_RECEIVED") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-red-50 text-[#ef3338] ring-red-200";
}

export default function PurchaseForm({ mode, purchase, suppliers, products, canManage }) {
  const router = useRouter();
  const [form, setForm] = useState(() => normalizePurchase(purchase));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const readOnly = !canManage;
  const receivedLocked = mode === "edit" && purchase?.status === "RECEIVED";
  const noActiveSuppliers = mode === "new" && suppliers.length === 0;

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const subtotal = form.items.reduce((sum, item) => sum + Number(item.costPrice || 0) * Number(item.quantity || 0), 0);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setItem(index, field, value) {
    setForm((current) => {
      const items = [...current.items];
      const next = { ...items[index], [field]: value };
      if (field === "productId") {
        const product = productMap.get(value);
        next.productTitle = product?.title || "";
        next.sku = product?.sku || "";
        next.costPrice = product?.costPrice || next.costPrice || "0.00";
      }
      items[index] = next;
      return { ...current, items };
    });
  }

  function addItem() {
    setForm((current) => ({ ...current, items: [...current.items, emptyItem()] }));
  }

  function removeItem(index) {
    setForm((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) || [emptyItem()] }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (readOnly) return;
    if (noActiveSuppliers) {
      setMessage("No active suppliers found. Please activate or create an active supplier first.");
      return;
    }
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(mode === "edit" ? `/api/admin/purchases/${form.id}` : "/api/admin/purchases", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save purchase");
      router.push(mode === "edit" ? `/admin/purchases/${form.id}` : "/admin/purchases");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (readOnly || mode !== "edit" || !window.confirm("Delete this purchase order?")) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/purchases/${form.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to delete purchase");
      }
      router.push("/admin/purchases");
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
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Purchase Workflow</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">{mode === "edit" ? form.purchaseNumber : "Create Purchase Order"}</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Receiving a purchase automatically posts stock-in movements to inventory.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push("/admin/purchases")} className="h-11 rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              Back
            </button>
            {mode === "edit" && canManage && form.status !== "RECEIVED" ? (
              <button type="button" onClick={handleDelete} disabled={saving} className="h-11 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-[#ef3338]">
                Delete
              </button>
            ) : null}
            {canManage ? (
              <button type="submit" disabled={saving || noActiveSuppliers} className="h-11 rounded-xl bg-[#ef3338] px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] disabled:opacity-60">
                {saving ? "Saving..." : "Save Purchase"}
              </button>
            ) : null}
          </div>
        </div>
        {!canManage ? <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">Read-only mode for your role.</p> : null}
        {receivedLocked ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">This purchase is received. Product rows are locked to protect posted inventory history.</p> : null}
        {noActiveSuppliers ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-bold text-amber-800">No active suppliers found. Please activate or create an active supplier first.</p>
            <Link href="/admin/suppliers/new" className="inline-flex h-10 items-center rounded-xl bg-[#ef3338] px-4 text-sm font-black text-white shadow-[0_10px_20px_rgba(239,51,56,0.2)]">
              Create Active Supplier
            </Link>
          </div>
        ) : null}
        {message ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[#ef3338]">{message}</div> : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-black text-[#111827]">Purchase Details</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Supplier">
              <select value={form.supplierId || ""} onChange={(event) => setField("supplierId", event.target.value)} disabled={readOnly || noActiveSuppliers} className={inputClass(readOnly || noActiveSuppliers)}>
                <option value="">{noActiveSuppliers ? "No active suppliers available" : "No supplier selected"}</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}{supplier.companyName ? ` · ${supplier.companyName}` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status" hint="Changing status to RECEIVED increases product stock once.">
              <select value={form.status || "DRAFT"} onChange={(event) => setField("status", event.target.value)} disabled={readOnly} className={inputClass(readOnly)}>
                {PURCHASE_STATUSES.map((status) => (
                  <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
                ))}
              </select>
            </Field>
            <Field label="Warehouse ID">
              <input value={form.warehouseId || ""} onChange={(event) => setField("warehouseId", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} placeholder="Main warehouse" />
            </Field>
            <Field label="External purchase ID">
              <input value={form.externalPurchaseId || ""} onChange={(event) => setField("externalPurchaseId", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} placeholder="ERP/BMS purchase reference" />
            </Field>
            <Field label="Source">
              <input value={form.source || "LOCAL"} onChange={(event) => setField("source", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
            </Field>
            <Field label="External ID">
              <input value={form.externalId || ""} onChange={(event) => setField("externalId", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Admin notes">
              <textarea value={form.notes || ""} onChange={(event) => setField("notes", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} min-h-28 py-3`} placeholder="Supplier terms, shipment reference, receiving note..." />
            </Field>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-black text-[#111827]">Summary</h2>
            <div className="mt-5 space-y-3 text-sm font-bold text-[#667085]">
              {mode === "edit" ? (
                <div className="flex justify-between gap-3">
                  <span>Purchase number</span>
                  <span className="font-black text-[#111827]">{form.purchaseNumber}</span>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <span>Status</span>
                <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusTone(form.status)}`}>{form.status}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Line items</span>
                <span className="font-black text-[#111827]">{form.items.length}</span>
              </div>
              <div className="border-t border-[#eef0f3] pt-3">
                <div className="flex justify-between gap-3 text-base">
                  <span>Total amount</span>
                  <span className="font-black text-[#ef3338]">{currency(subtotal)}</span>
                </div>
              </div>
            </div>
          </section>

          {purchase?.timeline?.length ? (
            <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-black text-[#111827]">Timeline</h2>
              <div className="mt-5 space-y-4">
                {purchase.timeline.map((event) => (
                  <div key={event.id} className="border-l-2 border-red-100 pl-4">
                    <p className="text-sm font-black text-[#111827]">{event.title}</p>
                    <p className="mt-1 text-xs font-semibold text-[#667085]">{event.message || "No details"}</p>
                    <p className="mt-1 text-xs font-bold text-[#98a2b3]">{new Date(event.createdAt).toLocaleString("en-GB")}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-[#111827]">Purchase Items</h2>
          {canManage && !receivedLocked ? (
            <button type="button" onClick={addItem} className="h-10 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-black text-[#ef3338]">
              Add Item
            </button>
          ) : null}
        </div>
        <div className="mt-5 space-y-4">
          {form.items.map((item, index) => {
            const itemTotal = Number(item.costPrice || 0) * Number(item.quantity || 0);
            const rowReadOnly = readOnly || receivedLocked;
            return (
              <div key={item.id || index} className="grid gap-3 rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-4 xl:grid-cols-[1.5fr_1fr_120px_150px_140px_auto]">
                <Field label="Product">
                  <select value={item.productId || ""} onChange={(event) => setItem(index, "productId", event.target.value)} disabled={rowReadOnly} className={inputClass(rowReadOnly)}>
                    <option value="">Manual item</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.title}{product.sku ? ` · ${product.sku}` : ""}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Title">
                  <input value={item.productTitle || ""} onChange={(event) => setItem(index, "productTitle", event.target.value)} disabled={rowReadOnly} required className={inputClass(rowReadOnly)} />
                </Field>
                <Field label="Qty">
                  <input type="number" min="1" value={item.quantity || 1} onChange={(event) => setItem(index, "quantity", event.target.value)} disabled={rowReadOnly} required className={inputClass(rowReadOnly)} />
                </Field>
                <Field label="Cost price">
                  <input type="number" min="0" step="0.01" value={item.costPrice || ""} onChange={(event) => setItem(index, "costPrice", event.target.value)} disabled={rowReadOnly} required className={inputClass(rowReadOnly)} />
                </Field>
                <Field label="Line total">
                  <div className="grid h-12 place-items-center rounded-xl border border-[#d0d5dd] bg-white px-4 text-sm font-black text-[#ef3338]">{currency(itemTotal)}</div>
                </Field>
                {canManage && !receivedLocked ? (
                  <button type="button" onClick={() => removeItem(index)} disabled={form.items.length <= 1} className="self-end rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-black text-[#ef3338] disabled:cursor-not-allowed disabled:opacity-40">
                    Remove
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {purchase?.inventoryMovements?.length ? (
        <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-black text-[#111827]">Inventory Movements</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-[860px] w-full text-left">
              <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f3]">
                {purchase.inventoryMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-4 py-3 text-sm font-black text-[#111827]">{movement.product?.title || "Product"}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#344054]">{movement.type}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#344054]">{movement.quantity}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#667085]">{movement.previousStock} → {movement.newStock}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#667085]">{new Date(movement.createdAt).toLocaleString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </form>
  );
}
