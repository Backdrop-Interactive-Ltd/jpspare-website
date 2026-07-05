import Link from "next/link";
import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function clean(value) {
  return String(value || "").trim();
}

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/warehouse-stock?${next.toString()}`;
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

function metricCard(label, value, tone = "default") {
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
      <p className="text-xs font-black uppercase tracking-[0.12em] opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function stockTone(available) {
  if (available <= 0) return "text-[#ef3338]";
  if (available <= 5) return "text-amber-700";
  return "text-emerald-700";
}

export default async function AdminWarehouseStockPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const search = clean(params.get("search"));
  const warehouseId = clean(params.get("warehouseId"));
  const lowAvailability = params.get("lowAvailability") === "1";
  const outOfStock = params.get("outOfStock") === "1";
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Warehouse Stock</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view warehouse stock.</p>
      </div>
    );
  }

  const where = {
    ...(warehouseId ? { warehouseId } : {}),
    ...(search
      ? {
          product: {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          },
        }
      : {}),
    ...(outOfStock ? { available: { lte: 0 } } : {}),
    ...(lowAvailability && !outOfStock ? { available: { gt: 0, lte: 5 } } : {}),
  };

  const [stock, total, totals, warehouses, warehousesWithStock, productsWithStock] = await Promise.all([
    prisma.warehouseStock.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            sku: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        bin: {
          select: {
            id: true,
            code: true,
          },
        },
      },
    }),
    prisma.warehouseStock.count({ where }),
    prisma.warehouseStock.aggregate({
      _sum: {
        onHand: true,
        reserved: true,
        available: true,
      },
      _count: {
        _all: true,
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
    prisma.warehouseStock.findMany({
      distinct: ["warehouseId"],
      select: { warehouseId: true },
    }),
    prisma.warehouseStock.findMany({
      distinct: ["productId"],
      select: { productId: true },
    }),
  ]);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">BMS Warehouse Foundation</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Warehouse Stock</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only stock rows by product, warehouse, location, and bin before transfer operations are enabled.</p>
          </div>
          <Link href="/api/admin/warehouse-stock" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
            API Summary
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {metricCard("Stock rows", totals._count._all || 0)}
        {metricCard("On hand", totals._sum.onHand || 0, "success")}
        {metricCard("Reserved", totals._sum.reserved || 0, "warning")}
        {metricCard("Available", totals._sum.available || 0, "info")}
        {metricCard("Warehouses", warehousesWithStock.length)}
        {metricCard("Products", productsWithStock.length)}
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm lg:grid-cols-[1fr_240px_170px_170px_auto]">
        <input name="search" defaultValue={search} placeholder="Search product name or SKU" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="warehouseId" defaultValue={warehouseId} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All warehouses</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>{warehouse.code} - {warehouse.name}</option>
          ))}
        </select>
        <label className="flex h-11 items-center gap-2 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold text-[#344054]">
          <input type="checkbox" name="lowAvailability" value="1" defaultChecked={lowAvailability} className="h-4 w-4 rounded border-[#d0d5dd]" />
          Low availability
        </label>
        <label className="flex h-11 items-center gap-2 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold text-[#344054]">
          <input type="checkbox" name="outOfStock" value="1" defaultChecked={outOfStock} className="h-4 w-4 rounded border-[#d0d5dd]" />
          Out of stock
        </label>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1280px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">SKU</th>
                <th className="px-5 py-4">Warehouse</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Bin</th>
                <th className="px-5 py-4">On Hand</th>
                <th className="px-5 py-4">Reserved</th>
                <th className="px-5 py-4">Available</th>
                <th className="px-5 py-4">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {stock.map((row) => (
                <tr key={row.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4">
                    {row.product ? (
                      <Link href={`/admin/products/${row.product.id}`} className="text-sm font-black text-[#ef3338] hover:underline">
                        {row.product.title}
                      </Link>
                    ) : (
                      <span className="text-sm font-bold text-[#667085]">Unknown product</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{row.product?.sku || "No SKU"}</td>
                  <td className="px-5 py-4">
                    {row.warehouse ? (
                      <Link href={`/admin/warehouses/${row.warehouse.id}`} className="text-sm font-black text-[#111827] hover:text-[#ef3338]">
                        {row.warehouse.code} - {row.warehouse.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-bold text-[#667085]">No warehouse</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{row.location ? `${row.location.code} - ${row.location.name}` : "No location"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{row.bin?.code || "No bin"}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{row.onHand}</td>
                  <td className="px-5 py-4 text-sm font-black text-amber-700">{row.reserved}</td>
                  <td className={`px-5 py-4 text-sm font-black ${stockTone(row.available)}`}>{row.available}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(row.updatedAt)}</td>
                </tr>
              ))}
              {!stock.length ? (
                <tr>
                  <td colSpan="9" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No warehouse stock rows found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Warehouse stock records will appear here after BMS sync or future stock operations.</p>
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
