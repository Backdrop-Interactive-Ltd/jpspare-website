import Link from "next/link";
import { prisma } from "../../../../lib/db";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import {
  PURCHASE_MANAGE_ROLES,
  PURCHASE_READ_ROLES,
  PURCHASE_STATUSES,
  purchaseInclude,
  serializePurchase,
} from "../../../../lib/admin/purchasePayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/purchases?${next.toString()}`;
}

function statusClass(status) {
  if (status === "RECEIVED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "CANCELLED") return "bg-gray-100 text-gray-600 ring-gray-200";
  if (status === "ORDERED") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "PARTIALLY_RECEIVED") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-red-50 text-[#ef3338] ring-red-200";
}

function formatStatus(status) {
  return String(status || "").replaceAll("_", " ");
}

function currency(value) {
  return `Tk ${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AdminPurchasesPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, PURCHASE_READ_ROLES);
  const canManage = hasRole(user, PURCHASE_MANAGE_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const query = params.get("q") || "";
  const status = params.get("status") || "";
  const supplierId = params.get("supplierId") || "";
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Purchases</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view purchase orders.</p>
      </div>
    );
  }

  const where = {
    ...(query
      ? {
          OR: [
            { purchaseNumber: { contains: query, mode: "insensitive" } },
            { externalPurchaseId: { contains: query, mode: "insensitive" } },
            { supplier: { name: { contains: query, mode: "insensitive" } } },
            { supplier: { companyName: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(status && status !== "ALL" ? { status } : {}),
    ...(supplierId ? { supplierId } : {}),
  };

  const [purchasesRaw, total, suppliers] = await prisma.$transaction([
    prisma.purchaseOrder.findMany({
      where,
      include: purchaseInclude(),
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.purchaseOrder.count({ where }),
    prisma.supplier.findMany({
      select: { id: true, name: true, companyName: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const purchases = purchasesRaw.map(serializePurchase);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Supplier & Purchase Management</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Purchase Orders</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Create supplier purchase orders and receive stock into inventory with full movement history.</p>
          </div>
          {canManage ? (
            <Link href="/admin/purchases/new" className="inline-flex h-11 items-center rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)]">
              Create Purchase
            </Link>
          ) : (
            <span className="inline-flex h-11 items-center rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-black text-amber-700">Read-only</span>
          )}
        </div>
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm lg:grid-cols-[1fr_220px_260px_auto]">
        <input name="q" defaultValue={query} placeholder="Search PO number, supplier, external ID" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          {PURCHASE_STATUSES.map((item) => (
            <option key={item} value={item}>
              {formatStatus(item)}
            </option>
          ))}
        </select>
        <select name="supplierId" defaultValue={supplierId} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All suppliers</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}{supplier.companyName ? ` · ${supplier.companyName}` : ""}
            </option>
          ))}
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Purchase</th>
                <th className="px-5 py-4">Supplier</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Sync</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4">
                    <Link href={`/admin/purchases/${purchase.id}`} className="font-black text-[#111827] hover:text-[#ef3338]">
                      {purchase.purchaseNumber}
                    </Link>
                    <p className="mt-1 text-xs font-bold text-[#667085]">{purchase.externalPurchaseId || purchase.source || "LOCAL"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-black text-[#111827]">{purchase.supplier?.name || "No supplier"}</p>
                    <p className="mt-1 text-xs font-bold text-[#667085]">{purchase.supplier?.companyName || "—"}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{purchase.items?.length || 0}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#ef3338]">{currency(purchase.total)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(purchase.status)}`}>{formatStatus(purchase.status)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{purchase.syncStatus || "LOCAL"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{new Date(purchase.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/purchases/${purchase.id}`} className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                      {canManage ? "Edit" : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
              {!purchases.length ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No purchase orders found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Create a purchase order to receive supplier stock.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[#667085]">
          Page <span className="font-black text-[#111827]">{page}</span> of <span className="font-black text-[#111827]">{totalPages}</span> • {total} purchases
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
