import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";
import { getAiSafetySettingsPlaceholder } from "../../../../../lib/ai/safety-settings";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function boolLabel(value) {
  return value ? "Required" : "Disabled";
}

function statusClass(value) {
  return value ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-[#ef3338] ring-red-100";
}

function disabledClass(value) {
  return value ? "bg-red-50 text-[#ef3338] ring-red-100" : "bg-emerald-50 text-emerald-700 ring-emerald-200";
}

function formatValue(value, fallback = "Not configured") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function policyItem(label, enabled, requiredText = "Required") {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
      <p className="text-sm font-black text-[#111827]">{label}</p>
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(enabled)}`}>
        {enabled ? requiredText : "Not required"}
      </span>
    </div>
  );
}

function limitItem(label, value, helper) {
  return (
    <div className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">{label}</p>
      <p className="mt-2 text-lg font-black text-[#111827]">{formatValue(value)}</p>
      <p className="mt-2 text-xs font-bold text-[#667085]">{helper}</p>
    </div>
  );
}

export default async function AdminAiSafetyPage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">AI Safety Settings</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view AI safety settings.</p>
      </div>
    );
  }

  const settings = getAiSafetySettingsPlaceholder();
  const approvalPolicy = settings.policies.humanApproval;
  const executionPolicy = settings.policies.execution;
  const securityPolicy = settings.policies.security;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">AI Operations</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Safety Settings</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only AI safety foundation. Execution, safety edits, and provider calls are not enabled here.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/ai" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              AI Dashboard
            </Link>
            <Link href="/api/admin/ai/safety" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              API Summary
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-[#ef3338]">
          <p className="text-xs font-black uppercase tracking-[0.12em] opacity-70">Execution</p>
          <p className="mt-2 text-2xl font-black">{settings.executionEnabled ? "Enabled" : "Disabled"}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700">
          <p className="text-xs font-black uppercase tracking-[0.12em] opacity-70">Human Approval</p>
          <p className="mt-2 text-2xl font-black">{boolLabel(settings.humanApprovalRequired)}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-amber-700">
          <p className="text-xs font-black uppercase tracking-[0.12em] opacity-70">Emergency Stop</p>
          <p className="mt-2 text-2xl font-black">{settings.emergencyStop ? "Active" : "Placeholder"}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-700">
          <p className="text-xs font-black uppercase tracking-[0.12em] opacity-70">Read-only Mode</p>
          <p className="mt-2 text-2xl font-black">{settings.readOnlyMode ? "On" : "Off"}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-[#111827]">Human Approval Policy</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {policyItem("Money operations", approvalPolicy.moneyOperations)}
          {policyItem("Inventory mutations", approvalPolicy.inventoryMutations)}
          {policyItem("Customer communication", approvalPolicy.customerCommunication)}
          {policyItem("Pricing changes", approvalPolicy.pricingChanges)}
          {policyItem("Refunds", approvalPolicy.refunds)}
          {policyItem("Order status changes", approvalPolicy.orderStatusChanges)}
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-[#111827]">AI Execution Policy</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Read-only Mode</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(executionPolicy.readOnlyMode)}`}>{executionPolicy.readOnlyMode ? "Enabled" : "Disabled"}</span>
          </div>
          <div className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Execution Mode</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${disabledClass(!executionPolicy.executionMode)}`}>{executionPolicy.executionMode ? "Enabled" : "Disabled"}</span>
          </div>
          <div className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Emergency Stop</p>
            <span className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-200">Placeholder</span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-[#111827]">Rate Limits</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {limitItem("Tasks / Hour", settings.limits.tasksPerHour, "Placeholder for future scheduler controls.")}
          {limitItem("API Budget", settings.limits.apiBudget, "Placeholder for provider API guardrails.")}
          {limitItem("Token Budget", settings.limits.tokenBudget, "Placeholder for token usage ceilings.")}
          {limitItem("Monthly Cost Budget", settings.limits.monthlyCostBudget, "Placeholder for cost controls.")}
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-[#111827]">Security</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {policyItem("Audit logging", securityPolicy.auditLogging, "Enabled")}
          {policyItem("Approval required", securityPolicy.approvalRequired)}
          <div className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Secret Management</p>
            <p className="mt-2 text-sm font-bold text-[#344054]">{securityPolicy.secretManagement}</p>
          </div>
          <div className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Model Access</p>
            <p className="mt-2 text-sm font-bold text-[#344054]">{securityPolicy.modelAccess}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-[#111827]">Safety Notes</h2>
        <ul className="mt-4 space-y-2 text-sm font-bold leading-6 text-amber-800">
          <li>Current system status: {settings.notes.currentSystemStatus}</li>
          <li>AI execution disabled: {settings.notes.aiExecutionDisabled ? "Yes" : "No"}</li>
          <li>Human approval required: {settings.notes.humanApprovalRequired ? "Yes" : "No"}</li>
        </ul>
      </section>
    </div>
  );
}
