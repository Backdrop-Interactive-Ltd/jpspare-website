import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const WAREHOUSE_STATUSES = ["ACTIVE", "INACTIVE"];

function clean(value) {
  return String(value || "").trim();
}

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/warehouses?${next.toString()}`;
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
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function metricCard(cardLabel, value, tone = "default") {
  const toneClass =
    tone === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
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

export default async function AdminWarehousesPage({ searchParams }) {
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
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Warehouses</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view warehouse data.</p>
      </div>
    );
  }

  const where = {
    ...(status && WAREHOUSE_STATUSES.includes(status) ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [warehouses, total, totalWarehouses, activeWarehouses, totalLocations, totalBins] = await prisma.$transaction([
    prisma.warehouse.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            locations: true,
            bins: true,
          },
        },
      },
    }),
    prisma.warehouse.count({ where }),
    prisma.warehouse.count(),
    prisma.warehouse.count({ where: { status: "ACTIVE" } }),
    prisma.warehouseLocation.count(),
    prisma.stockBin.count(),
  ]);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">BMS Warehouse Foundation</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Warehouses</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only warehouse, location, and bin visibility before stock operations are enabled.</p>
          </div>
          <Link href="/api/admin/warehouses" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
            API Summary
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCard("Total warehouses", totalWarehouses)}
        {metricCard("Active warehouses", activeWarehouses, activeWarehouses ? "success" : "default")}
        {metricCard("Total locations", totalLocations, "info")}
        {metricCard("Total bins", totalBins, "info")}
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_auto]">
        <input name="search" defaultValue={search} placeholder="Search by name or code" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          {WAREHOUSE_STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Locations</th>
                <th className="px-5 py-4">Bins</th>
                <th className="px-5 py-4">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {warehouses.map((warehouse) => (
                <tr key={warehouse.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4">
                    <Link href={`/admin/warehouses/${warehouse.id}`} className="text-sm font-black text-[#ef3338] hover:underline">
                      {warehouse.code}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-black text-[#111827]">{warehouse.name}</p>
                    <p className="mt-1 text-xs font-bold text-[#667085]">{warehouse.externalId || "No external ID"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(warehouse.status)}`}>{label(warehouse.status)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{warehouse._count.locations}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{warehouse._count.bins}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(warehouse.updatedAt)}</td>
                </tr>
              ))}
              {!warehouses.length ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No warehouses found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Warehouse records will appear here after BMS sync or future warehouse setup.</p>
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
