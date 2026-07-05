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
  if (status === "COMPLETED" || status === "REFUNDED" || status === "RESTOCK") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "APPROVED" || status === "RECEIVED" || status === "INSPECTING" || status === "REPAIR") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "REJECTED" || status === "CANCELLED" || status === "WRITE_OFF") return "bg-red-50 text-[#ef3338] ring-red-100";
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

function customerName(customer, order) {
  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  return name || order?.customerName || "Unknown customer";
}

export default async function AdminReturnDetailPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const { id } = await params;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Return Request</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view return requests.</p>
      </div>
    );
  }

  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          total: true,
          createdAt: true,
        },
      },
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
        },
      },
      items: {
        orderBy: [{ createdAt: "asc" }],
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              sku: true,
            },
          },
        },
      },
      inspection: {
        include: {
          inspectedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      refundCase: true,
    },
  });

  if (!returnRequest) notFound();

  const totalQuantity = returnRequest.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Return Request</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">{returnRequest.returnNumber}</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only RMA detail. Approval, inspection, refund, and restocking actions are not enabled here.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(returnRequest.status)}`}>{label(returnRequest.status)}</span>
            <Link href="/admin/returns" className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
              Back to Returns
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCard("Items", returnRequest.items.length)}
        {metricCard("Quantity", totalQuantity, "info")}
        {metricCard("Requested", formatDate(returnRequest.requestedAt))}
        {metricCard("Completed", formatDate(returnRequest.completedAt), returnRequest.completedAt ? "success" : "default")}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Customer Summary</h2>
          {returnRequest.customer ? (
            <dl className="mt-4 space-y-4 text-sm font-bold text-[#667085]">
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Name</dt>
                <dd className="mt-1 text-[#111827]">{customerName(returnRequest.customer, returnRequest.order)}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Email</dt>
                <dd className="mt-1 text-[#111827]">{returnRequest.customer.email || returnRequest.order?.customerEmail || "Not recorded"}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Phone</dt>
                <dd className="mt-1 text-[#111827]">{returnRequest.customer.phone || returnRequest.order?.customerPhone || "Not recorded"}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No customer linked.</p>
          )}
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Order Summary</h2>
          {returnRequest.order ? (
            <dl className="mt-4 space-y-4 text-sm font-bold text-[#667085]">
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Order</dt>
                <dd className="mt-1">
                  <Link href={`/admin/orders/${returnRequest.order.id}`} className="text-[#ef3338] hover:underline">{returnRequest.order.orderNumber}</Link>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Status</dt>
                <dd className="mt-1 text-[#111827]">{label(returnRequest.order.status)}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Total</dt>
                <dd className="mt-1 text-[#111827]">{money(returnRequest.order.total)}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No order linked.</p>
          )}
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Return Summary</h2>
          <dl className="mt-4 space-y-4 text-sm font-bold text-[#667085]">
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Reason</dt>
              <dd className="mt-1 text-[#111827]">{returnRequest.reason || "Not recorded"}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Created</dt>
              <dd className="mt-1 text-[#111827]">{formatDate(returnRequest.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Updated</dt>
              <dd className="mt-1 text-[#111827]">{formatDate(returnRequest.updatedAt)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Inspection Summary</h2>
          {returnRequest.inspection ? (
            <dl className="mt-4 space-y-4 text-sm font-bold text-[#667085]">
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Result</dt>
                <dd className="mt-1">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(returnRequest.inspection.result)}`}>{label(returnRequest.inspection.result)}</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Inspected By</dt>
                <dd className="mt-1 text-[#111827]">{returnRequest.inspection.inspectedBy?.name || returnRequest.inspection.inspectedBy?.email || "Not recorded"}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Inspected At</dt>
                <dd className="mt-1 text-[#111827]">{formatDate(returnRequest.inspection.inspectedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Notes</dt>
                <dd className="mt-1 text-[#111827]">{returnRequest.inspection.notes || "No notes recorded."}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No inspection has been recorded.</p>
          )}
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Refund Summary</h2>
          {returnRequest.refundCase ? (
            <dl className="mt-4 space-y-4 text-sm font-bold text-[#667085]">
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(returnRequest.refundCase.refundStatus)}`}>{label(returnRequest.refundCase.refundStatus)}</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Amount</dt>
                <dd className="mt-1 text-[#111827]">{money(returnRequest.refundCase.refundAmount)}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Method</dt>
                <dd className="mt-1 text-[#111827]">{returnRequest.refundCase.refundMethod || "Not recorded"}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Processed</dt>
                <dd className="mt-1 text-[#111827]">{formatDate(returnRequest.refundCase.processedAt)}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No refund case has been recorded.</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#111827]">Timeline</h2>
        <dl className="mt-4 grid gap-4 text-sm font-bold text-[#667085] md:grid-cols-4">
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Requested</dt>
            <dd className="mt-1 text-[#111827]">{formatDate(returnRequest.requestedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Completed</dt>
            <dd className="mt-1 text-[#111827]">{formatDate(returnRequest.completedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Created</dt>
            <dd className="mt-1 text-[#111827]">{formatDate(returnRequest.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Updated</dt>
            <dd className="mt-1 text-[#111827]">{formatDate(returnRequest.updatedAt)}</dd>
          </div>
        </dl>
        <div className="mt-4 rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Notes</p>
          <p className="mt-2 text-sm font-bold text-[#344054]">{returnRequest.notes || "No notes recorded."}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Returned Items</h2>
          <p className="mt-1 text-sm font-semibold text-[#667085]">Read-only returned product quantities and reasons.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">SKU</th>
                <th className="px-5 py-4">Quantity</th>
                <th className="px-5 py-4">Reason</th>
                <th className="px-5 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {returnRequest.items.map((item) => (
                <tr key={item.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4">
                    {item.product ? (
                      <Link href={`/admin/products/${item.product.id}`} className="text-sm font-black text-[#ef3338] hover:underline">
                        {item.product.title}
                      </Link>
                    ) : (
                      <span className="text-sm font-bold text-[#667085]">Unknown product</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{item.product?.sku || "No SKU"}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{item.quantity}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{item.reason || "Not recorded"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
              {!returnRequest.items.length ? (
                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No returned items found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Items will appear after future RMA workflows create return records.</p>
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
