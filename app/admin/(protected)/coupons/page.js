import Link from "next/link";
import { prisma } from "../../../../lib/db";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/coupons?${next.toString()}`;
}

function couponState(coupon) {
  const now = Date.now();
  if (!coupon.isActive) return "inactive";
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now) return "scheduled";
  if (coupon.endsAt && new Date(coupon.endsAt).getTime() <= now) return "expired";
  return "active";
}

function statusClass(state) {
  if (state === "active") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (state === "scheduled") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (state === "expired") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-gray-100 text-gray-600 ring-gray-200";
}

function label(value) {
  return String(value || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMoney(value) {
  if (value === null || value === undefined) return "—";
  return `৳${Number(value).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB");
}

export default async function AdminCouponsPage({ searchParams }) {
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
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;
  const now = new Date();

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Coupons</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view coupons.</p>
      </div>
    );
  }

  const where = {
    ...(query
      ? {
          OR: [
            { code: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status === "active" ? { isActive: true, OR: [{ startsAt: null }, { startsAt: { lte: now } }], AND: [{ OR: [{ endsAt: null }, { endsAt: { gt: now } }] }] } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
    ...(status === "expired" ? { endsAt: { lte: now } } : {}),
    ...(status === "scheduled" ? { isActive: true, startsAt: { gt: now } } : {}),
  };

  const [coupons, total] = await prisma.$transaction([
    prisma.coupon.findMany({
      where,
      include: { _count: { select: { orders: true, redemptions: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.coupon.count({ where }),
  ]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Marketing CMS</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Coupons</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Manage coupon codes before storefront apply/checkout integration.</p>
          </div>
          {canManage ? (
            <Link href="/admin/coupons/new" className="inline-flex h-11 items-center rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)]">
              Add Coupon
            </Link>
          ) : (
            <span className="inline-flex h-11 items-center rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-black text-amber-700">Read-only</span>
          )}
        </div>
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
        <input name="q" defaultValue={query} placeholder="Search coupon code or description" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="expired">Expired</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Discount</th>
                <th className="px-5 py-4">Min Order</th>
                <th className="px-5 py-4">Usage</th>
                <th className="px-5 py-4">Window</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {coupons.map((coupon) => {
                const state = couponState(coupon);
                return (
                  <tr key={coupon.id} className="transition hover:bg-red-50/40">
                    <td className="px-5 py-4">
                      <Link href={`/admin/coupons/${coupon.id}`} className="font-black text-[#111827] hover:text-[#ef3338]">
                        {coupon.code}
                      </Link>
                      <p className="mt-1 max-w-sm truncate text-xs font-bold text-[#667085]">{coupon.description || "No description"}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-[#111827]">
                      {coupon.discountType === "PERCENT" ? `${Number(coupon.discountValue)}%` : formatMoney(coupon.discountValue)}
                      {coupon.maxDiscount ? <span className="mt-1 block text-xs font-bold text-[#667085]">Max {formatMoney(coupon.maxDiscount)}</span> : null}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatMoney(coupon.minOrderValue)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#667085]">
                      <span className="font-black text-[#111827]">{coupon.usedCount}</span>
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : " / unlimited"}
                      <span className="mt-1 block text-xs">Orders {coupon._count?.orders || 0} • Redemptions {coupon._count?.redemptions || 0}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-[#667085]">
                      <span className="block">Start: {formatDate(coupon.startsAt)}</span>
                      <span className="mt-1 block">End: {formatDate(coupon.endsAt)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(state)}`}>{label(state)}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/coupons/${coupon.id}`} className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                        {canManage ? "Edit" : "View"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {!coupons.length ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No coupons found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Create your first coupon or change filters.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[#667085]">
          Page <span className="font-black text-[#111827]">{page}</span> of <span className="font-black text-[#111827]">{totalPages}</span> • {total} coupons
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
