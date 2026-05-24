"use client";

import { useMemo, useState } from "react";

function formatDate(value) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClass(status) {
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "REVOKED") return "bg-red-50 text-red-700 ring-red-200";
  return "bg-gray-100 text-gray-700 ring-gray-200";
}

function statusLabel(status) {
  return String(status || "INACTIVE")
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

export default function ApiSettingsClient({ initialItems, canManage, adminEmail }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState({ name: "BMS Integration", allowedIps: "", webhookUrl: "" });
  const [oneTimeKey, setOneTimeKey] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const activeCount = useMemo(() => items.filter((item) => item.status === "ACTIVE").length, [items]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function createApiKey(event) {
    event.preventDefault();
    if (!canManage) return;
    setBusy(true);
    setError("");
    setNotice("");
    setOneTimeKey(null);

    const response = await fetch("/api/admin/api-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Could not create API key.");
      setBusy(false);
      return;
    }

    setItems((current) => [data.item, ...current]);
    setOneTimeKey(data.rawKey);
    setNotice(data.warning || "API key created.");
    setForm({ name: "BMS Integration", allowedIps: "", webhookUrl: "" });
    setBusy(false);
  }

  async function updateStatus(id, status) {
    if (!canManage) return;
    setBusy(true);
    setError("");
    setNotice("");

    const response = await fetch(`/api/admin/api-settings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Could not update API key.");
      setBusy(false);
      return;
    }

    setItems((current) => current.map((item) => (item.id === id ? data.item : item)));
    setNotice(status === "REVOKED" ? "API key revoked." : "API key updated.");
    setBusy(false);
  }

  async function copyRawKey() {
    if (!oneTimeKey) return;
    await navigator.clipboard.writeText(oneTimeKey);
    setNotice("API key copied to clipboard.");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ef3338]">Integration</p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#111827]">API Settings</h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#667085]">
              Generate and manage secure API keys for future BMS, ERP, and inventory sync integrations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex h-11 items-center rounded-xl bg-red-50 px-4 text-sm font-black text-[#ef3338] ring-1 ring-red-100">
              {activeCount} active
            </span>
            <span className="inline-flex h-11 items-center rounded-xl bg-[#111827] px-4 text-sm font-black text-white">
              {canManage ? "SUPER_ADMIN access" : "Read only"}
            </span>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">{error}</div>
      ) : null}
      {notice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">{notice}</div>
      ) : null}

      {oneTimeKey ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-black text-amber-900">Copy this key now. You will not be able to see it again.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              readOnly
              value={oneTimeKey}
              className="h-12 flex-1 rounded-xl border border-amber-200 bg-white px-4 font-mono text-xs font-bold text-[#111827] outline-none"
            />
            <button
              type="button"
              onClick={copyRawKey}
              className="h-12 rounded-xl bg-[#111827] px-5 text-sm font-black text-white transition hover:bg-[#ef3338]"
            >
              Copy key
            </button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.35fr]">
        <form onSubmit={createApiKey} className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-xl font-black text-[#111827]">Generate API Key</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">
              Only the key prefix and SHA-256 hash are stored. The raw key is shown once after creation.
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-black text-[#344054]">Key name</span>
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                disabled={!canManage}
                className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 disabled:bg-[#f3f4f6]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-black text-[#344054]">Allowed IPs</span>
              <textarea
                value={form.allowedIps}
                onChange={(event) => updateForm("allowedIps", event.target.value)}
                disabled={!canManage}
                placeholder="Optional, comma separated"
                className="mt-2 min-h-24 w-full rounded-xl border border-[#d0d5dd] px-4 py-3 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 disabled:bg-[#f3f4f6]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-black text-[#344054]">Webhook URL</span>
              <input
                value={form.webhookUrl}
                onChange={(event) => updateForm("webhookUrl", event.target.value)}
                disabled={!canManage}
                placeholder="https://bms.example.com/webhooks/jpspare"
                className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 disabled:bg-[#f3f4f6]"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={!canManage || busy}
            className="mt-5 h-12 w-full rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] transition hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:bg-[#d0d5dd]"
          >
            {busy ? "Working..." : "Generate API Key"}
          </button>
          {!canManage ? <p className="mt-3 text-xs font-bold text-[#667085]">Only SUPER_ADMIN can create or revoke API keys.</p> : null}
        </form>

        <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
          <div className="border-b border-[#eef0f3] px-5 py-4 sm:px-6">
            <h2 className="text-xl font-black text-[#111827]">Existing API Keys</h2>
            <p className="mt-1 text-sm font-semibold text-[#667085]">Signed in as {adminEmail}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-left">
              <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Key</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4">Last Used</th>
                  <th className="px-5 py-4">Created By</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f3]">
                {items.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-black text-[#111827]">{item.name}</p>
                      {item.webhookUrl ? <p className="mt-1 max-w-[220px] truncate text-xs font-bold text-[#667085]">{item.webhookUrl}</p> : null}
                      {item.allowedIps ? <p className="mt-1 max-w-[220px] truncate text-xs font-bold text-[#98a2b3]">IPs: {item.allowedIps}</p> : null}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-[#344054]">{item.maskedKey}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(item.status)}`}>
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-[#344054]">{formatDate(item.createdAt)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#344054]">{formatDate(item.lastUsedAt)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#344054]">
                      {item.createdBy?.name || item.createdBy?.email || "System"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {item.status !== "REVOKED" ? (
                        <button
                          type="button"
                          onClick={() => updateStatus(item.id, "REVOKED")}
                          disabled={!canManage || busy}
                          className="h-10 rounded-xl border border-red-200 px-4 text-sm font-black text-[#ef3338] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-[#d0d5dd] disabled:text-[#98a2b3]"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-sm font-bold text-[#98a2b3]">Revoked</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!items.length ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center">
                      <p className="text-lg font-black text-[#111827]">No API keys yet</p>
                      <p className="mt-2 text-sm font-semibold text-[#667085]">Generate the first key when the BMS integration is ready.</p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  );
}
