import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import { prisma } from "../../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AGENT_STATUSES = ["ACTIVE", "INACTIVE", "PAUSED"];

function clean(value) {
  return String(value || "").trim();
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
  if (status === "ACTIVE" || status === "COMPLETED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "RUNNING") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "INACTIVE" || status === "FAILED" || status === "CANCELLED") return "bg-red-50 text-[#ef3338] ring-red-100";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function activeClass(isActive) {
  return isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-[#ef3338] ring-red-100";
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

export default async function AdminAiAgentsPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const status = clean(params.get("status")).toUpperCase();
  const type = clean(params.get("type"));
  const active = clean(params.get("active")).toLowerCase();
  const search = clean(params.get("search"));

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">AI Agents</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view AI agents.</p>
      </div>
    );
  }

  const where = {
    ...(status && AGENT_STATUSES.includes(status) ? { status } : {}),
    ...(type ? { type: { contains: type, mode: "insensitive" } } : {}),
    ...(active === "true" ? { isActive: true } : {}),
    ...(active === "false" ? { isActive: false } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { type: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [agents, total, activeCount, pausedCount, inactiveCount] = await Promise.all([
    prisma.agent.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      take: 100,
      include: {
        tasks: {
          orderBy: [{ updatedAt: "desc" }],
          take: 1,
        },
        logs: {
          orderBy: [{ createdAt: "desc" }],
          take: 1,
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    }),
    prisma.agent.count(),
    prisma.agent.count({ where: { status: "ACTIVE", isActive: true } }),
    prisma.agent.count({ where: { status: "PAUSED" } }),
    prisma.agent.count({ where: { OR: [{ status: "INACTIVE" }, { isActive: false }] } }),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">AI Operations</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">AI Agents</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only agent registry. Agent creation, editing, task execution, and AI calls are not enabled here.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/ai" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              AI Dashboard
            </Link>
            <Link href="/api/admin/ai/agents" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              API Summary
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCard("Total Agents", total)}
        {metricCard("Active", activeCount, "success")}
        {metricCard("Paused", pausedCount, "warning")}
        {metricCard("Inactive", inactiveCount, "danger")}
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm xl:grid-cols-[180px_1fr_160px_1fr_auto]">
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          {AGENT_STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <input name="type" defaultValue={type} placeholder="Type" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="active" defaultValue={active} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">Any active flag</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <input name="search" defaultValue={search} placeholder="Search name, slug, type" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Active</th>
                <th className="px-5 py-4">Task Count</th>
                <th className="px-5 py-4">Latest Task</th>
                <th className="px-5 py-4">Latest Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {agents.length ? agents.map((agent) => {
                const latestTask = agent.tasks?.[0] || null;
                const latestLog = agent.logs?.[0] || null;
                return (
                  <tr key={agent.id} className="align-top hover:bg-[#f8fafc]">
                    <td className="px-5 py-4">
                      <p className="font-black text-[#111827]">{agent.name}</p>
                      <p className="mt-1 text-xs font-bold text-[#98a2b3]">{agent.slug}</p>
                    </td>
                    <td className="px-5 py-4 font-bold text-[#344054]">{agent.type}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(agent.status)}`}>{label(agent.status)}</span></td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${activeClass(agent.isActive)}`}>{agent.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="px-5 py-4 font-black text-[#111827]">{agent._count.tasks}</td>
                    <td className="px-5 py-4 font-bold text-[#667085]">
                      {latestTask ? (
                        <>
                          <p className="text-[#111827]">{label(latestTask.taskType)}</p>
                          <p className="mt-1 text-xs">{label(latestTask.status)} · {formatDate(latestTask.updatedAt)}</p>
                        </>
                      ) : "No task yet"}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#667085]">
                      {latestLog ? (
                        <>
                          <p className="max-w-[320px] truncate text-[#111827]">{latestLog.message}</p>
                          <p className="mt-1 text-xs">{label(latestLog.level)} · {formatDate(latestLog.createdAt)}</p>
                        </>
                      ) : "No log yet"}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm font-bold text-[#667085]">No AI agents found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
