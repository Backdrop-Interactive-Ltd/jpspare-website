import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { prisma } from "../../../../lib/db";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const deliveryStatuses = ["PENDING", "SENT", "FAILED"];

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/email-delivery-logs?${next.toString()}`;
}

function label(value) {
  return String(value || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value) {
  if (!value) return "Not sent";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not sent";
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusClass(status) {
  if (status === "SENT") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "FAILED") return "bg-red-50 text-[#ef3338] ring-red-100";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function metricCard(label, value, tone = "default") {
  const toneClass =
    tone === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : tone === "danger"
        ? "border-red-100 bg-red-50 text-[#ef3338]"
        : tone === "warning"
          ? "border-amber-100 bg-amber-50 text-amber-700"
          : "border-[#eef0f3] bg-[#f8fafc] text-[#111827]";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs font-black uppercase tracking-[0.12em] opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

export default async function AdminEmailDeliveryLogsPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const status = params.get("status") || "";
  const recipientEmail = params.get("recipientEmail") || "";
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Email Delivery Logs</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view email delivery logs.</p>
      </div>
    );
  }

  const where = {
    ...(status && deliveryStatuses.includes(status) ? { status } : {}),
    ...(recipientEmail ? { recipientEmail: { contains: recipientEmail, mode: "insensitive" } } : {}),
  };

  const [logs, total] = await prisma.$transaction([
    prisma.emailDeliveryLog.findMany({
      where,
      include: { template: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.emailDeliveryLog.count({ where }),
  ]);
  const [statusRows, providerRows] = await Promise.all([
    prisma.emailDeliveryLog.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    }),
    prisma.emailDeliveryLog.groupBy({
      by: ["provider"],
      where,
      _count: { _all: true },
    }),
  ]);
  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));
  const totalSent = countsByStatus.SENT || 0;
  const totalFailed = countsByStatus.FAILED || 0;
  const pendingCount = countsByStatus.PENDING || 0;
  const totalAttempts = totalSent + totalFailed + pendingCount;
  const successPercentage = totalAttempts ? Math.round((totalSent / totalAttempts) * 100) : 0;
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Messaging Audit</p>
          <h1 className="mt-1 text-3xl font-black text-[#111827]">Email Delivery Logs</h1>
          <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only audit trail for future transactional and marketing emails.</p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {metricCard("Total sent", totalSent, "success")}
        {metricCard("Total failed", totalFailed, "danger")}
        {metricCard("Pending", pendingCount, "warning")}
        {metricCard("Success percentage", `${successPercentage}%`)}
        <div className="rounded-2xl border border-[#eef0f3] bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">Provider Breakdown</p>
          <div className="mt-3 space-y-2">
            {providerRows.length ? providerRows.map((row) => (
              <div key={row.provider || "not-recorded"} className="flex items-center justify-between gap-3 text-sm font-bold">
                <span className="truncate text-[#344054]">{row.provider || "Not recorded"}</span>
                <span className="font-black text-[#111827]">{row._count._all}</span>
              </div>
            )) : <p className="text-sm font-bold text-[#667085]">No provider data yet.</p>}
          </div>
        </div>
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
        <input name="recipientEmail" defaultValue={recipientEmail} placeholder="Search recipient email" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          {deliveryStatuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1280px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Recipient</th>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Provider</th>
                <th className="px-5 py-4">Sent At</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {logs.map((log) => (
                <tr key={log.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4">
                    <p className="font-black text-[#111827]">{log.recipientEmail}</p>
                    {log.template ? <p className="mt-1 text-xs font-bold text-[#667085]">Template: {log.template.name}</p> : null}
                  </td>
                  <td className="px-5 py-4">
                    <p className="max-w-sm truncate text-sm font-bold text-[#344054]">{log.subject}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(log.status)}`}>{label(log.status)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{log.provider || "Not recorded"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDateTime(log.sentAt)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDateTime(log.createdAt)}</td>
                  <td className="px-5 py-4">
                    <p className="max-w-xs truncate text-sm font-bold text-[#b42318]">{log.errorMessage || "None"}</p>
                  </td>
                </tr>
              ))}
              {!logs.length ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No delivery logs found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Logs will appear here after future email hooks are wired.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[#667085]">
          Page <span className="font-black text-[#111827]">{page}</span> of <span className="font-black text-[#111827]">{totalPages}</span> • {total} logs
        </p>
        <div className="flex gap-2">
          <Link aria-disabled={page <= 1} href={page <= 1 ? "#" : buildHref(params, { page: page - 1 })} className={`rounded-xl px-4 py-2 text-sm font-black ${page <= 1 ? "pointer-events-none bg-[#f2f4f7] text-[#98a2b3]" : "border border-[#d0d5dd] text-[#344054]"}`}>
            Previous
          </Link>
          <Link aria-disabled={page >= totalPages} href={page >= totalPages ? "#" : buildHref(params, { page: page + 1 })} className={`rounded-xl px-4 py-2 text-sm font-black ${page >= totalPages ? "pointer-events-none bg-[#f2f4f7] text-[#98a2b3]" : "bg-[#ef3338] text-white"}`}>
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
