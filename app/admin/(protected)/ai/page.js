import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import { prisma } from "../../../../lib/db";

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

function percentage(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function statusClass(status) {
  if (status === "ACTIVE" || status === "COMPLETED" || status === "APPROVED" || status === "EXECUTED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "RUNNING" || status === "PROPOSED") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "FAILED" || status === "REJECTED" || status === "CANCELLED" || status === "INACTIVE") return "bg-red-50 text-[#ef3338] ring-red-100";
  if (status === "PAUSED" || status === "PENDING") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function levelClass(level) {
  if (level === "ERROR") return "bg-red-50 text-[#ef3338] ring-red-100";
  if (level === "WARNING") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-blue-50 text-blue-700 ring-blue-200";
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

export default async function AdminAiOperationsPage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">AI Operations</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view AI operations.</p>
      </div>
    );
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalAgents,
    activeAgents,
    inactiveAgents,
    taskStatusRows,
    pendingApprovals,
    tasksCompletedToday,
    approvalStatusRows,
    agentStatusRows,
    agents,
    recentTasks,
    recentApprovals,
    recentLogs,
    mostActiveAgentRows,
  ] = await Promise.all([
    prisma.agent.count(),
    prisma.agent.count({ where: { status: "ACTIVE", isActive: true } }),
    prisma.agent.count({ where: { OR: [{ status: "INACTIVE" }, { isActive: false }] } }),
    prisma.agentTask.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.agentApproval.count({ where: { status: "PENDING" } }),
    prisma.agentTask.count({
      where: {
        status: "COMPLETED",
        completedAt: { gte: todayStart },
      },
    }),
    prisma.agentApproval.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.agent.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.agent.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: 10,
      include: {
        tasks: {
          orderBy: [{ updatedAt: "desc" }],
          take: 1,
        },
        logs: {
          orderBy: [{ createdAt: "desc" }],
          take: 1,
        },
      },
    }),
    prisma.agentTask.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 10,
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
    prisma.agentApproval.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 10,
      include: {
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        action: {
          include: {
            task: {
              include: {
                agent: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.agentLog.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 10,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
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
    prisma.agentTask.groupBy({
      by: ["agentId"],
      _count: { _all: true },
      orderBy: {
        _count: {
          agentId: "desc",
        },
      },
      take: 5,
    }),
  ]);

  const taskCounts = Object.fromEntries(taskStatusRows.map((row) => [row.status, row._count._all]));
  const approvalCounts = Object.fromEntries(approvalStatusRows.map((row) => [row.status, row._count._all]));
  const agentCounts = Object.fromEntries(agentStatusRows.map((row) => [row.status, row._count._all]));
  const approvalTotal = Object.values(approvalCounts).reduce((sum, count) => sum + count, 0);
  const approvalRate = percentage(approvalCounts.APPROVED || 0, approvalTotal);
  const mostActiveAgentIds = mostActiveAgentRows.map((row) => row.agentId).filter(Boolean);
  const mostActiveAgentRecords = mostActiveAgentIds.length
    ? await prisma.agent.findMany({
        where: { id: { in: mostActiveAgentIds } },
        select: {
          id: true,
          name: true,
          type: true,
        },
      })
    : [];
  const mostActiveAgentById = new Map(mostActiveAgentRecords.map((agent) => [agent.id, agent]));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">AI Operations</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">AI Dashboard</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only agent foundation monitor. No AI calls, task execution, approvals, or mutations are enabled here.</p>
          </div>
          <Link href="/api/admin/ai" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
            API Summary
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCard("Total Agents", totalAgents)}
        {metricCard("Active Agents", activeAgents, "success")}
        {metricCard("Inactive Agents", inactiveAgents, "danger")}
        {metricCard("Pending Tasks", taskCounts.PENDING || 0, "warning")}
        {metricCard("Running Tasks", taskCounts.RUNNING || 0, "info")}
        {metricCard("Completed Tasks", taskCounts.COMPLETED || 0, "success")}
        {metricCard("Failed Tasks", taskCounts.FAILED || 0, "danger")}
        {metricCard("Pending Approvals", pendingApprovals, "warning")}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Analytics</h2>
          <dl className="mt-4 space-y-4 text-sm font-bold text-[#667085]">
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Tasks Completed Today</dt>
              <dd className="mt-1 text-2xl font-black text-[#111827]">{tasksCompletedToday}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Approval Rate</dt>
              <dd className="mt-1 text-2xl font-black text-[#111827]">{approvalRate}%</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Agent Status Distribution</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.keys(agentCounts).length ? Object.entries(agentCounts).map(([status, count]) => (
              <span key={status} className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(status)}`}>{label(status)} · {count}</span>
            )) : <p className="rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No agent status data yet.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Task Status Distribution</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.keys(taskCounts).length ? Object.entries(taskCounts).map(([status, count]) => (
              <span key={status} className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(status)}`}>{label(status)} · {count}</span>
            )) : <p className="rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No task status data yet.</p>}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#111827]">Most Active Agents</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {mostActiveAgentRows.length ? mostActiveAgentRows.map((row) => {
            const agent = mostActiveAgentById.get(row.agentId);
            return (
              <div key={row.agentId} className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
                <p className="text-sm font-black text-[#111827]">{agent?.name || "Unknown agent"}</p>
                <p className="mt-1 text-xs font-bold text-[#667085]">{agent?.type || "Unknown type"}</p>
                <p className="mt-3 text-2xl font-black text-[#ef3338]">{row._count._all}</p>
              </div>
            );
          }) : <p className="rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No agent activity yet.</p>}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Agent Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Last Task</th>
                <th className="px-5 py-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {agents.length ? agents.map((agent) => {
                const lastTask = agent.tasks?.[0] || null;
                const lastLog = agent.logs?.[0] || null;
                const lastActivity = [lastTask?.updatedAt, lastLog?.createdAt, agent.updatedAt]
                  .filter(Boolean)
                  .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
                return (
                  <tr key={agent.id} className="hover:bg-[#f8fafc]">
                    <td className="px-5 py-4 font-black text-[#111827]">{agent.name}</td>
                    <td className="px-5 py-4 font-bold text-[#344054]">{agent.type}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(agent.status)}`}>{label(agent.status)}</span></td>
                    <td className="px-5 py-4 font-bold text-[#667085]">{lastTask ? `${label(lastTask.taskType)} · ${label(lastTask.status)}` : "No task yet"}</td>
                    <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(lastActivity)}</td>
                  </tr>
                );
              }) : emptyRow(5, "No agents found.")}
            </tbody>
          </table>
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
                <th className="px-5 py-4">Agent</th>
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
                  <td className="px-5 py-4 font-black text-[#111827]">{task.agent?.name || "Unknown agent"}</td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{label(task.taskType)}</td>
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(task.status)}`}>{label(task.status)}</span></td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{label(task.priority)}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(task.startedAt)}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(task.completedAt)}</td>
                </tr>
              )) : emptyRow(6, "No recent AI tasks found.")}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Recent Approvals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">Action</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Requested By</th>
                <th className="px-5 py-4">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {recentApprovals.length ? recentApprovals.map((approval) => (
                <tr key={approval.id} className="hover:bg-[#f8fafc]">
                  <td className="px-5 py-4 font-black text-[#111827]">{approval.action?.task?.agent?.name || "Unknown agent"}</td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{label(approval.action?.actionType) || "Unknown action"}</td>
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(approval.status)}`}>{label(approval.status)}</span></td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{approval.requestedBy?.name || approval.requestedBy?.email || "Not recorded"}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{approval.approvedBy?.name || approval.approvedBy?.email || "Not recorded"}</td>
                </tr>
              )) : emptyRow(5, "No recent approvals found.")}
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
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">Level</th>
                <th className="px-5 py-4">Message</th>
                <th className="px-5 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {recentLogs.length ? recentLogs.map((log) => (
                <tr key={log.id} className="align-top hover:bg-[#f8fafc]">
                  <td className="px-5 py-4 font-black text-[#111827]">{log.agent?.name || "Unknown agent"}</td>
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${levelClass(log.level)}`}>{label(log.level)}</span></td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{log.message}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(log.createdAt)}</td>
                </tr>
              )) : emptyRow(4, "No recent AI logs found.")}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
