import Link from "next/link";
import { notFound } from "next/navigation";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";
import { prisma } from "../../../../../lib/db";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function customerName(customer) {
  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  return name || "Unnamed customer";
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
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

function typeClass(type) {
  if (type === "EARN_ORDER" || type === "ADJUSTMENT_CREDIT") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (type === "REDEEM_ORDER" || type === "ADJUSTMENT_DEBIT") return "bg-red-50 text-[#ef3338] ring-red-100";
  if (type === "EXPIRY") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function tierClass(tier) {
  if (!tier) return "bg-slate-50 text-slate-600 ring-slate-200";
  if (String(tier).toLowerCase().includes("gold")) return "bg-amber-50 text-amber-700 ring-amber-200";
  if (String(tier).toLowerCase().includes("silver")) return "bg-gray-100 text-gray-700 ring-gray-200";
  if (String(tier).toLowerCase().includes("platinum")) return "bg-blue-50 text-blue-700 ring-blue-200";
  return "bg-red-50 text-[#ef3338] ring-red-100";
}

function label(value) {
  return String(value || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#667085]">{label}</p>
      <p className="mt-3 text-3xl font-black text-[#111827]">{value}</p>
    </div>
  );
}

export default async function LoyaltyCustomerPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const { customerId } = await params;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Loyalty Ledger</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view loyalty ledgers.</p>
      </div>
    );
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      loyaltyAccount: {
        select: {
          id: true,
          pointsBalance: true,
          lifetimeEarned: true,
          lifetimeRedeemed: true,
          tier: true,
          createdAt: true,
          updatedAt: true,
          ledger: {
            orderBy: { createdAt: "desc" },
            take: 50,
            select: {
              id: true,
              type: true,
              points: true,
              balanceAfter: true,
              description: true,
              metadata: true,
              expiresAt: true,
              createdAt: true,
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!customer) notFound();

  const account = customer.loyaltyAccount;
  const ledger = account?.ledger || [];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Loyalty Wallet</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">{customerName(customer)}</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">{customer.email || "No email"} • {customer.phone || "No phone"}</p>
          </div>
          <Link href="/admin/loyalty" className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
            Back to Wallets
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="text-xl font-black text-[#111827]">Customer Summary</h2>
            <dl className="mt-4 grid gap-3 text-sm font-bold text-[#667085] sm:grid-cols-2">
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Status</dt>
                <dd className="mt-1 text-[#111827]">{customer.status}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Joined</dt>
                <dd className="mt-1 text-[#111827]">{formatDate(customer.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Wallet Created</dt>
                <dd className="mt-1 text-[#111827]">{formatDate(account?.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Last Wallet Update</dt>
                <dd className="mt-1 text-[#111827]">{formatDate(account?.updatedAt)}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#667085]">Tier</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${tierClass(account?.tier)}`}>{account?.tier || "No tier"}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Current Balance" value={formatNumber(account?.pointsBalance)} />
        <SummaryCard label="Lifetime Earned" value={formatNumber(account?.lifetimeEarned)} />
        <SummaryCard label="Lifetime Redeemed" value={formatNumber(account?.lifetimeRedeemed)} />
        <SummaryCard label="Ledger Entries" value={formatNumber(ledger.length)} />
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Latest Ledger Entries</h2>
          <p className="mt-1 text-sm font-semibold text-[#667085]">Showing the latest 50 read-only loyalty transactions.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1280px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Points</th>
                <th className="px-5 py-4">Balance After</th>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Expiry</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {ledger.map((entry) => (
                <tr key={entry.id} className="align-top transition hover:bg-red-50/40">
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(entry.createdAt)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${typeClass(entry.type)}`}>{label(entry.type)}</span>
                  </td>
                  <td className={`px-5 py-4 text-sm font-black ${entry.points >= 0 ? "text-emerald-700" : "text-[#ef3338]"}`}>{formatNumber(entry.points)}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{formatNumber(entry.balanceAfter)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">
                    {entry.order ? (
                      <Link href={`/admin/orders/${entry.order.id}`} className="text-[#ef3338] hover:underline">
                        {entry.order.orderNumber || entry.order.id}
                      </Link>
                    ) : (
                      "No order"
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(entry.expiresAt)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{entry.description || "No description"}</td>
                  <td className="px-5 py-4">
                    <pre className="max-h-32 max-w-xs overflow-auto rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-3 text-xs font-semibold text-[#344054]">
                      {entry.metadata ? JSON.stringify(entry.metadata, null, 2) : "No metadata"}
                    </pre>
                  </td>
                </tr>
              ))}
              {!ledger.length ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No ledger entries found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">This wallet has no loyalty activity yet.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
