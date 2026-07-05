import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { prisma } from "../../../../lib/db";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const notificationStatuses = ["PENDING", "SENT", "FAILED", "READ"];
const notificationChannels = ["EMAIL", "SMS", "IN_APP", "PUSH"];

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/notification-logs?${next.toString()}`;
}

function label(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value, fallback = "Not recorded") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusClass(status) {
  if (status === "SENT") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "FAILED") return "bg-red-50 text-[#ef3338] ring-red-100";
  if (status === "READ") return "bg-blue-50 text-blue-700 ring-blue-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function channelClass(channel) {
  if (channel === "EMAIL") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (channel === "SMS") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (channel === "PUSH") return "bg-purple-50 text-purple-700 ring-purple-200";
  return "bg-red-50 text-[#ef3338] ring-red-100";
}

function metricCard(cardLabel, value, tone = "default") {
  const toneClass =
    tone === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : tone === "danger"
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

export default async function AdminNotificationLogsPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const status = params.get("status") || "";
  const channel = params.get("channel") || "";
  const recipient = params.get("recipient") || "";
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Notification Logs</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view notification logs.</p>
      </div>
    );
  }

  const where = {
    ...(status && notificationStatuses.includes(status) ? { status } : {}),
    ...(channel && notificationChannels.includes(channel) ? { channel } : {}),
    ...(recipient ? { recipient: { contains: recipient, mode: "insensitive" } } : {}),
  };

  const [logs, total] = await prisma.$transaction([
    prisma.notificationLog.findMany({
      where,
      include: { template: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notificationLog.count({ where }),
  ]);
  const [statusRows, channelRows, providerRows] = await Promise.all([
    prisma.notificationLog.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    }),
    prisma.notificationLog.groupBy({
      by: ["channel"],
      where,
      _count: { _all: true },
    }),
    prisma.notificationLog.groupBy({
      by: ["provider"],
      where,
      _count: { _all: true },
    }),
  ]);
  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));
  const sentCount = countsByStatus.SENT || 0;
  const failedCount = countsByStatus.FAILED || 0;
  const pendingCount = countsByStatus.PENDING || 0;
  const readCount = countsByStatus.READ || 0;
  const totalAttempts = sentCount + failedCount + pendingCount + readCount;
  const successRate = totalAttempts ? Math.round(((sentCount + readCount) / totalAttempts) * 100) : 0;
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Notification Center</p>
          <h1 className="mt-1 text-3xl font-black text-[#111827]">Notification Logs</h1>
          <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only audit trail for future email, SMS, in-app, and push notifications.</p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {metricCard("Total notifications", total)}
        {metricCard("Sent", sentCount, "success")}
        {metricCard("Failed", failedCount, "danger")}
        {metricCard("Pending", pendingCount, "warning")}
        {metricCard("Read", readCount, "info")}
        {metricCard("Success rate", `${successRate}%`)}
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">Channel Breakdown</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {notificationChannels.map((item) => {
                const row = channelRows.find((entry) => entry.channel === item);
                return (
                  <div key={item} className="flex items-center justify-between gap-3 rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${channelClass(item)}`}>{label(item)}</span>
                    <span className="text-lg font-black text-[#111827]">{row?._count?._all || 0}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">Provider Breakdown</p>
            <div className="mt-3 space-y-2">
              {providerRows.length ? providerRows.map((row) => (
                <div key={row.provider || "not-recorded"} className="flex items-center justify-between gap-3 rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4 text-sm font-bold">
                  <span className="truncate text-[#344054]">{row.provider || "Not recorded"}</span>
                  <span className="font-black text-[#111827]">{row._count._all}</span>
                </div>
              )) : <p className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4 text-sm font-bold text-[#667085]">No provider data yet.</p>}
            </div>
          </div>
        </div>
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_180px_auto]">
        <input name="recipient" defaultValue={recipient} placeholder="Search recipient" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="channel" defaultValue={channel} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All channels</option>
          {notificationChannels.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          {notificationStatuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1400px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Recipient</th>
                <th className="px-5 py-4">Channel</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Template</th>
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
                    <p className="font-black text-[#111827]">{log.recipient}</p>
                    <p className="mt-1 text-xs font-bold text-[#667085]">{log.providerMessageId || "No provider message ID"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${channelClass(log.channel)}`}>{label(log.channel)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(log.status)}`}>{label(log.status)}</span>
                  </td>
                  <td className="px-5 py-4">
                    {log.template ? (
                      <>
                        <p className="max-w-xs truncate text-sm font-black text-[#111827]">{log.template.name}</p>
                        <p className="mt-1 max-w-xs truncate text-xs font-bold text-[#667085]">{log.template.slug}</p>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-[#98a2b3]">No template</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{log.provider || "Not recorded"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDateTime(log.sentAt, "Not sent")}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDateTime(log.createdAt)}</td>
                  <td className="px-5 py-4">
                    <p className="max-w-xs truncate text-sm font-bold text-[#b42318]">{log.errorMessage || "None"}</p>
                  </td>
                </tr>
              ))}
              {!logs.length ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No notification logs found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Logs will appear here after notification send helpers are wired.</p>
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
