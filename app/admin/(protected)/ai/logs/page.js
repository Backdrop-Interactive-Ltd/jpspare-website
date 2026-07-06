import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import { prisma } from "../../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LOG_LEVELS = ["INFO", "WARNING", "ERROR"];

function clean(value) {
  return String(value || "").trim();
}

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/ai/logs?${next.toString()}`;
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

function parseDate(value) {
  const cleanValue = clean(value);
  if (!cleanValue) return null;
  const date = new Date(cleanValue);
  return Number.isNaN(date.getTime()) ? null : date;
}

function label(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function levelClass(level) {
  if (level === "ERROR") return "bg-red-50 text-[#ef3338] ring-red-100";
  if (level === "WARNING") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-blue-50 text-blue-700 ring-blue-200";
}

function metadataPreview(metadataJson) {
  if (metadataJson === null || metadataJson === undefined) return "No metadata";
  try {
    return JSON.stringify(metadataJson).slice(0, 180);
  } catch {
    return "Unserializable metadata";
  }
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

export default async function AdminAiLogsPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const level = clean(params.get("level")).toUpperCase();
  const agentId = clean(params.get("agent"));
  const taskId = clean(params.get("task"));
  const dateFromValue = clean(params.get("dateFrom"));
  const dateToValue = clean(params.get("dateTo"));
  const dateFrom = parseDate(dateFromValue);
  const dateTo = parseDate(dateToValue);
  const search = clean(params.get("search"));
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">AI Agent Logs</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view AI logs.</p>
      </div>
    );
  }

  const where = {
    ...(level && LOG_LEVELS.includes(level) ? { level } : {}),
    ...(agentId ? { agentId } : {}),
    ...(taskId ? { taskId } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { message: { contains: search, mode: "insensitive" } },
            { taskId: { contains: search, mode: "insensitive" } },
            { agent: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [logs, total, levelRows, logsToday, agents, tasks] = await Promise.all([
    prisma.agentLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
        task: {
          select: {
            id: true,
            taskType: true,
            status: true,
          },
        },
      },
    }),
    prisma.agentLog.count({ where }),
    prisma.agentLog.groupBy({ by: ["level"], _count: { _all: true } }),
    prisma.agentLog.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.agent.findMany({ orderBy: [{ name: "asc" }], select: { id: true, name: true, type: true } }),
    prisma.agentTask.findMany({ orderBy: [{ createdAt: "desc" }], take: 100, select: { id: true, taskType: true } }),
  ]);

  const countsByLevel = Object.fromEntries(levelRows.map((row) => [row.level, row._count._all]));
  const totalLogs = Object.values(countsByLevel).reduce((sum, count) => sum + count, 0);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">AI Operations</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Agent Logs</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only centralized logs. Log creation, task execution, approvals, and provider calls are not enabled here.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/ai" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              AI Dashboard
            </Link>
            <Link href="/api/admin/ai/logs" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              API Summary
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {metricCard("Total Logs", totalLogs)}
        {metricCard("Info", countsByLevel.INFO || 0, "info")}
        {metricCard("Warnings", countsByLevel.WARNING || 0, "warning")}
        {metricCard("Errors", countsByLevel.ERROR || 0, "danger")}
        {metricCard("Logs Today", logsToday)}
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm xl:grid-cols-[150px_220px_220px_160px_160px_1fr_auto]">
        <select name="level" defaultValue={level} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All levels</option>
          {LOG_LEVELS.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <select name="agent" defaultValue={agentId} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All agents</option>
          {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
        </select>
        <select name="task" defaultValue={taskId} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All tasks</option>
          {tasks.map((task) => <option key={task.id} value={task.id}>{task.taskType} · {task.id.slice(0, 8)}</option>)}
        </select>
        <input type="date" name="dateFrom" defaultValue={dateFromValue} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]" />
        <input type="date" name="dateTo" defaultValue={dateToValue} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]" />
        <input name="search" defaultValue={search} placeholder="Search message, agent, task ID" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Level</th>
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">Task</th>
                <th className="px-5 py-4">Message</th>
                <th className="px-5 py-4">Metadata Preview</th>
                <th className="px-5 py-4">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {logs.length ? logs.map((log) => (
                <tr key={log.id} className="align-top hover:bg-[#f8fafc]">
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${levelClass(log.level)}`}>{label(log.level)}</span></td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{log.agent?.name || "Unknown agent"}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{log.task ? `${label(log.task.taskType)} · ${log.task.id.slice(0, 8)}` : "No task linked"}</td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{log.message}</td>
                  <td className="px-5 py-4 font-mono text-xs font-bold text-[#667085]">{metadataPreview(log.metadataJson)}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(log.createdAt)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm font-bold text-[#667085]">No AI logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef0f3] px-5 py-4 text-sm font-bold text-[#667085]">
          <span>Page {page} of {totalPages} · {total} log records</span>
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
    </div>
  );
}
