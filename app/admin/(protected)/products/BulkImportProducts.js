"use client";

import { useState } from "react";
import Link from "next/link";

export default function BulkImportProducts({ canManage }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");

  async function submit(confirm = false) {
    if (!canManage || !file) return;
    setBusy(confirm ? "import" : "preview");
    setMessage("");
    if (!confirm) setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("confirm", confirm ? "true" : "false");
      const response = await fetch("/api/admin/products/import", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to process CSV");
      if (confirm) {
        setResult(payload);
        setPreview(null);
      } else {
        setPreview(payload);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy("");
    }
  }

  const rows = preview?.rows || [];
  const invalidRows = rows.filter((row) => !row.valid);

  return (
    <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Bulk Import</p>
          <h2 className="mt-1 text-2xl font-black text-[#111827]">Import products from CSV</h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#667085]">Upload a UTF-8 CSV, review validation, then import only valid rows. Products are created as drafts.</p>
        </div>
        <Link href="/admin/products" className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
          Close
        </Link>
      </div>

      {!canManage ? <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-700">You do not have permission to import products.</p> : null}
      {message ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-[#b42318]">{message}</p> : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto_auto]">
        <input
          type="file"
          accept=".csv,text/csv"
          disabled={!canManage || Boolean(busy)}
          onChange={(event) => {
            setFile(event.target.files?.[0] || null);
            setPreview(null);
            setResult(null);
            setMessage("");
          }}
          className="rounded-xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-4 text-sm font-bold text-[#667085]"
        />
        <button type="button" disabled={!canManage || !file || Boolean(busy)} onClick={() => submit(false)} className="h-12 rounded-xl border border-[#d0d5dd] px-5 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338] disabled:opacity-50">
          {busy === "preview" ? "Validating..." : "Preview & Validate"}
        </button>
        <button type="button" disabled={!canManage || !file || !preview?.summary?.validRows || Boolean(busy)} onClick={() => submit(true)} className="h-12 rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] disabled:opacity-50">
          {busy === "import" ? "Importing..." : "Import Valid Rows"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-[#f8fafc] p-4 text-xs font-bold leading-6 text-[#667085]">
        Required columns: Name, Category, Price. Supported columns: SKU, Name, Slug, Brand, Category, Product Type, Price, Compare Price, Stock Quantity, Featured.
      </div>

      {preview ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Total rows" value={preview.summary.totalRows} />
            <SummaryCard label="Valid rows" value={preview.summary.validRows} tone="green" />
            <SummaryCard label="Invalid rows" value={preview.summary.invalidRows} tone="red" />
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e5e7eb]">
            <div className="max-h-80 overflow-auto">
              <table className="min-w-[900px] w-full text-left">
                <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.12em] text-[#667085]">
                  <tr>
                    <th className="px-4 py-3">Row</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef0f3] text-sm">
                  {rows.slice(0, 100).map((row) => (
                    <tr key={row.rowNumber}>
                      <td className="px-4 py-3 font-black text-[#111827]">{row.rowNumber}</td>
                      <td className="px-4 py-3 font-bold text-[#344054]">{row.product.name || "—"}</td>
                      <td className="px-4 py-3 font-bold text-[#667085]">{row.product.sku || "—"}</td>
                      <td className="px-4 py-3 font-bold text-[#667085]">{row.product.category || "—"}</td>
                      <td className="px-4 py-3 font-bold text-[#667085]">{row.product.price || "—"}</td>
                      <td className="px-4 py-3">
                        {row.valid ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">Valid</span> : <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-[#ef3338] ring-1 ring-red-200">{row.errors.join(", ")}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {rows.length > 100 ? <p className="text-xs font-bold text-[#667085]">Showing first 100 preview rows.</p> : null}
          {invalidRows.length ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-700">Invalid rows will be skipped during import.</p> : null}
        </div>
      ) : null}

      {result ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <SummaryCard label="Total rows" value={result.summary.totalRows} />
          <SummaryCard label="Imported" value={result.summary.imported} tone="green" />
          <SummaryCard label="Skipped" value={result.summary.skipped} tone="amber" />
          <SummaryCard label="Failed" value={result.summary.failed} tone="red" />
        </div>
      ) : null}
    </section>
  );
}

function SummaryCard({ label, value, tone = "gray" }) {
  const toneClass = {
    green: "text-emerald-700",
    red: "text-[#ef3338]",
    amber: "text-amber-700",
    gray: "text-[#111827]",
  }[tone];

  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#667085]">{label}</p>
      <p className={`mt-2 text-2xl font-black ${toneClass}`}>{value || 0}</p>
    </div>
  );
}
