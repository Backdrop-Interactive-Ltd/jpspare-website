import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import { prisma } from "../../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TASK_STATUSES = ["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"];

function clean(value) {
  return String(value || "").trim();
}

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/ai/tasks?${next.toString()}`;
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

function formatDuration(startedAt, completedAt) {
  if (!startedAt || !completedAt) return "Not available";
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return "Not available";
  const seconds = Math.round((end - start) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function label(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status) {
  if (status === "COMPLETED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "RUNNING") return "bg-blue-50 text-blue-700 ring-blue-200";
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

export default async function AdminAiTasksPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const status = clean(params.get("status")).toUpperCase();
  const agentId = clean(params.get("agent"));
  const priority = clean(params.get("priority"));
  const taskType = clean(params.get("taskType"));
  const search = clean(params.get("search"));
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">AI Task Queue</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view AI tasks.</p>
      </div>
    );
  }

  const where = {
    ...(status && TASK_STATUSES.includes(status) ? { status } : {}),
    ...(agentId ? { agentId } : {}),
    ...(priority ? { priority: { equals: priority, mode: "insensitive" } } : {}),
    ...(taskType ? { taskType: { contains: taskType, mode: "insensitive" } } : {}),
    ...(search
      ? {
          OR: [
            { id: { contains: search, mode: "insensitive" } },
            { taskType: { contains: search, mode: "insensitive" } },
            { agent: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [tasks, total, statusRows, agents] = await Promise.all([
    prisma.agentTask.findMany({
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
      },
    }),
    prisma.agentTask.count({ where }),
    prisma.agentTask.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.agent.findMany({
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        type: true,
      },
    }),
  ]);

  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));
  const totalTasks = Object.values(countsByStatus).reduce((sum, count) => sum + count, 0);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">AI Operations</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Task Queue</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only AI task queue. Execution, retries, cancellations, status changes, and provider calls are not enabled here.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/ai" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              AI Dashboard
            </Link>
            <Link href="/api/admin/ai/tasks" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              API Summary
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {metricCard("Total Tasks", totalTasks)}
        {metricCard("Pending", countsByStatus.PENDING || 0, "warning")}
        {metricCard("Running", countsByStatus.RUNNING || 0, "info")}
        {metricCard("Completed", countsByStatus.COMPLETED || 0, "success")}
        {metricCard("Failed", countsByStatus.FAILED || 0, "danger")}
        {metricCard("Cancelled", countsByStatus.CANCELLED || 0, "danger")}
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm xl:grid-cols-[160px_220px_160px_1fr_1fr_auto]">
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          {TASK_STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <select name="agent" defaultValue={agentId} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All agents</option>
          {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
        </select>
        <input name="priority" defaultValue={priority} placeholder="Priority" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <input name="taskType" defaultValue={taskType} placeholder="Task type" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <input name="search" defaultValue={search} placeholder="Search task ID, agent, type" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1280px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Task ID</th>
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">Task Type</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Scheduled For</th>
                <th className="px-5 py-4">Started At</th>
                <th className="px-5 py-4">Completed At</th>
                <th className="px-5 py-4">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {tasks.length ? tasks.map((task) => (
                <tr key={task.id} className="align-top hover:bg-[#f8fafc]">
                  <td className="px-5 py-4">
                    <Link href={`/admin/ai/tasks/${task.id}`} className="font-black text-[#ef3338] hover:underline">{task.id}</Link>
                  </td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{task.agent?.name || "Unknown agent"}</td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{label(task.taskType)}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{label(task.priority)}</td>
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(task.status)}`}>{label(task.status)}</span></td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(task.scheduledFor)}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(task.startedAt)}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(task.completedAt)}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDuration(task.startedAt, task.completedAt)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm font-bold text-[#667085]">No AI tasks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef0f3] px-5 py-4 text-sm font-bold text-[#667085]">
          <span>Page {page} of {totalPages} · {total} task records</span>
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
