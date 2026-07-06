import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import { prisma } from "../../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APPROVAL_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

function clean(value) {
  return String(value || "").trim();
}

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/ai/approvals?${next.toString()}`;
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

function label(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status) {
  if (status === "APPROVED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "REJECTED" || status === "CANCELLED") return "bg-red-50 text-[#ef3338] ring-red-100";
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
          : "border-[#eef0f3] bg-[#f8fafc] text-[#111827]";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs font-black uppercase tracking-[0.12em] opacity-70">{cardLabel}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function userLabel(user) {
  return user?.name || user?.email || "Not recorded";
}

export default async function AdminAiApprovalsPage({ searchParams }) {
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
  const requestedById = clean(params.get("requestedBy"));
  const approvedById = clean(params.get("approvedBy"));
  const search = clean(params.get("search"));
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">AI Approval Queue</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view AI approvals.</p>
      </div>
    );
  }

  const where = {
    ...(status && APPROVAL_STATUSES.includes(status) ? { status } : {}),
    ...(requestedById ? { requestedById } : {}),
    ...(approvedById ? { approvedById } : {}),
    ...(agentId ? { action: { task: { agentId } } } : {}),
    ...(search
      ? {
          OR: [
            { id: { contains: search, mode: "insensitive" } },
            { action: { actionType: { contains: search, mode: "insensitive" } } },
            { action: { entityType: { contains: search, mode: "insensitive" } } },
            { action: { entityId: { contains: search, mode: "insensitive" } } },
            { action: { task: { agent: { name: { contains: search, mode: "insensitive" } } } } },
          ],
        }
      : {}),
  };

  const [approvals, total, statusRows, agents, users] = await Promise.all([
    prisma.agentApproval.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
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
                    type: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.agentApproval.count({ where }),
    prisma.agentApproval.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.agent.findMany({ orderBy: [{ name: "asc" }], select: { id: true, name: true, type: true } }),
    prisma.user.findMany({ orderBy: [{ email: "asc" }], select: { id: true, name: true, email: true } }),
  ]);

  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));
  const totalApprovals = Object.values(countsByStatus).reduce((sum, count) => sum + count, 0);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">AI Operations</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Approval Queue</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only approval monitor. Approve, reject, and execute actions are not enabled here.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/ai" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              AI Dashboard
            </Link>
            <Link href="/api/admin/ai/approvals" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              API Summary
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {metricCard("Total Approvals", totalApprovals)}
        {metricCard("Pending", countsByStatus.PENDING || 0, "warning")}
        {metricCard("Approved", countsByStatus.APPROVED || 0, "success")}
        {metricCard("Rejected", countsByStatus.REJECTED || 0, "danger")}
        {metricCard("Cancelled", countsByStatus.CANCELLED || 0, "danger")}
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm xl:grid-cols-[160px_220px_220px_220px_1fr_auto]">
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          {APPROVAL_STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <select name="agent" defaultValue={agentId} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All agents</option>
          {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
        </select>
        <select name="requestedBy" defaultValue={requestedById} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">Any requester</option>
          {users.map((item) => <option key={item.id} value={item.id}>{item.name || item.email}</option>)}
        </select>
        <select name="approvedBy" defaultValue={approvedById} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">Any approver</option>
          {users.map((item) => <option key={item.id} value={item.id}>{item.name || item.email}</option>)}
        </select>
        <input name="search" defaultValue={search} placeholder="Search approval, agent, action, entity" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1280px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Approval ID</th>
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">Action Type</th>
                <th className="px-5 py-4">Entity</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Requested By</th>
                <th className="px-5 py-4">Approved By</th>
                <th className="px-5 py-4">Requested At</th>
                <th className="px-5 py-4">Approved At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {approvals.length ? approvals.map((approval) => {
                const action = approval.action;
                const agent = action?.task?.agent;
                return (
                  <tr key={approval.id} className="align-top hover:bg-[#f8fafc]">
                    <td className="px-5 py-4">
                      <Link href={`/admin/ai/approvals/${approval.id}`} className="font-black text-[#ef3338] hover:underline">{approval.id}</Link>
                    </td>
                    <td className="px-5 py-4 font-bold text-[#344054]">{agent?.name || "Unknown agent"}</td>
                    <td className="px-5 py-4 font-bold text-[#344054]">{label(action?.actionType) || "Unknown action"}</td>
                    <td className="px-5 py-4 font-bold text-[#667085]">{[action?.entityType, action?.entityId].filter(Boolean).join(" · ") || "Not linked"}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(approval.status)}`}>{label(approval.status)}</span></td>
                    <td className="px-5 py-4 font-bold text-[#667085]">{userLabel(approval.requestedBy)}</td>
                    <td className="px-5 py-4 font-bold text-[#667085]">{userLabel(approval.approvedBy)}</td>
                    <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(approval.createdAt)}</td>
                    <td className="px-5 py-4 font-bold text-[#667085]">{formatDate(approval.approvedAt)}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm font-bold text-[#667085]">No AI approvals found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef0f3] px-5 py-4 text-sm font-bold text-[#667085]">
          <span>Page {page} of {totalPages} · {total} approval records</span>
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
