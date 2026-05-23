"use client";

import Link from "next/link";
import { useState } from "react";

export default function InvoiceActions({ orderId, documentType }) {
  const [printing, setPrinting] = useState(false);
  const typeParam = documentType === "packing-slip" ? "?type=packing-slip" : "";
  const isPackingSlip = documentType === "packing-slip";

  async function handlePrint() {
    setPrinting(true);
    try {
      await fetch(`/api/admin/orders/${orderId}/invoice/print`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType: isPackingSlip ? "Packing slip" : "Invoice" }),
      });
    } catch {
      // Printing should still work even if the timestamp endpoint is unavailable.
    } finally {
      setPrinting(false);
      window.print();
    }
  }

  return (
    <div className="admin-print-hidden flex flex-wrap items-center justify-between gap-3">
      <Link href={`/admin/orders/${orderId}`} className="rounded-2xl border border-[#d0d5dd] bg-white px-4 py-2 text-sm font-black text-[#344054] transition hover:border-[#ef3338] hover:text-[#ef3338]">
        Back to order
      </Link>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePrint}
          disabled={printing}
          className="rounded-2xl bg-[#111827] px-4 py-2 text-sm font-black text-white transition hover:bg-[#ef3338] disabled:opacity-60"
        >
          {printing ? "Preparing..." : isPackingSlip ? "Print Packing Slip" : "Print Invoice"}
        </button>
        <a
          href={`/api/admin/orders/${orderId}/invoice/pdf${typeParam}`}
          className="rounded-2xl bg-[#ef3338] px-4 py-2 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] transition hover:bg-[#d71920]"
        >
          Download PDF
        </a>
        <Link
          href={isPackingSlip ? `/admin/orders/${orderId}/invoice` : `/admin/orders/${orderId}/invoice?type=packing-slip`}
          className="rounded-2xl border border-[#ef3338] bg-white px-4 py-2 text-sm font-black text-[#ef3338] transition hover:bg-[#fff3f3]"
        >
          {isPackingSlip ? "View Invoice" : "Generate Packing Slip"}
        </Link>
      </div>
    </div>
  );
}
