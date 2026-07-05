import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SHIPMENT_STATUSES = ["DRAFT", "PICKING", "PICKED", "PACKING", "PACKED", "DISPATCHED", "IN_TRANSIT", "DELIVERED", "FAILED", "RETURNED", "CANCELLED"];

function clean(value) {
  return String(value || "").trim();
}

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/fulfillment?${next.toString()}`;
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

function warehouseLabel(warehouse) {
  if (!warehouse) return "Not assigned";
  return `${warehouse.code} - ${warehouse.name}`;
}

function courierLabel(courier) {
  if (!courier) return "Not assigned";
  return `${courier.code} - ${courier.name}`;
}

export default async function AdminFulfillmentPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const search = clean(params.get("search"));
  const status = clean(params.get("status")).toUpperCase();
  const courierId = clean(params.get("courierId"));
  const warehouseId = clean(params.get("warehouseId"));
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Fulfillment</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view fulfillment data.</p>
      </div>
    );
  }

  const where = {
    ...(status && SHIPMENT_STATUSES.includes(status) ? { status } : {}),
    ...(courierId ? { courierId } : {}),
    ...(warehouseId ? { warehouseId } : {}),
    ...(search
      ? {
          OR: [
            { shipmentNumber: { contains: search, mode: "insensitive" } },
            { trackingNumber: { contains: search, mode: "insensitive" } },
            { order: { orderNumber: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [shipments, total, statusRows, couriers, warehouses] = await Promise.all([
    prisma.shipment.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            status: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        courier: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    }),
    prisma.shipment.count({ where }),
    prisma.shipment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.courier.findMany({
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
      },
    }),
    prisma.warehouse.findMany({
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
      },
    }),
  ]);
  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));
  const totalShipments = Object.values(countsByStatus).reduce((sum, count) => sum + count, 0);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Fulfillment Foundation</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Shipments</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only shipment and courier visibility before pick, pack, and dispatch workflows are enabled.</p>
          </div>
          <Link href="/api/admin/fulfillment" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
            API Summary
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {metricCard("Total", totalShipments)}
        {metricCard("Picking", countsByStatus.PICKING || 0, "warning")}
        {metricCard("Packed", countsByStatus.PACKED || 0)}
        {metricCard("Dispatched", countsByStatus.DISPATCHED || 0, "info")}
        {metricCard("In transit", countsByStatus.IN_TRANSIT || 0, "info")}
        {metricCard("Delivered", countsByStatus.DELIVERED || 0, "success")}
        {metricCard("Failed", countsByStatus.FAILED || 0, "danger")}
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm xl:grid-cols-[1fr_180px_220px_240px_auto]">
        <input name="search" defaultValue={search} placeholder="Search shipment, tracking, or order number" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          {SHIPMENT_STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <select name="courierId" defaultValue={courierId} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">Any courier</option>
          {couriers.map((courier) => <option key={courier.id} value={courier.id}>{courierLabel(courier)}</option>)}
        </select>
        <select name="warehouseId" defaultValue={warehouseId} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">Any warehouse</option>
          {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouseLabel(warehouse)}</option>)}
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1360px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Shipment Number</th>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Warehouse</th>
                <th className="px-5 py-4">Courier</th>
                <th className="px-5 py-4">Tracking Number</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4">
                    <Link href={`/admin/fulfillment/${shipment.id}`} className="text-sm font-black text-[#ef3338] hover:underline">
                      {shipment.shipmentNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    {shipment.order ? (
                      <Link href={`/admin/orders/${shipment.order.id}`} className="text-sm font-black text-[#111827] hover:text-[#ef3338]">
                        {shipment.order.orderNumber}
                      </Link>
                    ) : (
                      <span className="text-sm font-bold text-[#667085]">No order</span>
                    )}
                    <p className="mt-1 text-xs font-bold text-[#667085]">{shipment.order?.customerName || "No customer name"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(shipment.status)}`}>{label(shipment.status)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#344054]">{warehouseLabel(shipment.warehouse)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#344054]">{courierLabel(shipment.courier)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{shipment.trackingNumber || "Not assigned"}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{shipment._count.items}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(shipment.createdAt)}</td>
                </tr>
              ))}
              {!shipments.length ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No shipments found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Shipments will appear here after future fulfillment workflows are enabled.</p>
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
