import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SETTLEMENT_STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"];
const PAYMENT_METHODS = ["CASH_ON_DELIVERY", "SSLCOMMERZ", "BKASH", "NAGAD", "CARD", "STRIPE", "BANK_TRANSFER"];

function clean(value) {
  return String(value || "").trim();
}

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/finance?${next.toString()}`;
}

function formatDate(value, fallback = "Not recorded") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function money(value) {
  return `৳${Math.round(Number(value || 0)).toLocaleString("en-BD")}`;
}

function label(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status) {
  if (status === "COMPLETED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "PROCESSING" || status === "MATCHED" || status === "PARTIAL") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "FAILED" || status === "CANCELLED") return "bg-red-50 text-[#ef3338] ring-red-100";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function metricCard(cardLabel, value, tone = "default") {
  const toneClass =
    tone === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : tone === "danger"
          ? "border-red-100 bg-red-50 text-[#ef3338]"
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

export default async function AdminFinancePage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const status = clean(params.get("status")).toUpperCase();
  const gateway = clean(params.get("gateway"));
  const paymentMethod = clean(params.get("paymentMethod")).toUpperCase();
  const settlementNumber = clean(params.get("settlementNumber"));
  const runNumber = clean(params.get("runNumber"));
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Finance & Reconciliation</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view finance records.</p>
      </div>
    );
  }

  const settlementWhere = {
    ...(status && SETTLEMENT_STATUSES.includes(status) ? { status } : {}),
    ...(gateway ? { gateway: { contains: gateway, mode: "insensitive" } } : {}),
    ...(paymentMethod && PAYMENT_METHODS.includes(paymentMethod) ? { paymentMethod } : {}),
    ...(settlementNumber ? { settlementNumber: { contains: settlementNumber, mode: "insensitive" } } : {}),
  };
  const reconciliationWhere = {
    ...(gateway ? { gateway: { contains: gateway, mode: "insensitive" } } : {}),
    ...(runNumber ? { runNumber: { contains: runNumber, mode: "insensitive" } } : {}),
  };

  const [
    settlements,
    total,
    statusRows,
    totalAmount,
    totalReconciliationRuns,
    completedReconciliationRuns,
    reconciliationRuns,
  ] = await Promise.all([
    prisma.paymentSettlement.findMany({
      where: settlementWhere,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            lines: true,
          },
        },
      },
    }),
    prisma.paymentSettlement.count({ where: settlementWhere }),
    prisma.paymentSettlement.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.paymentSettlement.aggregate({
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.reconciliationRun.count(),
    prisma.reconciliationRun.count({ where: { status: "COMPLETED" } }),
    prisma.reconciliationRun.findMany({
      where: reconciliationWhere,
      orderBy: [{ createdAt: "desc" }],
      take: 10,
    }),
  ]);

  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));
  const totalSettlements = Object.values(countsByStatus).reduce((sum, count) => sum + count, 0);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Finance & Reconciliation</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Settlements</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only settlement and reconciliation visibility before processing, exports, or payment matching workflows are enabled.</p>
          </div>
          <Link href="/api/admin/finance" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
            API Summary
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCard("Total Settlements", totalSettlements)}
        {metricCard("Pending", countsByStatus.PENDING || 0, "warning")}
        {metricCard("Processing", countsByStatus.PROCESSING || 0, "info")}
        {metricCard("Completed", countsByStatus.COMPLETED || 0, "success")}
        {metricCard("Failed", countsByStatus.FAILED || 0, "danger")}
        {metricCard("Settlement Amount", money(totalAmount._sum.totalAmount))}
        {metricCard("Reconciliation Runs", totalReconciliationRuns, "info")}
        {metricCard("Completed Runs", completedReconciliationRuns, "success")}
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm xl:grid-cols-[180px_1fr_180px_1fr_1fr_auto]">
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All settlement status</option>
          {SETTLEMENT_STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <input name="gateway" defaultValue={gateway} placeholder="Gateway" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="paymentMethod" defaultValue={paymentMethod} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All methods</option>
          {PAYMENT_METHODS.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <input name="settlementNumber" defaultValue={settlementNumber} placeholder="Settlement number" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <input name="runNumber" defaultValue={runNumber} placeholder="Run number" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Settlement Number</th>
                <th className="px-5 py-4">Gateway</th>
                <th className="px-5 py-4">Payment Method</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Total Amount</th>
                <th className="px-5 py-4">Settled At</th>
                <th className="px-5 py-4">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {settlements.length ? settlements.map((settlement) => (
                <tr key={settlement.id} className="align-top hover:bg-[#f8fafc]">
                  <td className="px-5 py-4">
                    <Link href={`/admin/finance/${settlement.id}`} className="font-black text-[#ef3338] hover:underline">
                      {settlement.settlementNumber}
                    </Link>
                    <p className="mt-1 text-xs font-bold text-[#98a2b3]">{settlement._count.lines} lines</p>
                  </td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{settlement.gateway || "Not recorded"}</td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{label(settlement.paymentMethod) || "Not recorded"}</td>
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(settlement.status)}`}>{label(settlement.status)}</span></td>
                  <td className="px-5 py-4 font-black text-[#111827]">{money(settlement.totalAmount)}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(settlement.settledAt)}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(settlement.createdAt)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm font-bold text-[#667085]">No settlements found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef0f3] px-5 py-4 text-sm font-bold text-[#667085]">
          <span>Page {page} of {totalPages} · {total} settlement records</span>
          <div className="flex gap-2">
            <Link href={buildHref(params, { page: Math.max(page - 1, 1) })} className={`rounded-xl border px-4 py-2 ${page <= 1 ? "pointer-events-none border-[#eef0f3] text-[#98a2b3]" : "border-[#d0d5dd] text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]"}`}>
              Previous
            </Link>
            <Link href={buildHref(params, { page: Math.min(page + 1, totalPages) })} className={`rounded-xl border px-4 py-2 ${page >= totalPages ? "pointer-events-none border-[#eef0f3] text-[#98a2b3]" : "border-[#d0d5dd] text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]"}`}>
              Next
            </Link>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Recent Reconciliation Runs</h2>
          <p className="mt-1 text-sm font-semibold text-[#667085]">Read-only run visibility. Matching and reconciliation actions are not enabled here.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Run Number</th>
                <th className="px-5 py-4">Gateway</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Matched</th>
                <th className="px-5 py-4">Unmatched</th>
                <th className="px-5 py-4">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {reconciliationRuns.length ? reconciliationRuns.map((run) => (
                <tr key={run.id} className="hover:bg-[#f8fafc]">
                  <td className="px-5 py-4 font-black text-[#111827]">{run.runNumber}</td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{run.gateway || "Not recorded"}</td>
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(run.status)}`}>{label(run.status)}</span></td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{run.totalTransactions}</td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{run.matchedTransactions}</td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{run.unmatchedTransactions}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(run.startedAt)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm font-bold text-[#667085]">No reconciliation runs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
