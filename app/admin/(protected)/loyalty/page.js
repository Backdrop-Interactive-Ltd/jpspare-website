import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { prisma } from "../../../../lib/db";
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
  return `/admin/loyalty?${next.toString()}`;
}

function buildWhere(query, tier) {
  return {
    ...(tier ? { tier } : {}),
    ...(query
      ? {
          OR: [
            { customer: { firstName: { contains: query, mode: "insensitive" } } },
            { customer: { lastName: { contains: query, mode: "insensitive" } } },
            { customer: { email: { contains: query, mode: "insensitive" } } },
            { customer: { phone: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

function customerName(customer) {
  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  return name || "Unnamed customer";
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function formatDate(value) {
  if (!value) return "No activity";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function tierClass(tier) {
  if (!tier) return "bg-slate-50 text-slate-600 ring-slate-200";
  if (String(tier).toLowerCase().includes("gold")) return "bg-amber-50 text-amber-700 ring-amber-200";
  if (String(tier).toLowerCase().includes("silver")) return "bg-gray-100 text-gray-700 ring-gray-200";
  if (String(tier).toLowerCase().includes("platinum")) return "bg-blue-50 text-blue-700 ring-blue-200";
  return "bg-red-50 text-[#ef3338] ring-red-100";
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

export default async function LoyaltyAdminPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const query = params.get("q") || "";
  const tier = params.get("tier") || "";
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Loyalty Wallets</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view loyalty wallets.</p>
      </div>
    );
  }

  const where = buildWhere(query, tier);

  const [accounts, total, summary, latestActivity, tiers] = await prisma.$transaction([
    prisma.loyaltyAccount.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        ledger: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
        _count: { select: { ledger: true } },
      },
    }),
    prisma.loyaltyAccount.count({ where }),
    prisma.loyaltyAccount.aggregate({
      where,
      _count: { _all: true },
      _sum: {
        pointsBalance: true,
        lifetimeEarned: true,
        lifetimeRedeemed: true,
      },
    }),
    prisma.loyaltyLedger.findFirst({
      where: {
        account: { is: where },
      },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.loyaltyAccount.findMany({
      where: { tier: { not: null } },
      distinct: ["tier"],
      orderBy: { tier: "asc" },
      select: { tier: true },
    }),
  ]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const averagePoints = summary._count?._all ? Math.round((summary._sum?.pointsBalance || 0) / summary._count._all) : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Loyalty System</p>
          <h1 className="mt-1 text-3xl font-black text-[#111827]">Loyalty Wallets</h1>
          <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only customer points balances and ledger activity.</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label="Total Accounts" value={formatNumber(summary._count?._all)} />
        <SummaryCard label="Active Points" value={formatNumber(summary._sum?.pointsBalance)} />
        <SummaryCard label="Lifetime Earned" value={formatNumber(summary._sum?.lifetimeEarned)} />
        <SummaryCard label="Lifetime Redeemed" value={formatNumber(summary._sum?.lifetimeRedeemed)} />
        <SummaryCard label="Average Points" value={formatNumber(averagePoints)} helper="Per customer" />
        <SummaryCard label="Latest Activity" value={latestActivity?.createdAt ? formatDate(latestActivity.createdAt) : "No activity"} />
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
        <input name="q" defaultValue={query} placeholder="Search by customer name, email, or phone" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="tier" defaultValue={tier} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All tiers</option>
          {tiers.map((item) => (
            <option key={item.tier} value={item.tier}>{item.tier}</option>
          ))}
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Balance</th>
                <th className="px-5 py-4">Lifetime Earned</th>
                <th className="px-5 py-4">Lifetime Redeemed</th>
                <th className="px-5 py-4">Tier</th>
                <th className="px-5 py-4">Ledger Entries</th>
                <th className="px-5 py-4">Last Activity</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {accounts.map((account) => (
                <tr key={account.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4">
                    <Link href={`/admin/loyalty/${account.customerId}`} className="font-black text-[#111827] hover:text-[#ef3338]">{customerName(account.customer)}</Link>
                    <p className="mt-1 text-xs font-bold text-[#98a2b3]">{account.customer?.phone || "No phone"}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{account.customer?.email || "No email"}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{formatNumber(account.pointsBalance)}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{formatNumber(account.lifetimeEarned)}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{formatNumber(account.lifetimeRedeemed)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${tierClass(account.tier)}`}>{account.tier || "No tier"}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatNumber(account._count?.ledger)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(account.ledger?.[0]?.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/loyalty/${account.customerId}`} className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                      View Ledger
                    </Link>
                  </td>
                </tr>
              ))}
              {!accounts.length ? (
                <tr>
                  <td colSpan="9" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No loyalty wallets found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Wallets will appear here after loyalty accounts are created.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[#667085]">
          Page <span className="font-black text-[#111827]">{page}</span> of <span className="font-black text-[#111827]">{totalPages}</span> • {total} wallets
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
