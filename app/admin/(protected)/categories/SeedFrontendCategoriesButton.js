"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SeedFrontendCategoriesButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleClick() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/categories/seed-frontend", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to import categories");
      setMessage(`${data.count || 0} frontend categories synced.`);
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#ffd6d6] bg-[#fff7f7] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Frontend Category Blueprint</p>
          <p className="mt-1 text-sm font-bold text-[#344054]">Import the current website categories and subcategories into CMS so they can be edited.</p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(17,24,39,0.18)] transition hover:bg-[#ef3338] disabled:opacity-60"
        >
          {loading ? "Importing..." : "Import Frontend Categories"}
        </button>
      </div>
      {message ? <p className="mt-3 text-sm font-black text-[#ef3338]">{message}</p> : null}
    </div>
  );
}
