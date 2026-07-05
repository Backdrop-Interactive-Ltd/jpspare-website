"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function AdjustPointsForm({ customerId }) {
  const router = useRouter();
  const [type, setType] = useState("ADJUSTMENT_CREDIT");
  const [points, setPoints] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const response = await fetch(`/api/admin/loyalty/${customerId}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        points,
        description,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Unable to adjust loyalty points.");
      return;
    }

    setPoints("");
    setDescription("");
    setMessage("Loyalty points adjusted successfully.");
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Manual Adjustment</p>
          <h2 className="mt-1 text-xl font-black text-[#111827]">Credit or Debit Points</h2>
          <p className="mt-1 text-sm font-semibold text-[#667085]">Manual adjustments write a ledger entry immediately.</p>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-200">Manage only</span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[220px_180px_1fr_auto]">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-[#667085]">Type</span>
          <select value={type} onChange={(event) => setType(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#d0d5dd] px-3 text-sm font-bold outline-none focus:border-[#ef3338]">
            <option value="ADJUSTMENT_CREDIT">Credit points</option>
            <option value="ADJUSTMENT_DEBIT">Debit points</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-[#667085]">Points</span>
          <input type="number" min="1" step="1" value={points} onChange={(event) => setPoints(event.target.value)} placeholder="500" className="mt-2 h-11 w-full rounded-xl border border-[#d0d5dd] px-3 text-sm font-bold outline-none focus:border-[#ef3338]" />
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-[#667085]">Description</span>
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Manual bonus points" className="mt-2 h-11 w-full rounded-xl border border-[#d0d5dd] px-3 text-sm font-bold outline-none focus:border-[#ef3338]" />
        </label>

        <button disabled={isPending} className="mt-6 h-11 rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? "Saving..." : "Apply"}
        </button>
      </div>

      {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-[#ef3338]">{error}</p> : null}
      {message ? <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">{message}</p> : null}
    </form>
  );
}
