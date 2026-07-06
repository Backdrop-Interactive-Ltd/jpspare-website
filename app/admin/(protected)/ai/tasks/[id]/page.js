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

function prettyJson(value) {
  if (value === null || value === undefined) return "Not recorded";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Invalid JSON";
  }
}

function statusClass(status) {
  if (status === "COMPLETED" || status === "EXECUTED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "RUNNING" || status === "PROPOSED") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "FAILED" || status === "CANCELLED" || status === "REJECTED") return "bg-red-50 text-[#ef3338] ring-red-100";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function levelClass(level) {
  if (level === "ERROR") return "bg-red-50 text-[#ef3338] ring-red-100";
  if (level === "WARNING") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-blue-50 text-blue-700 ring-blue-200";
}

function emptyRow(colSpan, message) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-12 text-center text-sm font-bold text-[#667085]">{message}</td>
    </tr>
  );
}

export default async function AdminAiTaskDetailPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const { id } = await params;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">AI Task</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view AI tasks.</p>
      </div>
    );
  }

  const task = await prisma.agentTask.findUnique({
    where: { id },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          status: true,
        },
      },
      actions: {
        orderBy: [{ createdAt: "desc" }],
        take: 20,
      },
      logs: {
        orderBy: [{ createdAt: "desc" }],
        take: 20,
      },
    },
  });

  if (!task) notFound();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">AI Task</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">{label(task.taskType)}</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only task detail. Execution, retries, cancellation, and status mutation are not enabled here.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(task.status)}`}>{label(task.status)}</span>
            <Link href="/admin/ai/tasks" className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
              Back to Tasks
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#111827]">Task Overview</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Agent</dt>
            <dd className="mt-1 text-sm font-black text-[#111827]">{task.agent?.name || "Unknown agent"}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Task Type</dt>
            <dd className="mt-1 text-sm font-black text-[#111827]">{label(task.taskType)}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Priority</dt>
            <dd className="mt-1 text-sm font-black text-[#111827]">{label(task.priority)}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Status</dt>
            <dd className="mt-1"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(task.status)}`}>{label(task.status)}</span></dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Input</h2>
          <pre className="mt-4 max-h-[360px] overflow-auto rounded-2xl bg-[#111827] p-4 text-xs font-bold leading-6 text-white">{prettyJson(task.inputJson)}</pre>
        </div>
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Output</h2>
          <pre className="mt-4 max-h-[360px] overflow-auto rounded-2xl bg-[#111827] p-4 text-xs font-bold leading-6 text-white">{prettyJson(task.outputJson)}</pre>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#111827]">Error</h2>
        <p className="mt-4 rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">{task.errorMessage || "No error recorded."}</p>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#111827]">Timeline</h2>
        <dl className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Scheduled</dt>
            <dd className="mt-2 text-sm font-black text-[#111827]">{formatDate(task.scheduledFor)}</dd>
          </div>
          <div className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Started</dt>
            <dd className="mt-2 text-sm font-black text-[#111827]">{formatDate(task.startedAt)}</dd>
          </div>
          <div className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Completed</dt>
            <dd className="mt-2 text-sm font-black text-[#111827]">{formatDate(task.completedAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Related Actions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Action Type</th>
                <th className="px-5 py-4">Entity</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {task.actions.length ? task.actions.map((action) => (
                <tr key={action.id} className="hover:bg-[#f8fafc]">
                  <td className="px-5 py-4 font-black text-[#111827]">{label(action.actionType)}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{[action.entityType, action.entityId].filter(Boolean).join(" · ") || "Not linked"}</td>
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(action.status)}`}>{label(action.status)}</span></td>
                </tr>
              )) : emptyRow(3, "No related actions found.")}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Related Logs</h2>
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
              {task.logs.length ? task.logs.map((log) => (
                <tr key={log.id} className="align-top hover:bg-[#f8fafc]">
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${levelClass(log.level)}`}>{label(log.level)}</span></td>
                  <td className="px-5 py-4 font-bold text-[#344054]">{log.message}</td>
                  <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(log.createdAt)}</td>
                </tr>
              )) : emptyRow(3, "No related logs found.")}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
