import Link from "next/link";
import { notFound } from "next/navigation";
import { CATALOG_READ_ROLES } from "../../../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../../../lib/auth/admin";
import { hasRole } from "../../../../../../lib/auth/rbac";
import { prisma } from "../../../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function formatDate(value, fallback = "Not recorded") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function label(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status) {
  if (status === "ACTIVE" || status === "COMPLETED" || status === "APPROVED" || status === "EXECUTED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "RUNNING" || status === "PROPOSED") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "INACTIVE" || status === "FAILED" || status === "REJECTED" || status === "CANCELLED") return "bg-red-50 text-[#ef3338] ring-red-100";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function activeClass(isActive) {
  return isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-[#ef3338] ring-red-100";
}

function levelClass(level) {
  if (level === "ERROR") return "bg-red-50 text-[#ef3338] ring-red-100";
  if (level === "WARNING") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-blue-50 text-blue-700 ring-blue-200";
}

function prettyJson(value) {
  if (value === null || value === undefined) return "Not configured";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Invalid JSON";
  }
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

function emptyRow(colSpan, message) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-12 text-center text-sm font-bold text-[#667085]">{message}</td>
    </tr>
  );
}

export default async function AdminAiAgentDetailPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const { id } = await params;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">AI Agent</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view AI agents.</p>
      </div>
    );
  }

  const agent = await prisma.agent.findUnique({
    where: { id },
  });

  if (!agent) notFound();

  const [statusRows, recentTasks, recentActions, recentLogs, memory] = await Promise.all([
    prisma.agentTask.groupBy({
      by: ["status"],
      where: { agentId: id },
      _count: { _all: true },
    }),
    prisma.agentTask.findMany({
      where: { agentId: id },
      orderBy: [{ createdAt: "desc" }],
      take: 10,
    }),
    prisma.agentAction.findMany({
      where: {
        task: {
          agentId: id,
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 10,
      include: {
        task: {
          select: {
            id: true,
            taskType: true,
            status: true,
          },
        },
      },
    }),
    prisma.agentLog.findMany({
      where: { agentId: id },
      orderBy: [{ createdAt: "desc" }],
      take: 10,
      include: {
        task: {
          select: {
            id: true,
            taskType: true,
            status: true,
          },
        },
      },
    }),
    prisma.agentMemory.findMany({
      where: { agentId: id },
      orderBy: [{ updatedAt: "desc" }],
      take: 20,
    }),
  ]);

  const taskCounts = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));
  const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">AI Agent</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">{agent.name}</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only agent detail. Execution, edits, approval changes, and provider calls are not enabled here.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(agent.status)}`}>{label(agent.status)}</span>
            <Link href="/admin/ai/agents" className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
              Back to Agents
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {metricCard("Total Tasks", totalTasks)}
        {metricCard("Pending", taskCounts.PENDING || 0, "warning")}
        {metricCard("Running", taskCounts.RUNNING || 0, "info")}
        {metricCard("Completed", taskCounts.COMPLETED || 0, "success")}
        {metricCard("Failed", taskCounts.FAILED || 0, "danger")}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-xl font-black text-[#111827]">Agent Overview</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Name</dt>
              <dd className="mt-1 text-sm font-black text-[#111827]">{agent.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Slug</dt>
              <dd className="mt-1 text-sm font-black text-[#111827]">{agent.slug}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Type</dt>
              <dd className="mt-1 text-sm font-black text-[#111827]">{agent.type}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Status</dt>
              <dd className="mt-1"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(agent.status)}`}>{label(agent.status)}</span></dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Active</dt>
              <dd className="mt-1"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${activeClass(agent.isActive)}`}>{agent.isActive ? "Active" : "Inactive"}</span></dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Created</dt>
              <dd className="mt-1 text-sm font-black text-[#111827]">{formatDate(agent.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Updated</dt>
              <dd className="mt-1 text-sm font-black text-[#111827]">{formatDate(agent.updatedAt)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Description</dt>
              <dd className="mt-1 text-sm font-bold text-[#344054]">{agent.description || "No description recorded."}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Memory Summary</h2>
          <p className="mt-4 text-3xl font-black text-[#ef3338]">{memory.length}</p>
          <p className="mt-1 text-sm font-bold text-[#667085]">Total memory entries loaded</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Configuration</h2>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Config JSON</p>
          <pre className="mt-2 max-h-[320px] overflow-auto rounded-2xl bg-[#111827] p-4 text-xs font-bold leading-6 text-white">{prettyJson(agent.configJson)}</pre>
        </div>
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Permissions</h2>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Permissions JSON</p>
          <pre className="mt-2 max-h-[320px] overflow-auto rounded-2xl bg-[#111827] p-4 text-xs font-bold leading-6 text-white">{prettyJson(agent.permissionsJson)}</pre>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Recent Tasks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Task Type</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Started</th>
                <th className="px-5 py-4">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {recentTasks.length ? recentTasks.map((task) => (
                <tr key={task.id} className="hover:bg-[#f8fafc]">
                  <td className="px-5 py-4 font-black text-[#111827]">{label(task.taskType)}</td>
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(task.status)}`}>{label(task.status)}</span></td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{label(task.priority)}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(task.startedAt)}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(task.completedAt)}</td>
                </tr>
              )) : emptyRow(5, "No recent tasks found.")}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Recent Actions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Action Type</th>
                <th className="px-5 py-4">Entity</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Executed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {recentActions.length ? recentActions.map((action) => (
                <tr key={action.id} className="hover:bg-[#f8fafc]">
                  <td className="px-5 py-4 font-black text-[#111827]">{label(action.actionType)}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{[action.entityType, action.entityId].filter(Boolean).join(" · ") || "Not linked"}</td>
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(action.status)}`}>{label(action.status)}</span></td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(action.executedAt)}</td>
                </tr>
              )) : emptyRow(4, "No recent actions found.")}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Recent Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Level</th>
                <th className="px-5 py-4">Message</th>
                <th className="px-5 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {recentLogs.length ? recentLogs.map((log) => (
                <tr key={log.id} className="align-top hover:bg-[#f8fafc]">
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${levelClass(log.level)}`}>{label(log.level)}</span></td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{log.message}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(log.createdAt)}</td>
                </tr>
              )) : emptyRow(3, "No recent logs found.")}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Memory Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Scope</th>
                <th className="px-5 py-4">Entity</th>
                <th className="px-5 py-4">Expires At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {memory.length ? memory.map((item) => (
                <tr key={item.id} className="hover:bg-[#f8fafc]">
                  <td className="px-5 py-4 font-black text-[#111827]">{item.scope}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{[item.entityType, item.entityId].filter(Boolean).join(" · ") || "Global"}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(item.expiresAt, "No expiry")}</td>
                </tr>
              )) : emptyRow(3, "No memory entries found.")}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
