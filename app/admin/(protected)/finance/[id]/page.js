import Link from "next/link";
import { notFound } from "next/navigation";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import { prisma } from "../../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function formatDate(value, fallback = "Not recorded") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function money(value) {
  return `৳${Math.round(Number(value || 0)).toLocaleString("en-BD")}`;
}

function label(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status) {
  if (status === "COMPLETED" || status === "MATCHED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "PROCESSING" || status === "PARTIAL") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "FAILED" || status === "CANCELLED") return "bg-red-50 text-[#ef3338] ring-red-100";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function metricCard(cardLabel, value, tone = "default") {
  const toneClass =
    tone === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : tone === "info"
          ? "border-blue-100 bg-blue-50 text-blue-700"
          : "border-[#eef0f3] bg-[#f8fafc] text-[#111827]";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs font-black uppercase tracking-[0.12em] opacity-70">{cardLabel}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

export default async function AdminFinanceDetailPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const { id } = await params;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Finance Settlement</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view finance records.</p>
      </div>
    );
  }

  const settlement = await prisma.paymentSettlement.findUnique({
    where: { id },
    include: {
      lines: {
        orderBy: [{ createdAt: "desc" }],
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              paymentStatus: true,
              total: true,
            },
          },
          payment: {
            select: {
              id: true,
              method: true,
              status: true,
              amount: true,
              gateway: true,
              transactionId: true,
              paidAt: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!settlement) notFound();

  const reconciliation = settlement.gateway
    ? await prisma.reconciliationRun.findFirst({
        where: { gateway: settlement.gateway },
        orderBy: [{ createdAt: "desc" }],
      })
    : null;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Finance Settlement</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">{settlement.settlementNumber}</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only settlement detail. Processing, reconciliation, and accounting export actions are not enabled here.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(settlement.status)}`}>{label(settlement.status)}</span>
            <Link href="/admin/finance" className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
              Back to Finance
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCard("Total Amount", money(settlement.totalAmount), "success")}
        {metricCard("Lines", settlement.lines.length, "info")}
        {metricCard("Settled", formatDate(settlement.settledAt))}
        {metricCard("Updated", formatDate(settlement.updatedAt))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Settlement Summary</h2>
          <dl className="mt-4 space-y-4 text-sm font-bold text-[#667085]">
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Settlement Number</dt>
              <dd className="mt-1 text-[#111827]">{settlement.settlementNumber}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Gateway</dt>
              <dd className="mt-1 text-[#111827]">{settlement.gateway || "Not recorded"}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Payment Method</dt>
              <dd className="mt-1 text-[#111827]">{label(settlement.paymentMethod) || "Not recorded"}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Status</dt>
              <dd className="mt-1"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(settlement.status)}`}>{label(settlement.status)}</span></dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Total Amount</dt>
              <dd className="mt-1 text-[#111827]">{money(settlement.totalAmount)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Reconciliation Summary</h2>
          {reconciliation ? (
            <dl className="mt-4 space-y-4 text-sm font-bold text-[#667085]">
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Run Number</dt>
                <dd className="mt-1 text-[#111827]">{reconciliation.runNumber}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Gateway</dt>
                <dd className="mt-1 text-[#111827]">{reconciliation.gateway || "Not recorded"}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Transactions</dt>
                <dd className="mt-1 text-[#111827]">{reconciliation.totalTransactions} total · {reconciliation.matchedTransactions} matched · {reconciliation.unmatchedTransactions} unmatched</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Status</dt>
                <dd className="mt-1"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(reconciliation.status)}`}>{label(reconciliation.status)}</span></dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No reconciliation run found for this settlement gateway.</p>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Settlement Lines</h2>
          <p className="mt-1 text-sm font-semibold text-[#667085]">Linked orders and payments included in this settlement.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3] text-sm">
              {settlement.lines.length ? settlement.lines.map((line) => (
                <tr key={line.id} className="align-top hover:bg-[#f8fafc]">
                  <td className="px-5 py-4">
                    {line.order ? (
                      <>
                        <Link href={`/admin/orders/${line.order.id}`} className="font-black text-[#ef3338] hover:underline">{line.order.orderNumber}</Link>
                        <p className="mt-1 text-xs font-bold text-[#98a2b3]">{label(line.order.status)} · {label(line.order.paymentStatus)}</p>
                      </>
                    ) : (
                      <span className="font-bold text-[#667085]">No order linked</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {line.payment ? (
                      <>
                        <p className="font-black text-[#111827]">{label(line.payment.method)}</p>
                        <p className="mt-1 text-xs font-bold text-[#98a2b3]">{line.payment.transactionId || line.payment.id}</p>
                      </>
                    ) : (
                      <span className="font-bold text-[#667085]">No payment linked</span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-black text-[#111827]">{money(line.amount)}</td>
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(line.status)}`}>{label(line.status)}</span></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm font-bold text-[#667085]">No settlement lines found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#111827]">Timeline</h2>
        <dl className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Created</dt>
            <dd className="mt-2 text-sm font-black text-[#111827]">{formatDate(settlement.createdAt)}</dd>
          </div>
          <div className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Settled</dt>
            <dd className="mt-2 text-sm font-black text-[#111827]">{formatDate(settlement.settledAt)}</dd>
          </div>
          <div className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Updated</dt>
            <dd className="mt-2 text-sm font-black text-[#111827]">{formatDate(settlement.updatedAt)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
