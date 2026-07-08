import Link from "next/link";
import { headers } from "next/headers";
import { INVENTORY_READ_ROLES } from "../../../../../lib/commerce/inventory";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function label(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function percent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0%";
  return `${Math.round(number * 100)}%`;
}

function badgeClass(value) {
  if (value === "CRITICAL") return "bg-red-50 text-[#ef3338] ring-red-100";
  if (value === "HIGH") return "bg-orange-50 text-orange-700 ring-orange-200";
  if (value === "MEDIUM") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (value === "LOW") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (value === "INFO") return "bg-slate-50 text-slate-700 ring-slate-200";
  return "bg-[#f8fafc] text-[#344054] ring-[#e5e7eb]";
}

function metricCard(cardLabel, value, tone = "default") {
  const toneClass =
    tone === "danger"
      ? "border-red-100 bg-red-50 text-[#ef3338]"
      : tone === "warning"
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : tone === "info"
          ? "border-blue-100 bg-blue-50 text-blue-700"
          : "border-[#eef0f3] bg-[#f8fafc] text-[#111827]";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs font-black uppercase tracking-[0.12em] opacity-70">{cardLabel}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function emptyState(message) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-6 text-sm font-bold text-[#667085]">
      {message}
    </div>
  );
}

function emptyRow(colSpan, message) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-12 text-center text-sm font-bold text-[#667085]">
        {message}
      </td>
    </tr>
  );
}

function distributionPanel(title, rows) {
  return (
    <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-[#111827]">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {rows?.length ? rows.map((row) => (
          <span key={row.value} className="inline-flex rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-black text-[#344054] ring-1 ring-[#e5e7eb]">
            {label(row.value)} · {row.count}
          </span>
        )) : <p className="rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No distribution data available.</p>}
      </div>
    </div>
  );
}

function recommendationCard(item) {
  return (
    <div key={item.id} className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${badgeClass(item.severity)}`}>
          {label(item.severity)}
        </span>
        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[#344054] ring-1 ring-[#e5e7eb]">
          {label(item.type)}
        </span>
      </div>
      <p className="mt-3 text-sm font-black text-[#111827]">{item.productName}</p>
      <p className="mt-1 text-xs font-bold text-[#667085]">{item.sku || "No SKU"}</p>
      <p className="mt-3 text-sm font-bold text-[#344054]">{item.title}</p>
      <p className="mt-1 text-sm font-semibold text-[#667085]">{item.message}</p>
    </div>
  );
}

function runAnalysisControl() {
  const script = `
    (() => {
      const button = document.getElementById("inventory-ai-run-button");
      const status = document.getElementById("inventory-ai-run-status");
      const storageKey = "inventory-ai-run-result";
      const pendingMessage = "Running inventory analysis...";

      function setStatus(message, tone) {
        if (!status) return;
        status.textContent = message || "";
        status.className = tone === "error"
          ? "text-sm font-bold text-[#ef3338]"
          : tone === "success"
            ? "text-sm font-bold text-emerald-700"
            : "text-sm font-bold text-[#667085]";
      }

      try {
        const stored = sessionStorage.getItem(storageKey);
        if (stored) {
          sessionStorage.removeItem(storageKey);
          const result = JSON.parse(stored);
          setStatus("Analysis completed. Task " + result.taskId + " created " + result.recommendationCount + " recommendations.", "success");
        }
      } catch {
        sessionStorage.removeItem(storageKey);
      }

      if (!button) return;
      button.addEventListener("click", async () => {
        button.disabled = true;
        button.textContent = pendingMessage;
        setStatus(pendingMessage, "info");

        try {
          const response = await fetch("/api/admin/ai/inventory/run", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({}),
          });
          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            const message = response.status === 401
              ? "Your admin session has expired. Please sign in again."
              : data.error || "Inventory analysis could not be started.";
            throw new Error(message);
          }

          sessionStorage.setItem(storageKey, JSON.stringify({
            taskId: data.taskId || "unknown",
            recommendationCount: data.recommendationCount || 0,
          }));
          window.location.reload();
        } catch (error) {
          button.disabled = false;
          button.textContent = "Run Analysis";
          setStatus(error.message || "Inventory analysis failed safely.", "error");
        }
      });
    })();
  `;

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        id="inventory-ai-run-button"
        type="button"
        className="inline-flex h-11 items-center rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        Run Analysis
      </button>
      <p id="inventory-ai-run-status" className="text-sm font-bold text-[#667085]" aria-live="polite" />
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </div>
  );
}

async function getInventoryAiData(searchParams) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || "http";
  const query = new URLSearchParams();

  for (const key of ["severity", "type", "category", "brand"]) {
    const value = searchParams[key];
    if (typeof value === "string" && value.trim()) query.set(key, value);
  }

  const response = await fetch(`${protocol}://${host}/api/admin/ai/inventory?${query.toString()}`, {
    cache: "no-store",
    headers: {
      cookie: requestHeaders.get("cookie") || "",
    },
  });

  if (!response.ok) {
    return {
      analytics: {},
      recommendations: [],
      grouped: {},
      filters: { severities: [], types: [], categories: [], brands: [], scannedProducts: 0, scanLimit: 100 },
    };
  }

  return response.json();
}

