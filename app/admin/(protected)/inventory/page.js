import Link from "next/link";
import { prisma } from "../../../../lib/db";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import {
  INVENTORY_ADJUST_ROLES,
  INVENTORY_READ_ROLES,
  serializeInventoryProduct,
  STOCK_STATUSES,
} from "../../../../lib/commerce/inventory";
import InventoryAdjustForm from "./InventoryAdjustForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/inventory?${next.toString()}`;
}

function stockStatusClass(status) {
  if (status === "IN_STOCK") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "LOW_STOCK") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-red-50 text-[#ef3338] ring-red-200";
}

function movementClass(type) {
  if (type === "STOCK_IN" || type === "ORDER_CANCELLED" || type === "RETURN_ADJUSTMENT") return "bg-emerald-50 text-emerald-700";
  if (type === "STOCK_OUT" || type === "ORDER_CONFIRMED") return "bg-red-50 text-[#ef3338]";
  if (type === "ORDER_RESERVED") return "bg-blue-50 text-blue-700";
  return "bg-amber-50 text-amber-700";
}

function formatStatus(status) {
  return String(status || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function imageFor(product) {
  return product.images?.find((image) => image.isThumbnail)?.url || product.images?.[0]?.url || product.media?.[0]?.media?.url || "/jpspare-logo.png";
}

export default async function AdminInventoryPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, INVENTORY_READ_ROLES);
  const canAdjust = hasRole(user, INVENTORY_ADJUST_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const query = params.get("q") || "";
  const status = params.get("status") || "";
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 15;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Inventory</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view inventory.</p>
      </div>
    );
  }

  const where = {
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
            { barcode: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status && status !== "ALL" ? { stockStatus: status } : {}),
  };

  const [productsRaw, total, lowStockRaw, movements] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        images: { orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }], take: 1 },
        media: { include: { media: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy: [{ stockStatus: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where: { stockStatus: { in: ["LOW_STOCK", "OUT_OF_STOCK"] } },
      include: { category: true, brand: true },
      orderBy: [{ stockQuantity: "asc" }, { updatedAt: "desc" }],
      take: 8,
    }),
    prisma.inventoryMovement.findMany({
      include: {
        product: { select: { title: true, sku: true } },
        order: { select: { orderNumber: true } },
        adminUser: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  const products = productsRaw.map(serializeInventoryProduct);
  const lowStock = lowStockRaw.map(serializeInventoryProduct);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Inventory Engine</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Stock Management</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Current, reserved, and available stock with ERP/BMS-ready movement history.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/api/admin/inventory/movements" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              API Movements
            </Link>
            <span className={`inline-flex h-11 items-center rounded-xl px-5 text-sm font-black ${canAdjust ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"}`}>
              {canAdjust ? "Adjust enabled" : "Read-only"}
            </span>
          </div>
        </div>
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm md:grid-cols-[1fr_240px_auto]">
        <input name="q" defaultValue={query} placeholder="Search product name, SKU, barcode" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All stock status</option>
          {STOCK_STATUSES.map((item) => (
            <option key={item} value={item}>
              {formatStatus(item)}
            </option>
          ))}
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left">
              <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">SKU</th>
                  <th className="px-5 py-4">Current</th>
                  <th className="px-5 py-4">Reserved</th>
                  <th className="px-5 py-4">Available</th>
                  <th className="px-5 py-4">Threshold</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Manual Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f3]">
                {products.map((product) => (
                  <tr key={product.id} className="transition hover:bg-red-50/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={imageFor(product)} alt={product.title} className="size-14 rounded-xl border border-[#e5e7eb] object-cover" />
                        <div>
                          <Link href={`/admin/products/${product.id}`} className="font-black text-[#111827] hover:text-[#ef3338]">
                            {product.title}
                          </Link>
                          <p className="mt-1 text-xs font-bold text-[#667085]">{product.category?.name || "Uncategorized"} • {product.brand?.name || "No brand"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-[#344054]">{product.sku || "—"}</td>
                    <td className="px-5 py-4 text-sm font-black text-[#111827]">{product.stockQuantity}</td>
                    <td className="px-5 py-4 text-sm font-black text-blue-700">{product.reservedStock}</td>
                    <td className="px-5 py-4 text-sm font-black text-emerald-700">{product.availableStock}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#667085]">{product.lowStockThreshold}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${stockStatusClass(product.stockStatus)}`}>{formatStatus(product.stockStatus)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <InventoryAdjustForm productId={product.id} disabled={!canAdjust} />
                    </td>
                  </tr>
                ))}
                {!products.length ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-16 text-center">
                      <p className="text-lg font-black text-[#111827]">No inventory found</p>
                      <p className="mt-2 text-sm font-semibold text-[#667085]">Change filters or add products first.</p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Low Stock Watchlist</p>
            <h2 className="mt-1 text-xl font-black text-[#111827]">Needs Attention</h2>
            <div className="mt-4 space-y-3">
              {lowStock.map((product) => (
                <Link key={product.id} href={`/admin/products/${product.id}`} className="block rounded-2xl border border-amber-200 bg-white p-3 transition hover:border-[#ef3338]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="line-clamp-1 text-sm font-black text-[#111827]">{product.title}</p>
                      <p className="mt-1 text-xs font-bold text-[#667085]">{product.sku || "No SKU"}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-black ring-1 ${stockStatusClass(product.stockStatus)}`}>{product.availableStock}</span>
                  </div>
                </Link>
              ))}
              {!lowStock.length ? <p className="rounded-2xl bg-white p-4 text-sm font-bold text-emerald-700">All products are above threshold.</p> : null}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ef3338]">Recent Movements</p>
            <h2 className="mt-1 text-xl font-black text-[#111827]">Stock History</h2>
            <div className="mt-4 space-y-3">
              {movements.map((movement) => (
                <div key={movement.id} className="rounded-2xl border border-[#eef0f3] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-black ${movementClass(movement.type)}`}>{formatStatus(movement.type)}</span>
                    <span className="text-xs font-bold text-[#98a2b3]">{new Date(movement.createdAt).toLocaleString("en-GB")}</span>
                  </div>
                  <p className="mt-2 text-sm font-black text-[#111827]">{movement.product?.title || "Deleted product"}</p>
                  <p className="mt-1 text-xs font-bold text-[#667085]">
                    Qty {movement.quantity} • {movement.previousStock}/{movement.previousReservedStock} → {movement.newStock}/{movement.newReservedStock}
                  </p>
                  {movement.order?.orderNumber ? <p className="mt-1 text-xs font-bold text-[#ef3338]">Order {movement.order.orderNumber}</p> : null}
                </div>
              ))}
              {!movements.length ? <p className="rounded-2xl bg-[#f8fafc] p-4 text-sm font-bold text-[#667085]">No stock movements yet.</p> : null}
            </div>
          </div>
        </aside>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[#667085]">
          Page <span className="font-black text-[#111827]">{page}</span> of <span className="font-black text-[#111827]">{totalPages}</span> • {total} products
        </p>
        <div className="flex gap-2">
          <Link aria-disabled={page <= 1} href={page <= 1 ? "#" : buildHref(params, { page: page - 1 })} className={`rounded-xl px-4 py-2 text-sm font-black ${page <= 1 ? "pointer-events-none bg-[#f2f4f7] text-[#98a2b3]" : "border border-[#d0d5dd] text-[#344054]"}`}>
            Previous
          </Link>
          <Link aria-disabled={page >= totalPages} href={page >= totalPages ? "#" : buildHref(params, { page: page + 1 })} className={`rounded-xl px-4 py-2 text-sm font-black ${page >= totalPages ? "pointer-events-none bg-[#f2f4f7] text-[#98a2b3]" : "bg-[#ef3338] text-white"}`}>
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
