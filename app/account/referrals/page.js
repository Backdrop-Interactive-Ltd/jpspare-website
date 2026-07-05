import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomerSession } from "../../../lib/auth/customer-session";
import { getCustomerReferralDashboard } from "../../../lib/referrals/customer-referrals";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Referral Dashboard | JPSPARE",
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function formatMoney(value) {
  return `৳${new Intl.NumberFormat("en-US").format(Number(value || 0))}`;
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

function statusClass(status) {
  if (status === "QUALIFIED") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "REWARDED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "CANCELLED" || status === "REJECTED") return "bg-red-50 text-[#ef3338] ring-red-100";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

async function requestOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") || "http";
  return host ? `${proto}://${host}` : undefined;
}

function SummaryCard({ label: title, value, helper }) {
  return (
    <div className="rounded-[12px] border border-[#dfe5ec] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#667085]">{title}</p>
      <p className="mt-3 text-3xl font-black text-[#111827]">{value}</p>
      {helper ? <p className="mt-2 text-sm font-semibold text-[#667085]">{helper}</p> : null}
    </div>
  );
}

export default async function AccountReferralsPage() {
  const session = await getCustomerSession();
  if (!session?.customer) {
    redirect("/signin");
  }

  const dashboard = await getCustomerReferralDashboard({
    customer: session.customer,
    origin: await requestOrigin(),
  });

  return (
    <main className="min-h-screen bg-white text-[#111827]">
      <section className="mx-auto w-full max-w-[1500px] px-4 py-16 sm:px-6 lg:px-8 xl:px-10">
        <Link href="/account" className="text-sm font-black text-[#667085] hover:text-[#ef3338]">← Back to account</Link>

        <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">My Account</p>
            <h1 className="mt-2 text-[40px] font-black tracking-[-0.04em]">Referral Dashboard</h1>
            <p className="mt-3 text-[#667085]">Share your referral code and track invited customers as they qualify for rewards.</p>
          </div>
          <div className="rounded-[12px] border border-red-100 bg-red-50 px-5 py-3 text-sm font-black text-[#ef3338]">
            {dashboard.code}
          </div>
        </div>

        <section className="mt-10 rounded-[12px] border border-[#dfe5ec] bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#667085]">Your referral link</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="rounded-[12px] border border-[#dfe5ec] bg-[#f8fafc] px-4 py-3 text-sm font-black text-[#111827]">
              {dashboard.shareUrl}
            </div>
            <Link href={dashboard.shareUrl} className="inline-flex h-12 items-center justify-center rounded-xl bg-[#ef3338] px-6 text-sm font-black text-white hover:bg-[#d91f2a]">
              Open Link
            </Link>
          </div>
          <p className="mt-3 text-sm font-semibold text-[#667085]">Referral tracking will start when signup and checkout hooks are connected.</p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <SummaryCard label="Total Referrals" value={formatNumber(dashboard.stats.totalReferrals)} />
          <SummaryCard label="Pending" value={formatNumber(dashboard.stats.pending)} />
          <SummaryCard label="Qualified" value={formatNumber(dashboard.stats.qualified)} />
          <SummaryCard label="Rewarded" value={formatNumber(dashboard.stats.rewarded)} />
          <SummaryCard label="Rewards" value={formatNumber(dashboard.stats.totalRewards)} helper="Issued records" />
          <SummaryCard label="Reward Points" value={formatNumber(dashboard.stats.totalRewardPoints)} />
        </section>

        <div className="mt-10 overflow-hidden rounded-[12px] border border-[#dfe5ec] bg-white shadow-sm">
          <div className="border-b border-[#eef0f3] p-5">
            <h2 className="text-xl font-black text-[#111827]">Referral Activity</h2>
            <p className="mt-1 text-sm font-semibold text-[#667085]">Showing the latest referral relationships attached to your account.</p>
          </div>

          {!dashboard.relationships.length ? (
            <div className="p-10 text-center">
              <p className="text-lg font-black text-[#111827]">No referrals yet</p>
              <p className="mt-2 text-sm font-semibold text-[#667085]">Your invited customers will appear here once referral capture is connected.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-left">
                <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
                  <tr>
                    <th className="px-5 py-4">Created</th>
                    <th className="px-5 py-4">Referred Customer</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Qualifying Order</th>
                    <th className="px-5 py-4">Rewards</th>
                    <th className="px-5 py-4">Rewarded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef0f3]">
                  {dashboard.relationships.map((relationship) => (
                    <tr key={relationship.id} className="align-top">
                      <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(relationship.createdAt)}</td>
                      <td className="px-5 py-4 text-sm font-bold text-[#667085]">
                        <span className="block font-black text-[#111827]">{relationship.referredCustomer?.name || "Not registered"}</span>
                        {relationship.referredCustomer?.email || relationship.referredEmail || relationship.referredCustomer?.phone || relationship.referredPhone || "No contact"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(relationship.status)}`}>{label(relationship.status)}</span>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-[#667085]">
                        {relationship.qualifyingOrder ? (
                          <>
                            <span className="block text-[#111827]">{relationship.qualifyingOrder.orderNumber || "Order"}</span>
                            {formatMoney(relationship.qualifyingOrder.total)}
                          </>
                        ) : (
                          "No order yet"
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm font-black text-[#111827]">
                        {formatNumber(relationship.rewardCount)}
                        {relationship.totalRewardPoints ? <span className="ml-2 text-[#667085]">({formatNumber(relationship.totalRewardPoints)} pts)</span> : null}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(relationship.rewardedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
