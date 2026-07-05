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
  if (status === "DELIVERED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "DISPATCHED" || status === "IN_TRANSIT") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "FAILED" || status === "RETURNED" || status === "CANCELLED") return "bg-red-50 text-[#ef3338] ring-red-100";
  if (status === "PICKING" || status === "PACKING") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
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

export default async function AdminFulfillmentDetailPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const { id } = await params;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Shipment</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view fulfillment data.</p>
      </div>
    );
  }

  const shipment = await prisma.shipment.findUnique({
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
      warehouse: {
        select: {
          id: true,
          code: true,
          name: true,
          address: true,
        },
      },
      courier: {
        select: {
          id: true,
          code: true,
          name: true,
          phone: true,
          email: true,
          apiProvider: true,
          trackingUrl: true,
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
    },
  });

  if (!shipment) notFound();

  const totals = shipment.items.reduce(
    (summary, item) => ({
      quantity: summary.quantity + item.quantity,
      pickedQuantity: summary.pickedQuantity + item.pickedQuantity,
      packedQuantity: summary.packedQuantity + item.packedQuantity,
      deliveredQuantity: summary.deliveredQuantity + item.deliveredQuantity,
    }),
    { quantity: 0, pickedQuantity: 0, packedQuantity: 0, deliveredQuantity: 0 },
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Shipment Summary</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">{shipment.shipmentNumber}</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only fulfillment detail. Pick, pack, and dispatch actions are not enabled here.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(shipment.status)}`}>{label(shipment.status)}</span>
            <Link href="/admin/fulfillment" className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
              Back to Fulfillment
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCard("Items", shipment.items.length)}
        {metricCard("Quantity", totals.quantity, "info")}
        {metricCard("Picked", totals.pickedQuantity, "warning")}
        {metricCard("Packed", totals.packedQuantity, "success")}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Order</h2>
          {shipment.order ? (
            <dl className="mt-4 space-y-4 text-sm font-bold text-[#667085]">
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Order Number</dt>
                <dd className="mt-1">
                  <Link href={`/admin/orders/${shipment.order.id}`} className="text-[#ef3338] hover:underline">{shipment.order.orderNumber}</Link>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Customer</dt>
                <dd className="mt-1 text-[#111827]">{shipment.order.customerName || "Not recorded"}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Contact</dt>
                <dd className="mt-1 text-[#111827]">{shipment.order.customerPhone || shipment.order.customerEmail || "Not recorded"}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Total</dt>
                <dd className="mt-1 text-[#111827]">{money(shipment.order.total)}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No order linked to this shipment.</p>
          )}
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Warehouse</h2>
          {shipment.warehouse ? (
            <dl className="mt-4 space-y-4 text-sm font-bold text-[#667085]">
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Code</dt>
                <dd className="mt-1 text-[#111827]">{shipment.warehouse.code}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Name</dt>
                <dd className="mt-1 text-[#111827]">{shipment.warehouse.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Address</dt>
                <dd className="mt-1 text-[#111827]">{shipment.warehouse.address || "Not recorded"}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No warehouse assigned.</p>
          )}
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Courier</h2>
          {shipment.courier ? (
            <dl className="mt-4 space-y-4 text-sm font-bold text-[#667085]">
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Courier</dt>
                <dd className="mt-1 text-[#111827]">{shipment.courier.code} - {shipment.courier.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Contact</dt>
                <dd className="mt-1 text-[#111827]">{shipment.courier.phone || shipment.courier.email || "Not recorded"}</dd>
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Provider</dt>
                <dd className="mt-1 text-[#111827]">{shipment.courier.apiProvider || "Not recorded"}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No courier assigned.</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#111827]">Tracking & Timeline</h2>
        <dl className="mt-4 grid gap-4 text-sm font-bold text-[#667085] md:grid-cols-2 xl:grid-cols-4">
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Tracking Number</dt>
            <dd className="mt-1 text-[#111827]">{shipment.trackingNumber || "Not assigned"}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Shipped</dt>
            <dd className="mt-1 text-[#111827]">{formatDate(shipment.shippedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Delivered</dt>
            <dd className="mt-1 text-[#111827]">{formatDate(shipment.deliveredAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Updated</dt>
            <dd className="mt-1 text-[#111827]">{formatDate(shipment.updatedAt)}</dd>
          </div>
        </dl>
        <div className="mt-4 rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Notes</p>
          <p className="mt-2 text-sm font-bold text-[#344054]">{shipment.notes || "No notes recorded."}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Shipment Items</h2>
          <p className="mt-1 text-sm font-semibold text-[#667085]">Read-only picked, packed, and delivered quantities.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1060px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">SKU</th>
                <th className="px-5 py-4">Quantity</th>
                <th className="px-5 py-4">Picked</th>
                <th className="px-5 py-4">Packed</th>
                <th className="px-5 py-4">Delivered</th>
                <th className="px-5 py-4">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {shipment.items.map((item) => (
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
                  <td className="px-5 py-4 text-sm font-black text-amber-700">{item.pickedQuantity}</td>
                  <td className="px-5 py-4 text-sm font-black text-blue-700">{item.packedQuantity}</td>
                  <td className="px-5 py-4 text-sm font-black text-emerald-700">{item.deliveredQuantity}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(item.updatedAt)}</td>
                </tr>
              ))}
              {!shipment.items.length ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No shipment items found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Items will appear after future fulfillment workflows create shipment records.</p>
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
