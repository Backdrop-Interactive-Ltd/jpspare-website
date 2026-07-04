"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const campaignTypes = ["FLASH_SALE", "EID_CAMPAIGN", "BRAND_CAMPAIGN", "CATEGORY_CAMPAIGN", "FREE_SHIPPING", "BUNDLE_OFFER", "NEW_ARRIVAL", "CLEARANCE", "CUSTOM"];
const campaignStatuses = ["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "ENDED", "ARCHIVED"];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyCampaign() {
  return {
    name: "",
    slug: "",
    type: "CUSTOM",
    status: "DRAFT",
    priority: 0,
    startsAt: "",
    endsAt: "",
    rulesJson: "",
    actionsJson: "",
    bannerImage: "",
    landingPageEnabled: false,
    seoTitle: "",
    seoDescription: "",
  };
}

function dateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function jsonInputValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function normalizeCampaign(campaign) {
  if (!campaign) return emptyCampaign();
  return {
    ...emptyCampaign(),
    ...campaign,
    startsAt: dateInputValue(campaign.startsAt),
    endsAt: dateInputValue(campaign.endsAt),
    rulesJson: jsonInputValue(campaign.rulesJson),
    actionsJson: jsonInputValue(campaign.actionsJson),
    priority: campaign.priority ?? 0,
  };
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

function Toggle({ label, checked, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex h-12 items-center justify-between rounded-xl border px-4 text-sm font-black transition ${
        checked ? "border-red-200 bg-red-50 text-[#ef3338]" : "border-[#d0d5dd] bg-white text-[#344054]"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span>{label}</span>
      <span className={`h-6 w-11 rounded-full p-1 transition ${checked ? "bg-[#ef3338]" : "bg-[#d0d5dd]"}`}>
        <span className={`block size-4 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

function parseJsonField(value, fieldLabel) {
  if (!String(value || "").trim()) return null;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || (typeof parsed !== "object" && !Array.isArray(parsed))) {
      throw new Error(`${fieldLabel} must be a JSON object or array.`);
    }
    return parsed;
  } catch (error) {
    throw new Error(error.message || `${fieldLabel} must be valid JSON.`);
  }
}

function label(value) {
  return String(value || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function prettyJson(value) {
  if (!String(value || "").trim()) return "Not configured";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function campaignAnalytics(campaign) {
  const now = new Date();
  const startsAt = campaign.startsAt ? new Date(campaign.startsAt) : null;
  const endsAt = campaign.endsAt ? new Date(campaign.endsAt) : null;
  const isCurrentlyActive =
    campaign.status === "ACTIVE" &&
    (!startsAt || startsAt <= now) &&
    (!endsAt || endsAt >= now);
  const durationInDays = startsAt && endsAt ? Math.max(1, Math.ceil((endsAt.getTime() - startsAt.getTime()) / 86400000)) : null;
  const timeRemaining = endsAt ? Math.ceil((endsAt.getTime() - now.getTime()) / 86400000) : null;

  return {
    isCurrentlyActive,
    durationInDays,
    timeRemaining,
    homepageEnabled: Boolean(campaign.landingPageEnabled || campaign.bannerImage),
  };
}

function formatRemainingDays(value) {
  if (value === null) return "Open ended";
  if (value < 0) return "Ended";
  if (value === 0) return "Ends today";
  return `${value} day${value === 1 ? "" : "s"} remaining`;
}

function TimelineDot({ active, label: itemLabel }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`grid size-8 place-items-center rounded-full text-xs font-black ${active ? "bg-[#ef3338] text-white" : "bg-[#f2f4f7] text-[#98a2b3]"}`}>
        •
      </span>
      <span className={`text-sm font-black ${active ? "text-[#111827]" : "text-[#98a2b3]"}`}>{itemLabel}</span>
    </div>
  );
}

function CampaignReadOnlySummary({ campaign }) {
  const analytics = campaignAnalytics(campaign);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Campaign Summary</p>
            <h3 className="mt-1 text-2xl font-black text-[#111827]">{campaign.name}</h3>
            <p className="mt-2 text-sm font-bold text-[#667085]">{campaign.slug}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${analytics.isCurrentlyActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-slate-200"}`}>
            {analytics.isCurrentlyActive ? "Live now" : "Not live"}
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Type", label(campaign.type)],
            ["Priority", campaign.priority ?? 0],
            ["Start date", formatDateTime(campaign.startsAt)],
            ["End date", formatDateTime(campaign.endsAt)],
            ["Duration", analytics.durationInDays ? `${analytics.durationInDays} days` : "Open"],
            ["Time remaining", formatRemainingDays(analytics.timeRemaining)],
            ["Homepage Enabled", analytics.homepageEnabled ? "Enabled" : "Off"],
            ["Landing Page", campaign.landingPageEnabled ? "Enabled" : "Off"],
          ].map(([itemLabel, value]) => (
            <div key={itemLabel} className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">{itemLabel}</p>
              <p className="mt-2 text-sm font-black text-[#111827]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-black text-[#111827]">Status Timeline</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <TimelineDot label="Draft" active={campaign.status === "DRAFT"} />
          <TimelineDot label="Scheduled" active={campaign.status === "SCHEDULED"} />
          <TimelineDot label="Active" active={campaign.status === "ACTIVE"} />
          <TimelineDot label="Ended" active={campaign.status === "ENDED" || campaign.status === "ARCHIVED"} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-black text-[#111827]">SEO Preview</h3>
          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">SEO title</dt>
              <dd className="mt-1 text-sm font-bold text-[#111827]">{campaign.seoTitle || "Not configured"}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">SEO description</dt>
              <dd className="mt-1 text-sm font-semibold leading-6 text-[#667085]">{campaign.seoDescription || "Not configured"}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-black text-[#111827]">Rule Data</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">rulesJson</p>
              <pre className="mt-2 max-h-56 overflow-auto rounded-2xl bg-[#111827] p-4 text-xs font-semibold leading-5 text-white">{prettyJson(campaign.rulesJson)}</pre>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">actionsJson</p>
              <pre className="mt-2 max-h-56 overflow-auto rounded-2xl bg-[#111827] p-4 text-xs font-semibold leading-5 text-white">{prettyJson(campaign.actionsJson)}</pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CampaignForm({ mode, campaign, canManage }) {
  const router = useRouter();
  const [form, setForm] = useState(() => normalizeCampaign(campaign));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const readOnly = !canManage;

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setName(value) {
    setForm((current) => ({ ...current, name: value, slug: current.slug ? current.slug : slugify(value) }));
  }

  function payload() {
    return {
      ...form,
      slug: form.slug || slugify(form.name),
      priority: Number.parseInt(form.priority || 0, 10),
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
      rulesJson: parseJsonField(form.rulesJson, "Rules JSON"),
      actionsJson: parseJsonField(form.actionsJson, "Actions JSON"),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(mode === "edit" ? `/api/admin/campaigns/${form.id}` : "/api/admin/campaigns", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to save campaign");
      router.push("/admin/campaigns");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (readOnly || mode !== "edit" || !window.confirm("Delete this campaign?")) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/campaigns/${form.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to delete campaign");
      }
      router.push("/admin/campaigns");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === "edit" ? <CampaignReadOnlySummary campaign={form} /> : null}

      <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">{mode === "edit" ? "Edit Campaign" : "Add Campaign"}</p>
            <h2 className="mt-1 text-2xl font-black text-[#111827]">{mode === "edit" ? form.name : "Create campaign"}</h2>
            {!canManage ? <p className="mt-2 text-sm font-bold text-[#ef3338]">Read-only mode. Your role can view campaigns but cannot save changes.</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push("/admin/campaigns")} className="h-11 rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              Cancel
            </button>
            {mode === "edit" && canManage ? (
              <button type="button" onClick={handleDelete} disabled={saving} className="h-11 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-[#ef3338] disabled:opacity-60">
                Delete
              </button>
            ) : null}
            {canManage ? (
              <button type="submit" disabled={saving} className="h-11 rounded-xl bg-[#ef3338] px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] disabled:opacity-60">
                {saving ? "Saving..." : "Save Campaign"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {message ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[#b42318]">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-black text-[#111827]">Campaign Details</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Name">
              <input value={form.name || ""} onChange={(event) => setName(event.target.value)} disabled={readOnly} className={inputClass(readOnly)} required />
            </Field>
            <Field label="Slug">
              <input value={form.slug || ""} onChange={(event) => setField("slug", slugify(event.target.value))} disabled={readOnly} className={inputClass(readOnly)} required />
            </Field>
            <Field label="Type">
              <select value={form.type || "CUSTOM"} onChange={(event) => setField("type", event.target.value)} disabled={readOnly} className={inputClass(readOnly)}>
                {campaignTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status || "DRAFT"} onChange={(event) => setField("status", event.target.value)} disabled={readOnly} className={inputClass(readOnly)}>
                {campaignStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </Field>
            <Field label="Priority" hint="Higher priority campaigns can be shown first later.">
              <input type="number" min="0" step="1" value={form.priority ?? 0} onChange={(event) => setField("priority", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
            </Field>
            <Field label="Banner image URL">
              <input value={form.bannerImage || ""} onChange={(event) => setField("bannerImage", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} placeholder="/campaign-banner.webp" />
            </Field>
            <Field label="Starts at">
              <input type="datetime-local" value={form.startsAt || ""} onChange={(event) => setField("startsAt", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
            </Field>
            <Field label="Ends at">
              <input type="datetime-local" value={form.endsAt || ""} onChange={(event) => setField("endsAt", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
            </Field>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-[#111827]">Landing Page</h3>
            <div className="mt-5">
              <Toggle label="Enable landing page later" checked={Boolean(form.landingPageEnabled)} disabled={readOnly} onChange={(value) => setField("landingPageEnabled", value)} />
            </div>
            <p className="mt-4 text-xs font-semibold leading-5 text-[#98a2b3]">This flag is stored only. Public campaign pages are not wired in this task.</p>
          </section>
        </aside>
      </div>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-black text-[#111827]">Rules & Actions</h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Field label="Rules JSON" hint='Example: {"categoryIds":["..."],"minSubtotal":5000}'>
            <textarea value={form.rulesJson || ""} onChange={(event) => setField("rulesJson", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} h-56 py-3 font-mono leading-6`} />
          </Field>
          <Field label="Actions JSON" hint='Example: {"badge":"Flash Sale","discountLabel":"10% OFF"}'>
            <textarea value={form.actionsJson || ""} onChange={(event) => setField("actionsJson", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} h-56 py-3 font-mono leading-6`} />
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-black text-[#111827]">SEO</h3>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="SEO title">
            <input value={form.seoTitle || ""} onChange={(event) => setField("seoTitle", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
          </Field>
          <Field label="SEO description">
            <textarea value={form.seoDescription || ""} onChange={(event) => setField("seoDescription", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} h-28 py-3`} />
          </Field>
        </div>
      </section>
    </form>
  );
}
