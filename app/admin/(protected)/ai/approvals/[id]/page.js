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
  if (status === "APPROVED" || status === "COMPLETED" || status === "EXECUTED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "PROPOSED" || status === "RUNNING") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "REJECTED" || status === "CANCELLED" || status === "FAILED") return "bg-red-50 text-[#ef3338] ring-red-100";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function levelClass(level) {
  if (level === "ERROR") return "bg-red-50 text-[#ef3338] ring-red-100";
  if (level === "WARNING") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-blue-50 text-blue-700 ring-blue-200";
}

function userLabel(user) {
  return user?.name || user?.email || "Not recorded";
}

function emptyRow(colSpan, message) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-12 text-center text-sm font-bold text-[#667085]">{message}</td>
    </tr>
  );
}

export default async function AdminAiApprovalDetailPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const { id } = await params;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">AI Approval</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view AI approvals.</p>
      </div>
    );
  }

  const approval = await prisma.agentApproval.findUnique({
    where: { id },
    include: {
      requestedBy: { select: { id: true, name: true, email: true } },
      approvedBy: { select: { id: true, name: true, email: true } },
      action: {
        include: {
          task: {
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
              logs: {
                orderBy: [{ createdAt: "desc" }],
                take: 20,
              },
            },
          },
        },
      },
    },
  });

  if (!approval) notFound();

  const action = approval.action;
  const task = action?.task;
  const agent = task?.agent;
  const logs = task?.logs || [];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">AI Approval</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">{approval.id}</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only approval detail. Approve, reject, execution, and provider calls are not enabled here.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(approval.status)}`}>{label(approval.status)}</span>
            <Link href="/admin/ai/approvals" className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
              Back to Approvals
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#111827]">Approval Overview</h2>
        <dl className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Agent</dt>
            <dd className="mt-1 text-sm font-black text-[#111827]">{agent?.name || "Unknown agent"}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Action Type</dt>
            <dd className="mt-1 text-sm font-black text-[#111827]">{label(action?.actionType) || "Unknown action"}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Entity</dt>
            <dd className="mt-1 text-sm font-black text-[#111827]">{[action?.entityType, action?.entityId].filter(Boolean).join(" · ") || "Not linked"}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Status</dt>
            <dd className="mt-1"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(approval.status)}`}>{label(approval.status)}</span></dd>
          </div>
        </dl>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#111827]">Requested Change</h2>
        <pre className="mt-4 max-h-[420px] overflow-auto rounded-2xl bg-[#111827] p-4 text-xs font-bold leading-6 text-white">{prettyJson(action?.proposedChangeJson)}</pre>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Approval Information</h2>
          <dl className="mt-4 space-y-4 text-sm font-bold text-[#667085]">
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Requested By</dt>
              <dd className="mt-1 text-[#111827]">{userLabel(approval.requestedBy)}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Approved By</dt>
              <dd className="mt-1 text-[#111827]">{userLabel(approval.approvedBy)}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Notes</dt>
              <dd className="mt-1 text-[#111827]">{approval.notes || "No notes recorded."}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Timeline</h2>
          <dl className="mt-4 space-y-4 text-sm font-bold text-[#667085]">
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Created</dt>
              <dd className="mt-1 text-[#111827]">{formatDate(approval.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Approved</dt>
              <dd className="mt-1 text-[#111827]">{formatDate(approval.approvedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Rejected</dt>
              <dd className="mt-1 text-[#111827]">{formatDate(approval.rejectedAt)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#111827]">Related Task</h2>
        {task ? (
          <dl className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Task</dt>
              <dd className="mt-1">
                <Link href={`/admin/ai/tasks/${task.id}`} className="text-sm font-black text-[#ef3338] hover:underline">{task.id}</Link>
              </dd>
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
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No related task found.</p>
        )}
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
              {logs.length ? logs.map((log) => (
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
