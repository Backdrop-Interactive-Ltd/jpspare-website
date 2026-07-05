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

function label(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status) {
  if (status === "RECEIVED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "IN_TRANSIT" || status === "PARTIALLY_RECEIVED") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "CANCELLED") return "bg-red-50 text-[#ef3338] ring-red-100";
  if (status === "REQUESTED") return "bg-amber-50 text-amber-700 ring-amber-200";
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

function warehouseLabel(warehouse) {
  if (!warehouse) return "Not assigned";
  return `${warehouse.code} - ${warehouse.name}`;
}

function locationLabel(location) {
  if (!location) return "Not assigned";
  return `${location.code} - ${location.name}`;
}

function binLabel(bin) {
  if (!bin) return "Not assigned";
  return bin.code;
}

export default async function AdminStockTransferDetailPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const { id } = await params;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Stock Transfer</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view stock transfers.</p>
      </div>
    );
  }

  const transfer = await prisma.stockTransfer.findUnique({
    where: { id },
    include: {
      fromWarehouse: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      toWarehouse: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      fromLocation: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      toLocation: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      fromBin: {
        select: {
          id: true,
          code: true,
        },
      },
      toBin: {
        select: {
          id: true,
          code: true,
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

  if (!transfer) notFound();

  const totalQuantity = transfer.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalReceivedQuantity = transfer.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
  const remainingQuantity = Math.max(0, totalQuantity - totalReceivedQuantity);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Stock Transfer</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">{transfer.transferNumber}</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only transfer summary. Stock movement processing is not enabled here.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(transfer.status)}`}>{label(transfer.status)}</span>
            <Link href="/admin/stock-transfers" className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
              Back to Transfers
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCard("Items", transfer.items.length)}
        {metricCard("Quantity", totalQuantity, "info")}
        {metricCard("Received", totalReceivedQuantity, "success")}
        {metricCard("Remaining", remainingQuantity, remainingQuantity ? "warning" : "success")}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Source</h2>
          <dl className="mt-4 grid gap-4 text-sm font-bold text-[#667085]">
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Warehouse</dt>
              <dd className="mt-1 text-[#111827]">{warehouseLabel(transfer.fromWarehouse)}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Location</dt>
              <dd className="mt-1 text-[#111827]">{locationLabel(transfer.fromLocation)}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Bin</dt>
              <dd className="mt-1 text-[#111827]">{binLabel(transfer.fromBin)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Destination</h2>
          <dl className="mt-4 grid gap-4 text-sm font-bold text-[#667085]">
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Warehouse</dt>
              <dd className="mt-1 text-[#111827]">{warehouseLabel(transfer.toWarehouse)}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Location</dt>
              <dd className="mt-1 text-[#111827]">{locationLabel(transfer.toLocation)}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Bin</dt>
              <dd className="mt-1 text-[#111827]">{binLabel(transfer.toBin)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#111827]">Timeline</h2>
        <dl className="mt-4 grid gap-4 text-sm font-bold text-[#667085] md:grid-cols-3">
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Requested</dt>
            <dd className="mt-1 text-[#111827]">{formatDate(transfer.requestedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Shipped</dt>
            <dd className="mt-1 text-[#111827]">{formatDate(transfer.shippedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Received</dt>
            <dd className="mt-1 text-[#111827]">{formatDate(transfer.receivedAt)}</dd>
          </div>
        </dl>
        <div className="mt-4 rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Notes</p>
          <p className="mt-2 text-sm font-bold text-[#344054]">{transfer.notes || "No notes recorded."}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Transfer Items</h2>
          <p className="mt-1 text-sm font-semibold text-[#667085]">Quantities are read-only; no stock is moved from this view.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">SKU</th>
                <th className="px-5 py-4">Quantity</th>
                <th className="px-5 py-4">Received Quantity</th>
                <th className="px-5 py-4">Remaining</th>
                <th className="px-5 py-4">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {transfer.items.map((item) => (
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
                  <td className="px-5 py-4 text-sm font-black text-emerald-700">{item.receivedQuantity}</td>
                  <td className="px-5 py-4 text-sm font-black text-amber-700">{Math.max(0, item.quantity - item.receivedQuantity)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(item.updatedAt)}</td>
                </tr>
              ))}
              {!transfer.items.length ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No transfer items found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Items will appear after BMS sync or future transfer setup.</p>
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
