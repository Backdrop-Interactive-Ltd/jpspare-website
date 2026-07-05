import Link from "next/link";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import { prisma } from "../../../../lib/db";
import { getCustomerSegmentListAnalytics } from "../../../../lib/customer-segments/analytics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/customer-segments?${next.toString()}`;
}

function statusClass(isActive) {
  return isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-slate-200";
}

function formatDateTime(value) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminCustomerSegmentsPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const query = params.get("q") || "";
  const active = params.get("active") || "";
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Customer Segments</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view customer segments.</p>
      </div>
    );
  }

  const where = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(active === "true" ? { isActive: true } : {}),
    ...(active === "false" ? { isActive: false } : {}),
  };

  const [segments, total] = await prisma.$transaction([
    prisma.customerSegment.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.customerSegment.count({ where }),
  ]);
  const analytics = await getCustomerSegmentListAnalytics(segments);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Audience CMS</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Customer Segments</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Store saved audience rules before preview, evaluation, and targeting are wired.</p>
          </div>
          {canManage ? (
            <Link href="/admin/customer-segments/new" className="inline-flex h-11 items-center rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)]">
              Add Segment
            </Link>
          ) : (
            <span className="inline-flex h-11 items-center rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-black text-amber-700">Read-only</span>
          )}
        </div>
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
        <input name="q" defaultValue={query} placeholder="Search segment name or slug" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="active" defaultValue={active} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1240px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Segment</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Matched</th>
                <th className="px-5 py-4">Rules</th>
                <th className="px-5 py-4">Campaigns</th>
                <th className="px-5 py-4">Last Evaluated</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {segments.map((segment) => {
                const rowAnalytics = analytics.get(segment.id) || {};

                return (
                  <tr key={segment.id} className="transition hover:bg-red-50/40">
                    <td className="px-5 py-4">
                      <Link href={`/admin/customer-segments/${segment.id}`} className="font-black text-[#111827] hover:text-[#ef3338]">{segment.name}</Link>
                      <p className="mt-1 max-w-sm truncate text-xs font-bold text-[#667085]">{segment.slug}</p>
                      {segment.description ? <p className="mt-1 max-w-lg truncate text-xs font-semibold text-[#98a2b3]">{segment.description}</p> : null}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(segment.isActive)}`}>{segment.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-[#111827]">{rowAnalytics.matchedCustomers ?? 0}</td>
                    <td className="px-5 py-4 text-sm font-black text-[#111827]">{rowAnalytics.rulesCount ?? 0}</td>
                    <td className="px-5 py-4 text-sm font-black text-[#111827]">{rowAnalytics.targetedCampaigns ?? 0}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDateTime(segment.lastEvaluatedAt)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDateTime(segment.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/customer-segments/${segment.id}`} className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                        {canManage ? "Edit" : "View"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {!segments.length ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No customer segments found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Create your first saved audience or change filters.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[#667085]">
          Page <span className="font-black text-[#111827]">{page}</span> of <span className="font-black text-[#111827]">{totalPages}</span> • {total} segments
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
