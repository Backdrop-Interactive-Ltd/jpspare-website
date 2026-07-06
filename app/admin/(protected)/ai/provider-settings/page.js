import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";
import { getAiProviderSettingsPlaceholder } from "../../../../../lib/ai/provider-settings";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function formatValue(value, fallback = "Not configured") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function statusBadge(configured) {
  return configured
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : "bg-amber-50 text-amber-700 ring-amber-200";
}

function infoCard(label, value, helper = null) {
  return (
    <div className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">{label}</p>
      <p className="mt-2 text-lg font-black text-[#111827]">{formatValue(value)}</p>
      {helper ? <p className="mt-2 text-xs font-bold text-[#667085]">{helper}</p> : null}
    </div>
  );
}

export default async function AdminAiProviderSettingsPage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">AI Provider Settings</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view AI provider settings.</p>
      </div>
    );
  }

  const settings = getAiProviderSettingsPlaceholder();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">AI Operations</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Provider Settings</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only AI provider configuration placeholder. No provider calls, writes, or secret display are enabled here.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/ai" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              AI Dashboard
            </Link>
            <Link href="/api/admin/ai/provider-settings" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              API Summary
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#111827]">Provider Status</h2>
            <p className="mt-1 text-sm font-semibold text-[#667085]">AI runtime credentials and model settings are not connected yet.</p>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusBadge(settings.configured)}`}>
            {settings.configured ? "Configured" : "Not Configured"}
          </span>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {infoCard("Provider", settings.provider)}
          {infoCard("Default Model", settings.defaultModel)}
          {infoCard("Embedding Model", settings.embeddingModel)}
          {infoCard("Rate Limit", settings.rateLimit, "Placeholder for future provider quota controls.")}
          {infoCard("Monthly Budget", settings.monthlyBudget, "Placeholder for future cost guardrails.")}
          {infoCard("Last Updated", settings.lastUpdated)}
        </div>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-[#111827]">Security Note</h2>
        <p className="mt-3 text-sm font-bold leading-6 text-amber-800">{settings.securityNote}</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-amber-800">
          Future provider setup should follow the existing encrypted credential pattern. API keys must be write-only at creation/update time and never returned by admin APIs.
        </p>
      </section>
    </div>
  );
}
