import Link from "next/link";
import { prisma } from "../../../../lib/db";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import { SUPPLIER_MANAGE_ROLES, SUPPLIER_READ_ROLES, supplierInclude, serializeSupplier } from "../../../../lib/admin/purchasePayload";
import SupplierStatusToggle from "./SupplierStatusToggle";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/suppliers?${next.toString()}`;
}

export default async function AdminSuppliersPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, SUPPLIER_READ_ROLES);
  const canManage = hasRole(user, SUPPLIER_MANAGE_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const query = params.get("q") || "";
  const status = params.get("status") || "";
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Suppliers</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view suppliers.</p>
      </div>
    );
  }

  const where = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { companyName: { contains: query, mode: "insensitive" } },
            { contactPerson: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status && status !== "ALL" ? { status } : {}),
  };

  const [suppliersRaw, total] = await prisma.$transaction([
    prisma.supplier.findMany({
      where,
      include: supplierInclude(),
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supplier.count({ where }),
  ]);

  const suppliers = suppliersRaw.map(serializeSupplier);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Purchase Management</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Suppliers</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Vendor contacts, source tracking, and ERP/BMS-ready supplier records.</p>
          </div>
          {canManage ? (
            <Link href="/admin/suppliers/new" className="inline-flex h-11 items-center rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)]">
              Add Supplier
            </Link>
          ) : (
            <span className="inline-flex h-11 items-center rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-black text-amber-700">Read-only</span>
          )}
        </div>
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
        <input name="q" defaultValue={query} placeholder="Search supplier, company, phone, email" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Supplier</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Purchases</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4">
                    <Link href={`/admin/suppliers/${supplier.id}`} className="font-black text-[#111827] hover:text-[#ef3338]">
                      {supplier.name}
                    </Link>
                    <p className="mt-1 text-xs font-bold text-[#667085]">{supplier.companyName || "No company name"}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#344054]">{supplier.contactPerson || "—"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#344054]">{supplier.phone || "—"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{supplier.email || "—"}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{supplier._count?.purchases || 0}</td>
                  <td className="px-5 py-4">
                    <SupplierStatusToggle supplier={supplier} canManage={canManage} />
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{new Date(supplier.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/suppliers/${supplier.id}`} className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                      {canManage ? "Edit" : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
              {!suppliers.length ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No suppliers found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Create suppliers before adding purchase orders.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[#667085]">
          Page <span className="font-black text-[#111827]">{page}</span> of <span className="font-black text-[#111827]">{totalPages}</span> • {total} suppliers
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
