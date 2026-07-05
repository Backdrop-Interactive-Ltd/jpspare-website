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

function label(value) {
  return String(value || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status) {
  if (status === "QUALIFIED" || status === "ISSUED") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "REWARDED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "CANCELLED" || status === "REJECTED" || status === "FAILED") return "bg-slate-100 text-slate-600 ring-slate-200";
  return "bg-red-50 text-[#ef3338] ring-red-100";
}

function InfoCard({ title, children }) {
  return (
    <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-[#111827]">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">{label}</p>
      <div className="mt-1 text-sm font-bold text-[#667085]">{value || "Not set"}</div>
    </div>
  );
}

function CustomerBlock({ customer, fallbackEmail, fallbackPhone }) {
  if (!customer && !fallbackEmail && !fallbackPhone) {
    return <p className="text-sm font-bold text-[#667085]">No customer information yet.</p>;
  }

  return (
    <div className="space-y-3">
      <DetailRow label="Name" value={customer ? customerName(customer) : "Not registered"} />
      <DetailRow label="Email" value={customer?.email || fallbackEmail} />
      <DetailRow label="Phone" value={customer?.phone || fallbackPhone} />
      {customer ? <DetailRow label="Status" value={customer.status} /> : null}
      {customer ? <DetailRow label="Joined" value={formatDate(customer.createdAt)} /> : null}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#667085]">{label}</p>
      <p className="mt-3 text-2xl font-black text-[#111827]">{value}</p>
    </div>
  );
}

export default async function ReferralDetailPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const { id } = await params;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Referral Details</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view referrals.</p>
      </div>
    );
  }

  const referral = await prisma.referralRelationship.findUnique({
    where: { id },
    include: {
      referralCode: true,
      referrerCustomer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true, createdAt: true } },
      referredCustomer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true, createdAt: true } },
      qualifyingOrder: { select: { id: true, orderNumber: true, status: true, paymentStatus: true, total: true, createdAt: true } },
      rewards: {
        orderBy: { createdAt: "desc" },
        include: {
          coupon: { select: { id: true, code: true } },
          order: { select: { id: true, orderNumber: true } },
        },
      },
    },
  });

  if (!referral) notFound();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Referral Relationship</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">{referral.referralCode?.code || "Referral"}</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only referral summary and reward history.</p>
          </div>
          <Link href="/admin/referrals" className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
            Back to Referrals
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Status" value={label(referral.status)} />
        <SummaryCard label="Rewards" value={formatNumber(referral.rewards?.length)} />
        <SummaryCard label="Qualified At" value={formatDate(referral.qualifiedAt)} />
        <SummaryCard label="Rewarded At" value={formatDate(referral.rewardedAt)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <InfoCard title="Referrer">
          <CustomerBlock customer={referral.referrerCustomer} />
        </InfoCard>
        <InfoCard title="Referred Customer">
          <CustomerBlock customer={referral.referredCustomer} fallbackEmail={referral.referredEmail} fallbackPhone={referral.referredPhone} />
        </InfoCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <InfoCard title="Referral Code">
          <DetailRow label="Code" value={referral.referralCode?.code} />
          <DetailRow label="Status" value={referral.referralCode?.isActive ? "Active" : "Inactive"} />
          <DetailRow label="Usage" value={`${formatNumber(referral.referralCode?.usedCount)}${referral.referralCode?.usageLimit ? ` / ${formatNumber(referral.referralCode.usageLimit)}` : ""}`} />
          <DetailRow label="Created" value={formatDate(referral.referralCode?.createdAt)} />
        </InfoCard>
        <InfoCard title="Qualifying Order">
          {referral.qualifyingOrder ? (
            <>
              <DetailRow
                label="Order"
                value={
                  <Link href={`/admin/orders/${referral.qualifyingOrder.id}`} className="text-[#ef3338] hover:underline">
                    {referral.qualifyingOrder.orderNumber}
                  </Link>
                }
              />
              <DetailRow label="Total" value={formatMoney(referral.qualifyingOrder.total)} />
              <DetailRow label="Status" value={`${referral.qualifyingOrder.status} / ${referral.qualifyingOrder.paymentStatus}`} />
              <DetailRow label="Created" value={formatDate(referral.qualifyingOrder.createdAt)} />
            </>
          ) : (
            <p className="text-sm font-bold text-[#667085]">No qualifying order yet.</p>
          )}
        </InfoCard>
      </section>

      <InfoCard title="Timeline">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: "Created", at: referral.createdAt },
            { label: "Qualified", at: referral.qualifiedAt },
            { label: "Rewarded", at: referral.rewardedAt },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
              <p className="text-sm font-black text-[#111827]">{item.label}</p>
              <p className="mt-1 text-xs font-bold text-[#667085]">{formatDate(item.at)}</p>
            </div>
          ))}
        </div>
      </InfoCard>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Reward History</h2>
          <p className="mt-1 text-sm font-semibold text-[#667085]">Read-only referral rewards attached to this relationship.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Points / Value</th>
                <th className="px-5 py-4">Coupon</th>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Issued</th>
                <th className="px-5 py-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {referral.rewards.map((reward) => (
                <tr key={reward.id} className="align-top transition hover:bg-red-50/40">
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{label(reward.type)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(reward.status)}`}>{label(reward.status)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{reward.points ? `${formatNumber(reward.points)} pts` : reward.value || "Not set"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{reward.coupon?.code || "No coupon"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">
                    {reward.order ? (
                      <Link href={`/admin/orders/${reward.order.id}`} className="text-[#ef3338] hover:underline">
                        {reward.order.orderNumber}
                      </Link>
                    ) : (
                      "No order"
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(reward.issuedAt)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{reward.description || "No description"}</td>
                </tr>
              ))}
              {!referral.rewards.length ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No rewards yet</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Reward automation will populate this table later.</p>
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
