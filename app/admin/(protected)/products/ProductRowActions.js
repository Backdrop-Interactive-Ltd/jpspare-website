"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductRowActions({ productId, canManage, archived = false }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const disabled = Boolean(busy);

  async function runAction(action) {
    if (!canManage || disabled) return;
    const permanent = action === "permanent";
    if (permanent && !window.confirm("Permanently delete this product? This cannot be undone.")) return;
    if (action === "archive" && !window.confirm("Move this product to trash?")) return;

    setBusy(action);
    try {
      const response =
        action === "permanent"
          ? await fetch(`/api/admin/products/${productId}?permanent=true`, { method: "DELETE" })
          : await fetch(`/api/admin/products/${productId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action }),
            });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to update product");
      }
      router.refresh();
    } catch (error) {
      window.alert(error.message);
    } finally {
      setBusy("");
    }
  }

  if (!canManage) {
    return (
      <Link href={`/admin/products/${productId}`} className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
        View
      </Link>
    );
  }

  if (archived) {
    return (
      <div className="flex justify-end gap-2">
        <button type="button" disabled={disabled} onClick={() => runAction("restore")} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-black text-emerald-700 hover:bg-emerald-50 disabled:opacity-60">
          {busy === "restore" ? "Restoring..." : "Restore"}
        </button>
        <button type="button" disabled={disabled} onClick={() => runAction("permanent")} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-black text-[#ef3338] hover:bg-red-50 disabled:opacity-60">
          {busy === "permanent" ? "Deleting..." : "Permanently Delete"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <Link href={`/admin/products/${productId}`} className="rounded-xl border border-[#d0d5dd] px-3 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
        Edit
      </Link>
      <button type="button" disabled={disabled} onClick={() => runAction("archive")} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-black text-[#ef3338] hover:bg-red-50 disabled:opacity-60">
        {busy === "archive" ? "Archiving..." : "Archive"}
      </button>
    </div>
  );
}
