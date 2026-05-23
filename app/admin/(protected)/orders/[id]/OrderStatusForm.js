"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES = ["UNPAID", "PAID", "FAILED", "REFUNDED"];

function label(value) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function OrderStatusForm({ orderId, status, paymentStatus, canManageStatus, canManagePayment, canAddNotes }) {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState(status);
  const [payStatus, setPayStatus] = useState(PAYMENT_STATUSES.includes(paymentStatus) ? paymentStatus : "UNPAID");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save(event) {
    event.preventDefault();
    if (!canManageStatus) return;

    startTransition(async () => {
      setMessage("");
      setIsError(false);
      const payload = { status: orderStatus };
      if (canManagePayment) payload.paymentStatus = payStatus;
      if (canAddNotes) payload.note = note;

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setIsError(true);
        setMessage(data.error || "Update failed.");
        return;
      }

      setNote("");
      setMessage("Order updated successfully.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={save} className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-[#111827]">Status Control</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-black text-[#344054]">Order Status</span>
          <select disabled={!canManageStatus} value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)} className="h-11 w-full rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] disabled:bg-[#f8fafc]">
            {ORDER_STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-black text-[#344054]">Payment Status</span>
          <select disabled={!canManagePayment} value={payStatus} onChange={(event) => setPayStatus(event.target.value)} className="h-11 w-full rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] disabled:bg-[#f8fafc]">
            {PAYMENT_STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}
          </select>
        </label>
      </div>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-black text-[#344054]">Internal Order Note</span>
        <textarea
          disabled={!canAddNotes}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          placeholder="Add private note for the order timeline"
          className="w-full resize-none rounded-xl border border-[#d0d5dd] px-4 py-3 text-sm font-semibold text-[#344054] outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 disabled:bg-[#f8fafc]"
        />
      </label>
      {!canManagePayment && canManageStatus ? (
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
          Limited order access: order status update only.
        </p>
      ) : null}
      <button disabled={!canManageStatus || isPending} className="mt-5 h-11 rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.18)] disabled:cursor-not-allowed disabled:bg-[#98a2b3]">
        {isPending ? "Saving..." : canManageStatus ? "Save Changes" : "Read-only"}
      </button>
      {message ? <p className={`mt-3 text-sm font-bold ${isError ? "text-[#ef3338]" : "text-[#027a48]"}`}>{message}</p> : null}
    </form>
  );
}