export default async function AdminInventoryAiPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, INVENTORY_READ_ROLES);
  const params = await searchParams;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Inventory AI</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view Inventory AI recommendations.</p>
      </div>
    );
  }

  const data = await getInventoryAiData(params || {});
  const analytics = data.analytics || {};
  const grouped = data.grouped || {};
  const filters = data.filters || {};
  const recommendations = data.recommendations || [];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">AI Operations</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Inventory AI Recommendations</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">
              Read-only recommendation scan across up to {filters.scanLimit || 100} products. No tasks, actions, approvals, AI calls, or inventory mutations are performed.
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-3">
            <Link href="/api/admin/ai/inventory" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              API Summary
            </Link>
            {runAnalysisControl()}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCard("Total Recommendations", analytics.totalRecommendations || 0)}
        {metricCard("Critical", analytics.criticalRecommendations || 0, "danger")}
        {metricCard("High Severity", analytics.highSeverityRecommendations || 0, "warning")}
        {metricCard("Reorder", analytics.reorderRecommendations || 0, "info")}
        {metricCard("Dead Stock", analytics.deadStockWarnings || 0, "warning")}
        {metricCard("Stockout Projections", analytics.stockoutProjections || 0, "danger")}
        {metricCard("Supplier Risks", analytics.supplierRisks || 0, "warning")}
        {metricCard("Scanned Products", filters.scannedProducts || 0)}
        {metricCard("Average Confidence", percent(analytics.averageConfidenceScore || 0), "info")}
        {metricCard("Requires Approval", analytics.recommendationsRequiringApproval || 0, "warning")}
        {metricCard("Pure Warnings", analytics.pureWarningCount || 0)}
        {metricCard("Product Coverage", analytics.productCoverageCount || 0, "info")}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {distributionPanel("Severity Distribution", analytics.severityDistribution || [])}
        {distributionPanel("Recommendation Type Distribution", analytics.recommendationTypeDistribution || [])}
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <form className="grid gap-3 md:grid-cols-4">
          <label className="text-sm font-black text-[#344054]">
            Severity
            <select name="severity" defaultValue={params?.severity || ""} className="mt-2 h-11 w-full rounded-xl border border-[#d0d5dd] bg-white px-3 text-sm font-bold text-[#111827]">
              <option value="">All severities</option>
              {(filters.severities || []).map((severity) => (
                <option key={severity} value={severity}>{label(severity)}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-black text-[#344054]">
            Type
            <select name="type" defaultValue={params?.type || ""} className="mt-2 h-11 w-full rounded-xl border border-[#d0d5dd] bg-white px-3 text-sm font-bold text-[#111827]">
              <option value="">All types</option>
              {(filters.types || []).map((type) => (
                <option key={type} value={type}>{label(type)}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-black text-[#344054]">
            Category
            <select name="category" defaultValue={params?.category || ""} className="mt-2 h-11 w-full rounded-xl border border-[#d0d5dd] bg-white px-3 text-sm font-bold text-[#111827]">
              <option value="">All categories</option>
              {(filters.categories || []).map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-black text-[#344054]">
            Brand
            <select name="brand" defaultValue={params?.brand || ""} className="mt-2 h-11 w-full rounded-xl border border-[#d0d5dd] bg-white px-3 text-sm font-bold text-[#111827]">
              <option value="">All brands</option>
              {(filters.brands || []).map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-3 md:col-span-4">
            <button type="submit" className="inline-flex h-11 items-center rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white">
              Apply Filters
            </button>
            <Link href="/admin/ai/inventory" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Top Critical Risks</h2>
          <div className="mt-4 grid gap-3">
            {(grouped.topCriticalRisks || []).length
              ? grouped.topCriticalRisks.map(recommendationCard)
              : emptyState("No critical risks found in the current scan.")}
          </div>
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Reorder Recommendations</h2>
          <div className="mt-4 grid gap-3">
            {(grouped.reorderRecommendations || []).length
              ? grouped.reorderRecommendations.map(recommendationCard)
              : emptyState("No reorder recommendations found.")}
          </div>
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Dead Stock Warnings</h2>
          <div className="mt-4 grid gap-3">
            {(grouped.deadStockWarnings || []).length
              ? grouped.deadStockWarnings.map(recommendationCard)
              : emptyState("No dead stock warnings found.")}
          </div>
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Supplier Risks</h2>
          <div className="mt-4 grid gap-3">
            {(grouped.supplierRisks || []).length
              ? grouped.supplierRisks.map(recommendationCard)
              : emptyState("No supplier risks found from available supplier data.")}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Recommendations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">SKU</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Severity</th>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Message</th>
                <th className="px-5 py-4">Proposed Action</th>
                <th className="px-5 py-4">Requires Approval</th>
                <th className="px-5 py-4">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {recommendations.length ? recommendations.map((item) => (
                <tr key={item.id} className="align-top hover:bg-[#f8fafc]">
                  <td className="px-5 py-4 font-black text-[#111827]">{item.productName}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{item.sku || "No SKU"}</td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{label(item.type)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${badgeClass(item.severity)}`}>
                      {label(item.severity)}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-[#111827]">{item.title}</td>
                  <td className="px-5 py-4 font-semibold text-[#667085]">{item.message}</td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{item.proposedActionType ? label(item.proposedActionType) : "None"}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{item.requiresApproval ? "Yes" : "No"}</td>
                  <td className="px-5 py-4 font-black text-[#111827]">{percent(item.confidenceScore)}</td>
                </tr>
              )) : emptyRow(9, "No Inventory AI recommendations found for the current filters.")}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
