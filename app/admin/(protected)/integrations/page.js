import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const eventStatuses = ["RECEIVED", "PROCESSING", "SUCCESS", "FAILED", "SKIPPED"];

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/integrations?${next.toString()}`;
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
  if (status === "SUCCESS") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "FAILED") return "bg-red-50 text-[#ef3338] ring-red-100";
  if (status === "PROCESSING") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "SKIPPED") return "bg-slate-50 text-slate-700 ring-slate-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
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

function cleanParam(value) {
  return String(value || "").trim();
}

export default async function AdminIntegrationEventsPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const status = cleanParam(params.get("status"));
  const sourceSystem = cleanParam(params.get("sourceSystem"));
  const eventType = cleanParam(params.get("eventType"));
  const entityType = cleanParam(params.get("entityType"));
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Integration Events</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view integration events.</p>
      </div>
    );
  }

  const where = {
    ...(status && eventStatuses.includes(status) ? { status } : {}),
    ...(sourceSystem ? { sourceSystem: { contains: sourceSystem, mode: "insensitive" } } : {}),
    ...(eventType ? { eventType: { contains: eventType, mode: "insensitive" } } : {}),
    ...(entityType ? { entityType: { contains: entityType, mode: "insensitive" } } : {}),
  };

  const [events, total] = await prisma.$transaction([
    prisma.integrationEventLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.integrationEventLog.count({ where }),
  ]);

  const [statusRows, sourceRows] = await Promise.all([
    prisma.integrationEventLog.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    }),
    prisma.integrationEventLog.groupBy({
      by: ["sourceSystem"],
      where,
      _count: { _all: true },
      orderBy: { _count: { sourceSystem: "desc" } },
      take: 10,
    }),
  ]);
  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));
  const successCount = countsByStatus.SUCCESS || 0;
  const failedCount = countsByStatus.FAILED || 0;
  const processingCount = countsByStatus.PROCESSING || 0;
  const skippedCount = countsByStatus.SKIPPED || 0;
  const receivedCount = countsByStatus.RECEIVED || 0;
  const countedEvents = successCount + failedCount + processingCount + skippedCount + receivedCount;
  const successRate = countedEvents ? Math.round((successCount / countedEvents) * 100) : 0;
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">BMS/API Sync</p>
          <h1 className="mt-1 text-3xl font-black text-[#111827]">Integration Events</h1>
          <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only monitor for integration audit events before idempotency and conflict workflows are enabled.</p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {metricCard("Total events", total)}
        {metricCard("Success", successCount, "success")}
        {metricCard("Failed", failedCount, "danger")}
        {metricCard("Processing", processingCount, "info")}
        {metricCard("Skipped", skippedCount, "warning")}
        {metricCard("Success rate", `${successRate}%`)}
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">Top Source Systems</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {sourceRows.length ? sourceRows.map((row) => (
            <div key={row.sourceSystem || "not-recorded"} className="flex items-center justify-between gap-3 rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4 text-sm font-bold">
              <span className="truncate text-[#344054]">{row.sourceSystem || "Not recorded"}</span>
              <span className="font-black text-[#111827]">{row._count._all}</span>
            </div>
          )) : <p className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4 text-sm font-bold text-[#667085]">No source system data yet.</p>}
        </div>
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm md:grid-cols-[180px_1fr_1fr_1fr_auto]">
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          {eventStatuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <input name="sourceSystem" defaultValue={sourceSystem} placeholder="Source system" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <input name="eventType" defaultValue={eventType} placeholder="Event type" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <input name="entityType" defaultValue={entityType} placeholder="Entity type" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1500px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Direction</th>
                <th className="px-5 py-4">Source</th>
                <th className="px-5 py-4">Target</th>
                <th className="px-5 py-4">Event Type</th>
                <th className="px-5 py-4">Entity Type</th>
                <th className="px-5 py-4">Entity ID</th>
                <th className="px-5 py-4">External ID</th>
                <th className="px-5 py-4">Attempts</th>
                <th className="px-5 py-4">Processed At</th>
                <th className="px-5 py-4">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {events.map((event) => (
                <tr key={event.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(event.status)}`}>{label(event.status)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{event.direction}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#344054]">{event.sourceSystem}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{event.targetSystem || "Not recorded"}</td>
                  <td className="px-5 py-4">
                    <p className="max-w-xs truncate text-sm font-black text-[#111827]">{event.eventType}</p>
                    <p className="mt-1 max-w-xs truncate text-xs font-bold text-[#667085]">{event.requestId || "No request ID"}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#344054]">{event.entityType}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{event.entityId || "Not recorded"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{event.externalId || "Not recorded"}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{event.attempts}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDateTime(event.processedAt, "Not processed")}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDateTime(event.createdAt)}</td>
                </tr>
              ))}
              {!events.length ? (
                <tr>
                  <td colSpan="11" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No integration events found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Events will appear here after BMS/API sync logging is wired.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[#667085]">
          Page <span className="font-black text-[#111827]">{page}</span> of <span className="font-black text-[#111827]">{totalPages}</span> - {total} events
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
