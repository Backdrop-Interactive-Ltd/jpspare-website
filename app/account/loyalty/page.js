import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerSession } from "../../../lib/auth/customer-session";
import { prisma } from "../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Loyalty Wallet | JPSPARE",
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
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

function typeClass(type) {
  if (type === "EARN_ORDER" || type === "ADJUSTMENT_CREDIT") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (type === "REDEEM_ORDER" || type === "ADJUSTMENT_DEBIT") return "bg-red-50 text-[#ef3338] ring-red-100";
  if (type === "EXPIRY") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function SummaryCard({ label, value, helper }) {
  return (
    <div className="rounded-[12px] border border-[#dfe5ec] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#667085]">{label}</p>
      <p className="mt-3 text-3xl font-black text-[#111827]">{value}</p>
      {helper ? <p className="mt-2 text-sm font-semibold text-[#667085]">{helper}</p> : null}
    </div>
  );
}

async function getWallet(customerId) {
  const account = await prisma.loyaltyAccount.findUnique({
    where: { customerId },
    select: {
      pointsBalance: true,
      lifetimeEarned: true,
      lifetimeRedeemed: true,
      tier: true,
      ledger: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          type: true,
          points: true,
          balanceAfter: true,
          description: true,
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
      _count: { select: { ledger: true } },
    },
  });

  const ledger = account?.ledger || [];

  return {
    account,
    ledger,
    analytics: {
      totalTransactions: account?._count?.ledger || 0,
      earnedTransactions: ledger.filter((entry) => entry.points > 0).length,
      redeemedTransactions: ledger.filter((entry) => entry.points < 0).length,
      cashValue: account?.pointsBalance || 0,
    },
  };
}

export default async function AccountLoyaltyPage() {
  const session = await getCustomerSession();
  if (!session?.customer) {
    redirect("/signin");
  }

  const { account, ledger, analytics } = await getWallet(session.customer.id);

  return (
    <main className="min-h-screen bg-white text-[#111827]">
      <section className="mx-auto w-full max-w-[1500px] px-4 py-16 sm:px-6 lg:px-8 xl:px-10">
        <Link href="/account" className="text-sm font-black text-[#667085] hover:text-[#ef3338]">← Back to account</Link>

        <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">My Account</p>
            <h1 className="mt-2 text-[40px] font-black tracking-[-0.04em]">Loyalty Wallet</h1>
            <p className="mt-3 text-[#667085]">Track your points balance, reward value, and loyalty activity.</p>
          </div>
          <div className="rounded-[12px] border border-red-100 bg-red-50 px-5 py-3 text-sm font-black text-[#ef3338]">
            {account?.tier || "Standard"} tier
          </div>
        </div>

        {!account ? (
          <div className="mt-10 rounded-[12px] border border-[#dfe5ec] bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-black text-[#111827]">No loyalty wallet yet</p>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Your wallet will appear after you earn or redeem loyalty points.</p>
          </div>
        ) : (
          <>
            <section className="mt-10 grid gap-4 md:grid-cols-4">
              <SummaryCard label="Current Balance" value={formatNumber(account.pointsBalance)} helper="Available points" />
              <SummaryCard label="Cash Value" value={`৳${formatNumber(analytics.cashValue)}`} helper="1 point = ৳1" />
              <SummaryCard label="Lifetime Earned" value={formatNumber(account.lifetimeEarned)} />
              <SummaryCard label="Lifetime Redeemed" value={formatNumber(account.lifetimeRedeemed)} />
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-3">
              <SummaryCard label="Transactions" value={formatNumber(analytics.totalTransactions)} />
              <SummaryCard label="Earned Entries" value={formatNumber(analytics.earnedTransactions)} />
              <SummaryCard label="Redeemed Entries" value={formatNumber(analytics.redeemedTransactions)} />
            </section>

            <div className="mt-10 overflow-hidden rounded-[12px] border border-[#dfe5ec] bg-white shadow-sm">
              <div className="border-b border-[#eef0f3] p-5">
                <h2 className="text-xl font-black text-[#111827]">Latest Transactions</h2>
                <p className="mt-1 text-sm font-semibold text-[#667085]">Showing your latest 50 loyalty activities.</p>
              </div>

              {!ledger.length ? (
                <div className="p-10 text-center">
                  <p className="text-lg font-black text-[#111827]">No transactions yet</p>
                  <p className="mt-2 text-sm font-semibold text-[#667085]">Earned and redeemed points will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[980px] w-full text-left">
                    <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
                      <tr>
                        <th className="px-5 py-4">Date</th>
                        <th className="px-5 py-4">Type</th>
                        <th className="px-5 py-4">Points</th>
                        <th className="px-5 py-4">Balance After</th>
                        <th className="px-5 py-4">Description</th>
                        <th className="px-5 py-4">Order</th>
                        <th className="px-5 py-4">Expiry</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eef0f3]">
                      {ledger.map((entry) => (
                        <tr key={entry.id} className="align-top">
                          <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(entry.createdAt)}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${typeClass(entry.type)}`}>{label(entry.type)}</span>
                          </td>
                          <td className={`px-5 py-4 text-sm font-black ${entry.points >= 0 ? "text-emerald-700" : "text-[#ef3338]"}`}>
                            {entry.points >= 0 ? "+" : ""}{formatNumber(entry.points)}
                          </td>
                          <td className="px-5 py-4 text-sm font-black text-[#111827]">{formatNumber(entry.balanceAfter)}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-[#667085]">{entry.description || "No description"}</td>
                          <td className="px-5 py-4 text-sm font-bold text-[#667085]">
                            {entry.order ? (
                              <Link href="/account/orders" className="text-[#ef3338] hover:underline">
                                {entry.order.orderNumber || "View order"}
                              </Link>
                            ) : (
                              "No order"
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm font-bold text-[#667085]">{entry.expiresAt ? formatDate(entry.expiresAt) : "No expiry"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
