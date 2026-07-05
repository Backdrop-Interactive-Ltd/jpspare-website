import Link from "next/link";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import { INVENTORY_READ_ROLES } from "../../../../lib/commerce/inventory";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  return Number(value) || 0;
}

function money(value) {
  return `৳${Math.round(toNumber(value)).toLocaleString("en-BD")}`;
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
      : tone === "danger"
        ? "border-red-100 bg-red-50 text-[#ef3338]"
        : tone === "warning"
          ? "border-amber-100 bg-amber-50 text-amber-700"
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

function badgeClass(value) {
  const text = String(value || "").toUpperCase();
  if (text === "HIGH" || text === "A") return "bg-red-50 text-[#ef3338] ring-red-100";
  if (text === "LOW" || text === "C") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (text === "OPEN") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-blue-50 text-blue-700 ring-blue-200";
}

function productTitle(product) {
  return product?.title || "Unknown product";
}

export default async function AdminInventoryIntelligencePage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, INVENTORY_READ_ROLES);

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Inventory Intelligence</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view inventory intelligence.</p>
      </div>
    );
  }

  const [
    totalProducts,
    stockProducts,
    lowStockProducts,
    deadStockProducts,
    openReorderSuggestions,
    activeForecasts,
    abcRows,
    velocityAggregate,
    topLowStock,
    topDeadStock,
    recentReorders,
    recentDeadStock,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({ select: { price: true, stockQuantity: true } }),
    prisma.product.count({ where: { stockStatus: { in: ["LOW_STOCK", "OUT_OF_STOCK"] } } }),
    prisma.deadStockSnapshot.count({ where: { status: "OPEN" } }),
    prisma.reorderSuggestion.count({ where: { status: "OPEN" } }),
    prisma.demandForecast.count({ where: { periodEnd: { gte: new Date() } } }),
    prisma.inventoryAnalytics.groupBy({ by: ["abcClass"], _count: { _all: true } }),
    prisma.inventoryAnalytics.aggregate({ _avg: { velocityScore: true } }),
    prisma.inventoryAnalytics.findMany({
      include: { product: { include: { category: true, brand: true } } },
      orderBy: [{ availableStock: "asc" }, { calculatedAt: "desc" }],
      take: 5,
    }),
    prisma.deadStockSnapshot.findMany({
      include: { product: { include: { category: true, brand: true } } },
      where: { status: "OPEN" },
      orderBy: [{ daysWithoutSale: "desc" }, { calculatedAt: "desc" }],
      take: 5,
    }),
    prisma.reorderSuggestion.findMany({
      include: { product: { include: { category: true, brand: true } } },
      orderBy: [{ createdAt: "desc" }],
      take: 8,
    }),
    prisma.deadStockSnapshot.findMany({
      include: { product: { include: { category: true, brand: true } } },
      orderBy: [{ calculatedAt: "desc" }],
      take: 8,
    }),
  ]);

  const totalStockValue = stockProducts.reduce((sum, product) => {
    return sum + toNumber(product.price) * (product.stockQuantity || 0);
  }, 0);
  const averageVelocityScore = velocityAggregate._avg.velocityScore || 0;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Inventory Intelligence</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Stock Health Dashboard</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Read-only foundation for analytics, reorder planning, forecasting, and dead-stock tracking.</p>
          </div>
          <Link href="/api/admin/inventory-intelligence" className="inline-flex h-11 items-center rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
            API Summary
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {metricCard("Total products", totalProducts)}
        {metricCard("Stock value", money(totalStockValue), "info")}
        {metricCard("Low stock", lowStockProducts, lowStockProducts ? "warning" : "success")}
        {metricCard("Dead stock", deadStockProducts, deadStockProducts ? "danger" : "success")}
        {metricCard("Open reorders", openReorderSuggestions, openReorderSuggestions ? "warning" : "success")}
        {metricCard("Active forecasts", activeForecasts, "info")}
      </section>

      <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#98a2b3]">Analytics Cards</p>
          <h2 className="mt-1 text-xl font-black text-[#111827]">ABC Distribution</h2>
          <div className="mt-4 space-y-3">
            {abcRows.length ? abcRows.map((row) => (
              <div key={row.abcClass || "unclassified"} className="flex items-center justify-between rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
                <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${badgeClass(row.abcClass)}`}>{row.abcClass || "Unclassified"}</span>
                <span className="text-lg font-black text-[#111827]">{row._count._all}</span>
              </div>
            )) : (
              <p className="rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No ABC analytics have been generated yet.</p>
            )}
          </div>
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-700">
            <p className="text-xs font-black uppercase tracking-[0.12em] opacity-70">Average velocity score</p>
            <p className="mt-2 text-2xl font-black">{averageVelocityScore.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Top 5</p>
            <h2 className="mt-1 text-xl font-black text-[#111827]">Low-Stock Products</h2>
            <div className="mt-4 space-y-3">
              {topLowStock.length ? topLowStock.map((item) => (
                <Link key={item.id} href={`/admin/products/${item.productId}`} className="block rounded-2xl border border-[#eef0f3] p-4 transition hover:border-[#ef3338]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="line-clamp-1 text-sm font-black text-[#111827]">{productTitle(item.product)}</p>
                      <p className="mt-1 text-xs font-bold text-[#667085]">{item.product?.sku || "No SKU"} • {item.product?.brand?.name || "No brand"}</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-200">{item.availableStock}</span>
                  </div>
                </Link>
              )) : (
                <p className="rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No low-stock analytics yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Top 5</p>
            <h2 className="mt-1 text-xl font-black text-[#111827]">Dead-Stock Products</h2>
            <div className="mt-4 space-y-3">
              {topDeadStock.length ? topDeadStock.map((item) => (
                <Link key={item.id} href={`/admin/products/${item.productId}`} className="block rounded-2xl border border-[#eef0f3] p-4 transition hover:border-[#ef3338]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="line-clamp-1 text-sm font-black text-[#111827]">{productTitle(item.product)}</p>
                      <p className="mt-1 text-xs font-bold text-[#667085]">{item.daysWithoutSale ?? 0} days without sale</p>
                    </div>
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-[#ef3338] ring-1 ring-red-100">{item.stockQuantity}</span>
                  </div>
                </Link>
              )) : (
                <p className="rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">No dead-stock snapshots yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#98a2b3]">Recent Activity</p>
          <h2 className="mt-1 text-xl font-black text-[#111827]">Latest Reorder Suggestions</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[760px] w-full text-left">
              <thead className="text-xs font-black uppercase tracking-[0.12em] text-[#667085]">
                <tr>
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 pr-4">Qty</th>
                  <th className="py-3 pr-4">Priority</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f3]">
                {recentReorders.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-4">
                      <Link href={`/admin/products/${item.productId}`} className="font-black text-[#111827] hover:text-[#ef3338]">{productTitle(item.product)}</Link>
                      <p className="mt-1 text-xs font-bold text-[#667085]">{item.reason || "No reason recorded"}</p>
                    </td>
                    <td className="py-3 pr-4 text-sm font-black text-[#111827]">{item.suggestedQuantity}</td>
                    <td className="py-3 pr-4"><span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${badgeClass(item.priority)}`}>{item.priority}</span></td>
                    <td className="py-3 pr-4"><span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${badgeClass(item.status)}`}>{item.status}</span></td>
                    <td className="py-3 pr-4 text-sm font-bold text-[#667085]">{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
                {!recentReorders.length ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-sm font-bold text-[#667085]">No reorder suggestions yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#98a2b3]">Recent Activity</p>
          <h2 className="mt-1 text-xl font-black text-[#111827]">Latest Dead-Stock Snapshots</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[760px] w-full text-left">
              <thead className="text-xs font-black uppercase tracking-[0.12em] text-[#667085]">
                <tr>
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 pr-4">Stock</th>
                  <th className="py-3 pr-4">Days</th>
                  <th className="py-3 pr-4">Value</th>
                  <th className="py-3 pr-4">Calculated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f3]">
                {recentDeadStock.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-4">
                      <Link href={`/admin/products/${item.productId}`} className="font-black text-[#111827] hover:text-[#ef3338]">{productTitle(item.product)}</Link>
                      <p className="mt-1 text-xs font-bold text-[#667085]">{item.reason || "No reason recorded"}</p>
                    </td>
                    <td className="py-3 pr-4 text-sm font-black text-[#111827]">{item.stockQuantity}</td>
                    <td className="py-3 pr-4 text-sm font-bold text-[#667085]">{item.daysWithoutSale ?? 0}</td>
                    <td className="py-3 pr-4 text-sm font-bold text-[#667085]">{money(item.estimatedValue)}</td>
                    <td className="py-3 pr-4 text-sm font-bold text-[#667085]">{formatDate(item.calculatedAt)}</td>
                  </tr>
                ))}
                {!recentDeadStock.length ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-sm font-bold text-[#667085]">No dead-stock snapshots yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
