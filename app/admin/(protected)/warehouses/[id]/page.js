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
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
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

export default async function AdminWarehouseDetailPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const { id } = await params;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Warehouse Detail</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view warehouse data.</p>
      </div>
    );
  }

  const warehouse = await prisma.warehouse.findUnique({
    where: { id },
  });

  if (!warehouse) notFound();

  const [locations, bins, stockAggregate, stockCount, incomingTransfers, outgoingTransfers] = await Promise.all([
    prisma.warehouseLocation.findMany({
      where: { warehouseId: id },
      orderBy: [{ code: "asc" }],
      include: {
        _count: {
          select: {
            bins: true,
            stocks: true,
          },
        },
      },
    }),
    prisma.stockBin.findMany({
      where: { warehouseId: id },
      orderBy: [{ code: "asc" }],
      include: {
        location: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            stocks: true,
          },
        },
      },
    }),
    prisma.warehouseStock.aggregate({
      where: { warehouseId: id },
      _sum: {
        onHand: true,
        reserved: true,
        available: true,
      },
    }),
    prisma.warehouseStock.count({ where: { warehouseId: id } }),
    prisma.stockTransfer.count({ where: { toWarehouseId: id } }),
    prisma.stockTransfer.count({ where: { fromWarehouseId: id } }),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Warehouse Summary</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">{warehouse.name}</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">{warehouse.code} • {warehouse.externalId || "No external ID"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(warehouse.status)}`}>{label(warehouse.status)}</span>
            <Link href="/admin/warehouses" className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
              Back to Warehouses
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Address & Contact</h2>
          <dl className="mt-4 grid gap-4 text-sm font-bold text-[#667085] sm:grid-cols-2">
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Address</dt>
              <dd className="mt-1 text-[#111827]">{warehouse.address || "Not recorded"}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Contact Name</dt>
              <dd className="mt-1 text-[#111827]">{warehouse.contactName || "Not recorded"}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Contact Phone</dt>
              <dd className="mt-1 text-[#111827]">{warehouse.contactPhone || "Not recorded"}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Source</dt>
              <dd className="mt-1 text-[#111827]">{warehouse.source || "Local"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#111827]">Sync</h2>
          <dl className="mt-4 space-y-4 text-sm font-bold text-[#667085]">
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Sync Status</dt>
              <dd className="mt-1 text-[#111827]">{warehouse.syncStatus ? label(warehouse.syncStatus) : "Not recorded"}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Last Synced</dt>
              <dd className="mt-1 text-[#111827]">{formatDate(warehouse.lastSyncedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#98a2b3]">Updated</dt>
              <dd className="mt-1 text-[#111827]">{formatDate(warehouse.updatedAt)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {metricCard("Locations", locations.length)}
        {metricCard("Bins", bins.length)}
        {metricCard("Stock rows", stockCount, "info")}
        {metricCard("On hand", stockAggregate._sum.onHand || 0, "success")}
        {metricCard("Reserved", stockAggregate._sum.reserved || 0, "warning")}
        {metricCard("Available", stockAggregate._sum.available || 0, "info")}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {metricCard("Incoming transfers", incomingTransfers, "info")}
        {metricCard("Outgoing transfers", outgoingTransfers, "info")}
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Locations</h2>
          <p className="mt-1 text-sm font-semibold text-[#667085]">Read-only location list for this warehouse.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Zone</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Bins</th>
                <th className="px-5 py-4">Stock Rows</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {locations.map((location) => (
                <tr key={location.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{location.code}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#344054]">{location.name}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{location.type || "Not recorded"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{location.zone || "Not recorded"}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(location.status)}`}>{label(location.status)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{location._count.bins}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{location._count.stocks}</td>
                </tr>
              ))}
              {!locations.length ? (
                <tr>
                  <td colSpan="7" className="px-5 py-14 text-center">
                    <p className="text-lg font-black text-[#111827]">No locations found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Locations will appear after BMS sync or future warehouse setup.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="border-b border-[#eef0f3] p-5">
          <h2 className="text-xl font-black text-[#111827]">Bins</h2>
          <p className="mt-1 text-sm font-semibold text-[#667085]">Read-only bin list for this warehouse.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Stock Rows</th>
                <th className="px-5 py-4">Capacity</th>
                <th className="px-5 py-4">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {bins.map((bin) => (
                <tr key={bin.id} className="align-top transition hover:bg-red-50/40">
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{bin.code}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#344054]">{bin.location ? `${bin.location.code} - ${bin.location.name}` : "No location"}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(bin.status)}`}>{label(bin.status)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{bin._count.stocks}</td>
                  <td className="px-5 py-4">
                    <pre className="max-h-28 max-w-xs overflow-auto rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-3 text-xs font-semibold text-[#344054]">
                      {bin.capacityJson ? JSON.stringify(bin.capacityJson, null, 2) : "No capacity data"}
                    </pre>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(bin.updatedAt)}</td>
                </tr>
              ))}
              {!bins.length ? (
                <tr>
                  <td colSpan="6" className="px-5 py-14 text-center">
                    <p className="text-lg font-black text-[#111827]">No bins found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Bins will appear after BMS sync or future warehouse setup.</p>
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
