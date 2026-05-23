import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/db";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import { serializeOrder } from "../../../../../lib/commerce/orders";
import OrderStatusForm from "./OrderStatusForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ORDER_STATUS_ROLES = ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER", "SUPPORT_STAFF"];
const ORDER_FULL_ROLES = ["SUPER_ADMIN", "ADMIN"];
const ORDER_PRINT_ROLES = ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER", "SUPPORT_STAFF"];

function money(value) {
  const number = Number(value || 0);
  return `৳${number.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function label(value) {
  if (!value) return "N/A";
  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function dateTime(value) {
  return value ? new Date(value).toLocaleString("en-GB") : "N/A";
}

function statusClass(status) {
  if (status === "DELIVERED" || status === "PAID") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "CANCELLED" || status === "FAILED" || status === "REFUNDED") return "bg-gray-100 text-gray-700 ring-gray-200";
  if (status === "SHIPPED" || status === "PROCESSING" || status === "CONFIRMED") return "bg-blue-50 text-blue-700 ring-blue-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function addressLines(address) {
  if (!address || typeof address !== "object") return [];
  return [
    address.fullName,
    address.phone,
    address.email,
    address.addressLine1,
    address.addressLine2,
    [address.area, address.city, address.postalCode].filter(Boolean).join(", "),
    address.country,
  ].filter(Boolean);
}

function AddressCard({ title, address }) {
  const lines = addressLines(address);

  return (
    <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-[#111827]">{title}</h2>
      {lines.length ? (
        <div className="mt-4 space-y-1 text-sm font-semibold text-[#667085]">
          {lines.map((line, index) => (
            <p key={`${title}-${index}`}>{line}</p>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm font-semibold text-[#667085]">No address information saved.</p>
      )}
    </section>
  );
}

export default async function AdminOrderDetailPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManageStatus = hasRole(user, ORDER_STATUS_ROLES);
  const canFullyManage = hasRole(user, ORDER_FULL_ROLES);
  const canPrintInvoice = hasRole(user, ORDER_PRINT_ROLES);
  const { id } = await params;

  const orderRaw = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id }] },
    include: { customer: true, items: true, payments: { orderBy: { createdAt: "desc" } } },
  });

  if (!orderRaw) notFound();
  const order = serializeOrder(orderRaw);
  const timeline = Array.isArray(order.timeline) ? order.timeline : [];
  const latestPayment = order.payments?.[0];
  const paymentGateway = order.paymentGateway || latestPayment?.gateway || (order.paymentMethod === "SSLCOMMERZ" ? "SSLCOMMERZ" : "N/A");
  const transactionId = order.transactionId || latestPayment?.transactionId || "N/A";
  const paidAt = order.paidAt || latestPayment?.paidAt;

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex text-sm font-black text-[#667085] hover:text-[#ef3338]">← Back to orders</Link>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Order Detail</p>
            <h1 className="mt-2 text-3xl font-black text-[#111827]">{order.orderNumber}</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Placed {new Date(order.createdAt).toLocaleString("en-GB")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(order.status)}`}>Order: {label(order.status)}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(order.paymentStatus)}`}>Payment: {label(order.paymentStatus)}</span>
              <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-black text-[#344054] ring-1 ring-[#e5e7eb]">{label(order.paymentMethod)}</span>
            </div>
          </div>
          <div className="space-y-3 text-right">
            <div className="rounded-2xl bg-[#fff3f3] px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ef3338]">Total</p>
              <p className="mt-1 text-3xl font-black text-[#111827]">{money(order.total)}</p>
            </div>
            {canPrintInvoice ? (
              <div className="flex flex-wrap justify-end gap-2">
                <Link href={`/admin/orders/${order.id}/invoice`} className="rounded-2xl bg-[#111827] px-4 py-2 text-sm font-black text-white transition hover:bg-[#ef3338]">
                  Print Invoice
                </Link>
                <a href={`/api/admin/orders/${order.id}/invoice/pdf`} className="rounded-2xl bg-[#ef3338] px-4 py-2 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] transition hover:bg-[#d71920]">
                  Download PDF
                </a>
                <Link href={`/admin/orders/${order.id}/invoice?type=packing-slip`} className="rounded-2xl border border-[#ef3338] bg-white px-4 py-2 text-sm font-black text-[#ef3338] transition hover:bg-[#fff3f3]">
                  Generate Packing Slip
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
            <header className="border-b border-[#eef0f3] px-5 py-4">
              <h2 className="text-lg font-black text-[#111827]">Items</h2>
            </header>
            <div className="divide-y divide-[#eef0f3]">
              {order.items.map((item) => (
                <article key={item.id} className="grid grid-cols-[72px_1fr_auto] gap-4 px-5 py-4 max-sm:grid-cols-1">
                  <img src={item.imageUrl || "/jpspare-logo.png"} alt={item.productTitle} className="size-16 rounded-xl border border-[#e5e7eb] object-cover" />
                  <div>
                    <h3 className="font-black text-[#111827]">{item.productTitle}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#667085]">SKU: {item.sku || "N/A"} • Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right max-sm:text-left">
                    <p className="font-black text-[#ef3338]">{money(item.total)}</p>
                    <p className="mt-1 text-xs font-bold text-[#667085]">{money(item.unitPrice)} each</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <AddressCard title="Shipping Address" address={order.shippingAddress} />
            <AddressCard title="Billing Address" address={order.billingAddress} />
          </div>

          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#111827]">Customer Order Notes</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm font-semibold text-[#667085]">
              {order.notes || "No customer note was added during checkout."}
            </p>
          </section>

          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#111827]">Order Timeline & Internal Notes</h2>
            <div className="mt-5 space-y-4">
              {timeline.map((entry, index) => (
                <div key={`${entry.at}-${index}`} className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black text-[#111827]">{entry.title || label(entry.status)}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#667085] ring-1 ring-[#e5e7eb]">{entry.type || "ORDER"}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm font-semibold text-[#667085]">{entry.message}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.status ? <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(entry.status)}`}>{label(entry.status)}</span> : null}
                    {entry.paymentStatus ? <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(entry.paymentStatus)}`}>{label(entry.paymentStatus)}</span> : null}
                  </div>
                  <p className="mt-2 text-xs font-bold text-[#98a2b3]">{entry.at ? new Date(entry.at).toLocaleString("en-GB") : ""}</p>
                  {entry.actor ? <p className="mt-1 text-xs font-bold text-[#98a2b3]">By {entry.actor}</p> : null}
                </div>
              ))}
              {!timeline.length ? <p className="text-sm font-semibold text-[#667085]">No timeline entries yet.</p> : null}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <OrderStatusForm
            orderId={order.id}
            status={order.status}
            paymentStatus={order.paymentStatus}
            canManageStatus={canManageStatus}
            canManagePayment={canFullyManage}
            canAddNotes={canFullyManage}
          />

          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#111827]">Customer</h2>
            <div className="mt-4 space-y-2 text-sm font-semibold text-[#667085]">
              <p><span className="font-black text-[#111827]">Name:</span> {order.customerName || "Guest Customer"}</p>
              <p><span className="font-black text-[#111827]">Email:</span> {order.customerEmail || "N/A"}</p>
              <p><span className="font-black text-[#111827]">Phone:</span> {order.customerPhone || "N/A"}</p>
              <p><span className="font-black text-[#111827]">Customer Type:</span> {order.customerId ? "Registered customer" : "Guest checkout"}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#111827]">Payment</h2>
            <div className="mt-4 space-y-3 text-sm font-semibold text-[#667085]">
              <div className="flex justify-between gap-4"><span>Method</span><span className="font-black text-[#111827]">{label(order.paymentMethod)}</span></div>
              <div className="flex justify-between gap-4"><span>Status</span><span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(order.paymentStatus)}`}>{label(order.paymentStatus)}</span></div>
              <div className="flex justify-between gap-4"><span>Gateway</span><span className="text-right font-black text-[#111827]">{label(paymentGateway)}</span></div>
              {latestPayment ? (
                <>
                  <div className="flex justify-between gap-4"><span>Amount</span><span className="font-black text-[#111827]">{money(latestPayment.amount)}</span></div>
                </>
              ) : (
                <p>No payment record found.</p>
              )}
              <div className="flex justify-between gap-4"><span>Transaction</span><span className="max-w-[190px] truncate text-right font-black text-[#111827]">{transactionId}</span></div>
              <div className="flex justify-between gap-4"><span>Paid At</span><span className="text-right font-black text-[#111827]">{dateTime(paidAt)}</span></div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#111827]">ERP/BMS Sync</h2>
            <div className="mt-4 space-y-3 text-sm font-semibold text-[#667085]">
              <div className="flex justify-between gap-4"><span>External Order ID</span><span className="text-right font-black text-[#111827]">{order.externalOrderId || order.externalId || "N/A"}</span></div>
              <div className="flex justify-between gap-4"><span>Source</span><span className="font-black text-[#111827]">{label(order.source)}</span></div>
              <div className="flex justify-between gap-4"><span>Sync Status</span><span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-black text-[#344054] ring-1 ring-[#e5e7eb]">{label(order.syncStatus)}</span></div>
              <div className="flex justify-between gap-4"><span>Last Synced</span><span className="text-right font-black text-[#111827]">{order.lastSyncedAt ? new Date(order.lastSyncedAt).toLocaleString("en-GB") : "Not synced"}</span></div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#111827]">Invoice Summary</h2>
            <div className="mt-4 space-y-3 text-sm font-bold text-[#344054]">
              <div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{money(order.deliveryCharge)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>{money(order.discountTotal)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{money(order.taxTotal)}</span></div>
              <div className="flex justify-between"><span>Invoice</span><span>{order.invoiceNumber || "Not generated"}</span></div>
              <div className="flex justify-between"><span>Generated</span><span>{order.invoiceGeneratedAt ? new Date(order.invoiceGeneratedAt).toLocaleString("en-GB") : "Not yet"}</span></div>
              <div className="flex justify-between"><span>Printed</span><span>{order.printedAt ? new Date(order.printedAt).toLocaleString("en-GB") : "Not yet"}</span></div>
              <div className="flex justify-between border-t border-[#e5e7eb] pt-3 text-lg font-black text-[#111827]"><span>Total</span><span>{money(order.total)}</span></div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
