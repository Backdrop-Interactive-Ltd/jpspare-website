import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { prisma } from "../../../../lib/db";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REFERRAL_STATUSES = ["PENDING", "QUALIFIED", "REWARDED", "CANCELLED", "REJECTED"];

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/referrals?${next.toString()}`;
}

function buildWhere({ status, code, referrer, referred }) {
  return {
    ...(REFERRAL_STATUSES.includes(status) ? { status } : {}),
    ...(code ? { referralCode: { code: { contains: code, mode: "insensitive" } } } : {}),
    ...(referrer
      ? {
          OR: [
            { referrerCustomer: { firstName: { contains: referrer, mode: "insensitive" } } },
            { referrerCustomer: { lastName: { contains: referrer, mode: "insensitive" } } },
            { referrerCustomer: { email: { contains: referrer, mode: "insensitive" } } },
            { referrerCustomer: { phone: { contains: referrer, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(referred
      ? {
          OR: [
            { referredEmail: { contains: referred, mode: "insensitive" } },
            { referredPhone: { contains: referred, mode: "insensitive" } },
            { referredCustomer: { firstName: { contains: referred, mode: "insensitive" } } },
            { referredCustomer: { lastName: { contains: referred, mode: "insensitive" } } },
            { referredCustomer: { email: { contains: referred, mode: "insensitive" } } },
            { referredCustomer: { phone: { contains: referred, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

function customerName(customer) {
  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  return name || customer?.email || customer?.phone || "Unknown customer";
}

function formatDate(value) {
  if (!value) return "Not set";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value) {
  return `৳${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function statusClass(status) {
  if (status === "QUALIFIED") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "REWARDED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "CANCELLED" || status === "REJECTED") return "bg-slate-100 text-slate-600 ring-slate-200";
  return "bg-red-50 text-[#ef3338] ring-red-100";
}

function label(value) {
  return String(value || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function SummaryCard({ label, value, helper }) {
  return (
    <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#667085]">{label}</p>
      <p className="mt-3 text-3xl font-black text-[#111827]">{value}</p>
      {helper ? <p className="mt-2 text-sm font-semibold text-[#667085]">{helper}</p> : null}
    </div>
  );
}

function statusCount(counts, status) {
  return counts.find((item) => item.status === status)?._count?._all || 0;
}

async function getTopReferrers(where) {
  const groups = await prisma.referralRelationship.groupBy({
    by: ["referrerCustomerId"],
    where,
    _count: { _all: true },
    orderBy: { _count: { referrerCustomerId: "desc" } },
    take: 10,
  });
  const ids = groups.map((item) => item.referrerCustomerId);
  if (!ids.length) return [];

  const customers = await prisma.customer.findMany({
    where: { id: { in: ids } },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
  });
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));

  return groups.map((item) => ({
    customerId: item.referrerCustomerId,
    customer: customerMap.get(item.referrerCustomerId),
    referralCount: item._count?._all || 0,
  }));
}

export default async function AdminReferralsPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const status = params.get("status") || "";
  const code = params.get("code") || "";
  const referrer = params.get("referrer") || "";
  const referred = params.get("referred") || "";
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(params.get("limit") || "20", 10), 1), 100);

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Referrals</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view referrals.</p>
      </div>
    );
  }

  const where = buildWhere({ status, code, referrer, referred });
  const [referrals, total, statusCounts] = await prisma.$transaction([
    prisma.referralRelationship.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        referralCode: true,
        referrerCustomer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        referredCustomer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        qualifyingOrder: { select: { id: true, orderNumber: true, total: true, status: true } },
        _count: { select: { rewards: true } },
      },
    }),
    prisma.referralRelationship.count({ where }),
    prisma.referralRelationship.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    }),
  ]);
  const topReferrers = await getTopReferrers(where);
  const [rewardCount, referrerGroups, latestActivity] = await prisma.$transaction([
    prisma.referralReward.count({
      where: {
        relationship: { is: where },
      },
    }),
    prisma.referralRelationship.groupBy({
      by: ["referrerCustomerId"],
      where,
      _count: { _all: true },
    }),
    prisma.referralRelationship.aggregate({
      where,
      _max: { updatedAt: true, createdAt: true },
    }),
  ]);
  const qualified = statusCount(statusCounts, "QUALIFIED");
  const rewarded = statusCount(statusCounts, "REWARDED");
  const conversionRate = total ? Math.round(((qualified + rewarded) / total) * 100) : 0;
  const averageRewardsPerReferrer = referrerGroups.length ? rewardCount / referrerGroups.length : 0;
  const latestReferralActivity = latestActivity._max?.updatedAt || latestActivity._max?.createdAt || null;
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Referral System</p>
        <h1 className="mt-1 text-3xl font-black text-[#111827]">Referrals</h1>
        <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only referral relationships, rewards, and conversion analytics.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label="Total Referrals" value={formatNumber(total)} />
        <SummaryCard label="Pending" value={formatNumber(statusCount(statusCounts, "PENDING"))} />
        <SummaryCard label="Qualified" value={formatNumber(qualified)} />
        <SummaryCard label="Rewarded" value={formatNumber(rewarded)} />
        <SummaryCard label="Cancelled" value={formatNumber(statusCount(statusCounts, "CANCELLED"))} />
        <SummaryCard label="Conversion" value={`${conversionRate}%`} helper="Qualified + rewarded" />
        <SummaryCard label="Avg Rewards / Referrer" value={averageRewardsPerReferrer.toFixed(1)} />
        <SummaryCard label="Latest Activity" value={formatDate(latestReferralActivity)} />
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-[#111827]">Top Referrers</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {topReferrers.map((item) => (
            <div key={item.customerId} className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
              <p className="font-black text-[#111827]">{customerName(item.customer)}</p>
              <p className="mt-1 text-xs font-bold text-[#667085]">{item.customer?.email || item.customer?.phone || "No contact"}</p>
              <p className="mt-3 text-sm font-black text-[#ef3338]">{formatNumber(item.referralCount)} referrals</p>
            </div>
          ))}
          {!topReferrers.length ? <p className="text-sm font-bold text-[#667085]">No referrer activity yet.</p> : null}
        </div>
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm lg:grid-cols-[180px_1fr_1fr_1fr_auto]">
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          {REFERRAL_STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <input name="code" defaultValue={code} placeholder="Referral code" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]" />
        <input name="referrer" defaultValue={referrer} placeholder="Referrer customer" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]" />
        <input name="referred" defaultValue={referred} placeholder="Referred email/customer" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]" />
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1300px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Referral Code</th>
                <th className="px-5 py-4">Referrer</th>
                <th className="px-5 py-4">Referred</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Qualifying Order</th>
                <th className="px-5 py-4">Rewards</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {referrals.map((referral) => (
                <tr key={referral.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4">
                    <Link href={`/admin/referrals/${referral.id}`} className="font-black text-[#111827] hover:text-[#ef3338]">{referral.referralCode?.code || "No code"}</Link>
                    <p className="mt-1 text-xs font-bold text-[#98a2b3]">{referral.referralCode?.isActive ? "Active" : "Inactive"}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">
                    <span className="block font-black text-[#111827]">{customerName(referral.referrerCustomer)}</span>
                    {referral.referrerCustomer?.email || referral.referrerCustomer?.phone || "No contact"}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">
                    <span className="block font-black text-[#111827]">{referral.referredCustomer ? customerName(referral.referredCustomer) : "Not registered"}</span>
                    {referral.referredCustomer?.email || referral.referredEmail || referral.referredCustomer?.phone || referral.referredPhone || "No contact"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(referral.status)}`}>{label(referral.status)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">
                    {referral.qualifyingOrder ? (
                      <Link href={`/admin/orders/${referral.qualifyingOrder.id}`} className="text-[#ef3338] hover:underline">
                        {referral.qualifyingOrder.orderNumber} • {formatMoney(referral.qualifyingOrder.total)}
                      </Link>
                    ) : (
                      "No order"
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{formatNumber(referral._count?.rewards)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(referral.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/referrals/${referral.id}`} className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {!referrals.length ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No referrals found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Referral relationships will appear here when customer flows are connected.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[#667085]">
          Page <span className="font-black text-[#111827]">{page}</span> of <span className="font-black text-[#111827]">{totalPages}</span> • {total} referrals
        </p>
        <div className="flex gap-2">
          <Link aria-disabled={page <= 1} href={page <= 1 ? "#" : buildHref(params, { page: page - 1 })} className={`rounded-xl px-4 py-2 text-sm font-black ${page <= 1 ? "pointer-events-none bg-[#f2f4f7] text-[#98a2b3]" : "border border-[#d0d5dd] text-[#344054]"}`}>
            Previous
          </Link>
          <Link aria-disabled={page >= totalPages} href={page >= totalPages ? "#" : buildHref(params, { page: page + 1 })} className={`rounded-xl px-4 py-2 text-sm font-black ${page >= totalPages ? "pointer-events-none bg-[#f2f4f7] text-[#98a2b3]" : "border border-[#d0d5dd] text-[#344054]"}`}>
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
