import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TRANSFER_STATUSES = ["DRAFT", "REQUESTED", "IN_TRANSIT", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"];

function clean(value) {
  return String(value || "").trim();
}

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/stock-transfers?${next.toString()}`;
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

export default async function AdminStockTransfersPage({ searchParams }) {
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
  const fromWarehouseId = clean(params.get("fromWarehouseId"));
  const toWarehouseId = clean(params.get("toWarehouseId"));
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Stock Transfers</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view stock transfers.</p>
      </div>
    );
  }

  const where = {
    ...(status && TRANSFER_STATUSES.includes(status) ? { status } : {}),
    ...(fromWarehouseId ? { fromWarehouseId } : {}),
    ...(toWarehouseId ? { toWarehouseId } : {}),
    ...(search ? { transferNumber: { contains: search, mode: "insensitive" } } : {}),
  };

  const [transfers, total, statusRows, warehouses] = await Promise.all([
    prisma.stockTransfer.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
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
        _count: {
          select: {
            items: true,
          },
        },
      },
    }),
    prisma.stockTransfer.count({ where }),
    prisma.stockTransfer.groupBy({
      by: ["status"],
      _count: { _all: true },
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
  const totalTransfers = Object.values(countsByStatus).reduce((sum, count) => sum + count, 0);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">BMS Warehouse Foundation</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Stock Transfers</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only transfer monitor before movement processing and fulfillment workflows are enabled.</p>
          </div>
          <Link href="/api/admin/stock-transfers" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
            API Summary
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {metricCard("Total transfers", totalTransfers)}
        {metricCard("Draft", countsByStatus.DRAFT || 0)}
        {metricCard("In transit", countsByStatus.IN_TRANSIT || 0, "info")}
        {metricCard("Received", countsByStatus.RECEIVED || 0, "success")}
        {metricCard("Cancelled", countsByStatus.CANCELLED || 0, "danger")}
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm xl:grid-cols-[1fr_190px_240px_240px_auto]">
        <input name="search" defaultValue={search} placeholder="Search transfer number" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          {TRANSFER_STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <select name="fromWarehouseId" defaultValue={fromWarehouseId} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">Any source warehouse</option>
          {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouseLabel(warehouse)}</option>)}
        </select>
        <select name="toWarehouseId" defaultValue={toWarehouseId} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">Any destination warehouse</option>
          {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouseLabel(warehouse)}</option>)}
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Transfer Number</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">From Warehouse</th>
                <th className="px-5 py-4">To Warehouse</th>
                <th className="px-5 py-4">Item Count</th>
                <th className="px-5 py-4">Requested</th>
                <th className="px-5 py-4">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {transfers.map((transfer) => (
                <tr key={transfer.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4">
                    <Link href={`/admin/stock-transfers/${transfer.id}`} className="text-sm font-black text-[#ef3338] hover:underline">
                      {transfer.transferNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(transfer.status)}`}>{label(transfer.status)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#344054]">{warehouseLabel(transfer.fromWarehouse)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#344054]">{warehouseLabel(transfer.toWarehouse)}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{transfer._count.items}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(transfer.requestedAt)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(transfer.updatedAt)}</td>
                </tr>
              ))}
              {!transfers.length ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No stock transfers found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Transfers will appear here after BMS sync or future transfer setup.</p>
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
