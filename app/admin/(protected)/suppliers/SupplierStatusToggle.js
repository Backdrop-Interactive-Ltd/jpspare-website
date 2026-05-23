"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function statusClass(status) {
  return status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-gray-100 text-gray-600 ring-gray-200";
}

function toggleLabel(status) {
  return status === "ACTIVE" ? "Deactivate" : "Activate";
}

export default function SupplierStatusToggle({ supplier, canManage }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const nextStatus = supplier.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  async function handleToggle() {
    if (!canManage || saving) return;
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/suppliers/${supplier.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: supplier.name,
          companyName: supplier.companyName,
          contactPerson: supplier.contactPerson,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          notes: supplier.notes,
          status: nextStatus,
          externalId: supplier.externalId,
          source: supplier.source || "LOCAL",
          syncStatus: supplier.syncStatus || "LOCAL",
          lastSyncedAt: supplier.lastSyncedAt,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update supplier status.");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(supplier.status)}`}>{supplier.status}</span>
      {canManage ? (
        <button
          type="button"
          onClick={handleToggle}
          disabled={saving}
          className="rounded-lg border border-[#d0d5dd] bg-white px-3 py-1.5 text-xs font-black text-[#344054] transition hover:border-[#ef3338] hover:text-[#ef3338] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Updating..." : toggleLabel(supplier.status)}
        </button>
      ) : null}
      {error ? <span className="max-w-[160px] text-xs font-bold text-[#ef3338]">{error}</span> : null}
    </div>
  );
}
