import Link from "next/link";
import { prisma } from "../../../../lib/db";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES, categoryInclude, serializeCategory } from "../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import SeedFrontendCategoriesButton from "./SeedFrontendCategoriesButton";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/categories?${next.toString()}`;
}

function statusClass(isActive) {
  return isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-gray-100 text-gray-600 ring-gray-200";
}

export default async function AdminCategoriesPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);
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
        <h1 className="text-2xl font-black text-[#111827]">Categories</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view categories.</p>
      </div>
    );
  }

  const where = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status === "active" ? { isActive: true } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
  };

  const [categoriesRaw, total] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      include: categoryInclude(),
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.category.count({ where }),
  ]);

  const categories = categoriesRaw.map(serializeCategory);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Catalog Management</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Categories</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Nested category tree, menu visibility, SEO, and future ERP/BMS mapping.</p>
          </div>
          {canManage ? (
            <Link href="/admin/categories/new" className="inline-flex h-11 items-center rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)]">
              Add Category
            </Link>
          ) : (
            <span className="inline-flex h-11 items-center rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-black text-amber-700">Read-only</span>
          )}
        </div>
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
        <input name="q" defaultValue={query} placeholder="Search category name, slug, description" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      {canManage ? <SeedFrontendCategoriesButton /> : null}

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Parent</th>
                <th className="px-5 py-4">Slug</th>
                <th className="px-5 py-4">Products</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {categories.map((category) => (
                <tr key={category.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={category.iconUrl || category.thumbnailUrl || "/jpspare-logo.png"} alt={category.name} className="size-12 rounded-xl border border-[#e5e7eb] object-cover" />
                      <div>
                        <Link href={`/admin/categories/${category.id}`} className="font-black text-[#111827] hover:text-[#ef3338]">
                          {category.name}
                        </Link>
                        <p className="mt-1 text-xs font-bold text-[#667085]">{category.children?.length || 0} child categories</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#344054]">{category.parent?.name || "Root"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{category.slug}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{category._count?.products || 0}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(category.isActive)}`}>{category.isActive ? "Active" : "Inactive"}</span>
                    {category.isFeatured ? <span className="ml-2 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-[#ef3338] ring-1 ring-red-200">Featured</span> : null}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{new Date(category.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/categories/${category.id}`} className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                      {canManage ? "Edit" : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
              {!categories.length ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No categories found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Create your first catalog category or change filters.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[#667085]">
          Page <span className="font-black text-[#111827]">{page}</span> of <span className="font-black text-[#111827]">{totalPages}</span> • {total} categories
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
