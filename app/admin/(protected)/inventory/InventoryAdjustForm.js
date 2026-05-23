"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InventoryAdjustForm({ productId, disabled = false }) {
  const router = useRouter();
  const [adjustment, setAdjustment] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setMessage("");
    const parsedAdjustment = Number.parseInt(adjustment, 10);

    if (!Number.isFinite(parsedAdjustment) || parsedAdjustment === 0) {
      setMessage("Use a positive or negative stock adjustment.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          adjustment: parsedAdjustment,
          reason: reason || "Manual stock adjustment",
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Stock adjustment failed.");
      }

      setAdjustment("");
      setReason("");
      setMessage("Stock updated.");
      router.refresh();
    } catch (error) {
      setMessage(error.message || "Stock adjustment failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-2 sm:grid-cols-[88px_1fr_auto]">
      <input
        type="number"
        value={adjustment}
        onChange={(event) => setAdjustment(event.target.value)}
        placeholder="+10"
        disabled={disabled || isSaving}
        className="h-10 rounded-xl border border-[#d0d5dd] px-3 text-sm font-black outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 disabled:bg-[#f2f4f7] disabled:text-[#98a2b3]"
      />
      <input
        type="text"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Reason"
        disabled={disabled || isSaving}
        className="h-10 rounded-xl border border-[#d0d5dd] px-3 text-sm font-bold outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 disabled:bg-[#f2f4f7] disabled:text-[#98a2b3]"
      />
      <button
        type="submit"
        disabled={disabled || isSaving}
        className="h-10 rounded-xl bg-[#ef3338] px-4 text-sm font-black text-white shadow-[0_10px_20px_rgba(239,51,56,0.2)] transition hover:bg-[#d91f28] disabled:bg-[#f2a0a3]"
      >
        {isSaving ? "Saving" : "Adjust"}
      </button>
      {message ? <p className="sm:col-span-3 text-xs font-bold text-[#667085]">{message}</p> : null}
    </form>
  );
}
