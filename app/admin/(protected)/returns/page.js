import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RETURN_STATUSES = ["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "INSPECTING", "COMPLETED", "CANCELLED"];

function clean(value) {
  return String(value || "").trim();
}

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/returns?${next.toString()}`;
}

function formatDate(value, fallback = "Not recorded") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
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
  if (status === "COMPLETED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "APPROVED" || status === "RECEIVED" || status === "INSPECTING") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "REJECTED" || status === "CANCELLED") return "bg-red-50 text-[#ef3338] ring-red-100";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function refundClass(status) {
  if (status === "REFUNDED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "APPROVED") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "REJECTED") return "bg-red-50 text-[#ef3338] ring-red-100";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function metricCard(cardLabel, value, tone = "default") {
  const toneClass =
    tone === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : tone === "danger"
          ? "border-red-100 bg-red-50 text-[#ef3338]"
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

function customerName(customer, order) {
  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  return name || order?.customerName || "Unknown customer";
}

export default async function AdminReturnsPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const status = clean(params.get("status")).toUpperCase();
  const customer = clean(params.get("customer"));
  const orderNumber = clean(params.get("orderNumber"));
  const returnNumber = clean(params.get("returnNumber"));
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Returns</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view return requests.</p>
      </div>
    );
  }

  const where = {
    ...(status && RETURN_STATUSES.includes(status) ? { status } : {}),
    ...(returnNumber ? { returnNumber: { contains: returnNumber, mode: "insensitive" } } : {}),
    ...(orderNumber ? { order: { orderNumber: { contains: orderNumber, mode: "insensitive" } } } : {}),
    ...(customer
      ? {
          OR: [
            { customer: { firstName: { contains: customer, mode: "insensitive" } } },
            { customer: { lastName: { contains: customer, mode: "insensitive" } } },
            { customer: { email: { contains: customer, mode: "insensitive" } } },
            { customer: { phone: { contains: customer, mode: "insensitive" } } },
            { order: { customerName: { contains: customer, mode: "insensitive" } } },
            { order: { customerEmail: { contains: customer, mode: "insensitive" } } },
            { order: { customerPhone: { contains: customer, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [returns, total, statusRows] = await Promise.all([
    prisma.returnRequest.findMany({
      where,
      orderBy: [{ requestedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        refundCase: {
          select: {
            refundStatus: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    }),
    prisma.returnRequest.count({ where }),
    prisma.returnRequest.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);
  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));
  const totalReturns = Object.values(countsByStatus).reduce((sum, count) => sum + count, 0);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Returns & RMA</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Return Requests</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only return visibility before approval, inspection, refund, and restocking workflows are enabled.</p>
          </div>
          <Link href="/api/admin/returns" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
            API Summary
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {metricCard("Total", totalReturns)}
        {metricCard("Requested", countsByStatus.REQUESTED || 0, "warning")}
        {metricCard("Approved", countsByStatus.APPROVED || 0, "info")}
        {metricCard("Rejected", countsByStatus.REJECTED || 0, "danger")}
        {metricCard("Inspecting", countsByStatus.INSPECTING || 0, "info")}
        {metricCard("Completed", countsByStatus.COMPLETED || 0, "success")}
        {metricCard("Cancelled", countsByStatus.CANCELLED || 0, "danger")}
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm xl:grid-cols-[180px_1fr_1fr_1fr_auto]">
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          {RETURN_STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <input name="customer" defaultValue={customer} placeholder="Customer name, email, phone" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <input name="orderNumber" defaultValue={orderNumber} placeholder="Order number" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <input name="returnNumber" defaultValue={returnNumber} placeholder="Return number" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Return Number</th>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Requested</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Refund Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {returns.map((item) => (
                <tr key={item.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4">
                    <Link href={`/admin/returns/${item.id}`} className="text-sm font-black text-[#ef3338] hover:underline">
                      {item.returnNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    {item.order ? (
                      <Link href={`/admin/orders/${item.order.id}`} className="text-sm font-black text-[#111827] hover:text-[#ef3338]">
                        {item.order.orderNumber}
                      </Link>
                    ) : (
                      <span className="text-sm font-bold text-[#667085]">No order</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-black text-[#111827]">{customerName(item.customer, item.order)}</p>
                    <p className="mt-1 text-xs font-bold text-[#667085]">{item.customer?.email || item.order?.customerEmail || item.customer?.phone || item.order?.customerPhone || "No contact"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(item.status)}`}>{label(item.status)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(item.requestedAt)}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{item._count.items}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${refundClass(item.refundCase?.refundStatus)}`}>{item.refundCase?.refundStatus ? label(item.refundCase.refundStatus) : "No refund case"}</span>
                  </td>
                </tr>
              ))}
              {!returns.length ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No return requests found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Return requests will appear here after future RMA workflows are enabled.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-between rounded-3xl border border-[#e5e7eb] bg-white p-4 text-sm font-bold text-[#667085] shadow-sm">
        <Link className={page <= 1 ? "pointer-events-none opacity-40" : "text-[#ef3338]"} href={buildHref(params, { page: String(page - 1) })}>Previous</Link>
        <span>Page {page} of {totalPages}</span>
        <Link className={page >= totalPages ? "pointer-events-none opacity-40" : "text-[#ef3338]"} href={buildHref(params, { page: String(page + 1) })}>Next</Link>
      </div>
    </div>
  );
}
