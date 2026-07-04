import Link from "next/link";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { prisma } from "../../../../lib/db";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const campaignTypes = ["FLASH_SALE", "EID_CAMPAIGN", "BRAND_CAMPAIGN", "CATEGORY_CAMPAIGN", "FREE_SHIPPING", "BUNDLE_OFFER", "NEW_ARRIVAL", "CLEARANCE", "CUSTOM"];
const campaignStatuses = ["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "ENDED", "ARCHIVED"];

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/campaigns?${next.toString()}`;
}

function statusClass(status) {
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "SCHEDULED") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "PAUSED") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (status === "ENDED") return "bg-gray-100 text-gray-600 ring-gray-200";
  if (status === "ARCHIVED") return "bg-slate-100 text-slate-600 ring-slate-200";
  return "bg-red-50 text-[#ef3338] ring-red-100";
}

function label(value) {
  return String(value || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleDateString("en-GB");
}

function campaignAnalytics(campaign) {
  const now = new Date();
  const startsAt = campaign.startsAt ? new Date(campaign.startsAt) : null;
  const endsAt = campaign.endsAt ? new Date(campaign.endsAt) : null;
  const isCurrentlyActive =
    campaign.status === "ACTIVE" &&
    (!startsAt || startsAt <= now) &&
    (!endsAt || endsAt >= now);
  const durationInDays = startsAt && endsAt ? Math.max(1, Math.ceil((endsAt.getTime() - startsAt.getTime()) / 86400000)) : null;
  const timeRemaining = endsAt ? Math.ceil((endsAt.getTime() - now.getTime()) / 86400000) : null;

  return {
    isCurrentlyActive,
    durationInDays,
    timeRemaining,
    homepageEnabled: Boolean(campaign.landingPageEnabled || campaign.bannerImage),
  };
}

function formatDaysRemaining(value) {
  if (value === null) return "Open ended";
  if (value < 0) return "Ended";
  if (value === 0) return "Ends today";
  return `${value} day${value === 1 ? "" : "s"}`;
}

export default async function AdminCampaignsPage({ searchParams }) {
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
  const status = params.get("status") || "";
  const type = params.get("type") || "";
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Campaigns</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view campaigns.</p>
      </div>
    );
  }

  const where = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { seoTitle: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status && campaignStatuses.includes(status) ? { status } : {}),
    ...(type && campaignTypes.includes(type) ? { type } : {}),
  };

  const [campaigns, total] = await prisma.$transaction([
    prisma.promotionCampaign.findMany({
      where,
      orderBy: [{ priority: "desc" }, { startsAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.promotionCampaign.count({ where }),
  ]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Marketing CMS</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Campaigns</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Create and manage campaign records before public storefront integration.</p>
          </div>
          {canManage ? (
            <Link href="/admin/campaigns/new" className="inline-flex h-11 items-center rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)]">
              Add Campaign
            </Link>
          ) : (
            <span className="inline-flex h-11 items-center rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-black text-amber-700">Read-only</span>
          )}
        </div>
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_220px_auto]">
        <input name="q" defaultValue={query} placeholder="Search campaign name or slug" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          {campaignStatuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <select name="type" defaultValue={type} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All types</option>
          {campaignTypes.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1420px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Campaign</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Active Window</th>
                <th className="px-5 py-4">Days Remaining</th>
                <th className="px-5 py-4">Homepage</th>
                <th className="px-5 py-4">Landing</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {campaigns.map((campaign) => {
                const analytics = campaignAnalytics(campaign);

                return (
                  <tr key={campaign.id} className="transition hover:bg-red-50/40">
                    <td className="px-5 py-4">
                      <Link href={`/admin/campaigns/${campaign.id}`} className="font-black text-[#111827] hover:text-[#ef3338]">{campaign.name}</Link>
                      <p className="mt-1 max-w-sm truncate text-xs font-bold text-[#667085]">{campaign.slug}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-[#111827]">{label(campaign.type)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(campaign.status)}`}>{label(campaign.status)}</span>
                      <span className={`mt-2 block text-xs font-black ${analytics.isCurrentlyActive ? "text-emerald-600" : "text-[#98a2b3]"}`}>
                        {analytics.isCurrentlyActive ? "Live now" : "Not live"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-[#111827]">{campaign.priority}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#667085]">
                      <span className="block">Start: {formatDate(campaign.startsAt)}</span>
                      <span className="mt-1 block">End: {formatDate(campaign.endsAt)}</span>
                      <span className="mt-1 block text-xs text-[#98a2b3]">Duration: {analytics.durationInDays ? `${analytics.durationInDays} days` : "Open"}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-[#111827]">{formatDaysRemaining(analytics.timeRemaining)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#667085]">{analytics.homepageEnabled ? "Enabled" : "Off"}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#667085]">{campaign.landingPageEnabled ? "Enabled" : "Off"}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/campaigns/${campaign.id}`} className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                        {canManage ? "Edit" : "View"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {!campaigns.length ? (
                <tr>
                  <td colSpan="9" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No campaigns found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Create your first campaign or change filters.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[#667085]">
          Page <span className="font-black text-[#111827]">{page}</span> of <span className="font-black text-[#111827]">{totalPages}</span> • {total} campaigns
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
