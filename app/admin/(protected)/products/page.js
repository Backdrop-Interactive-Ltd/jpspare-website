import Link from "next/link";
import { prisma } from "../../../../lib/db";
import { PRODUCT_READ_ROLES, PRODUCT_WRITE_ROLES, productInclude, serializeProduct } from "../../../../lib/admin/productPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TOP_SELLING_ORDER_STATUSES = ["DELIVERED"];

function money(value) {
  const number = Number(value || 0);
  return `৳${number.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/products?${next.toString()}`;
}

function getThumbnail(product) {
  return product.images?.find((image) => image.isThumbnail)?.url || product.images?.[0]?.url || product.media?.[0]?.media?.url || "/jpspare-logo.png";
}

function statusClass(status) {
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "ARCHIVED") return "bg-gray-100 text-gray-600 ring-gray-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function stockStatusForFilter(filter) {
  if (filter === "low-stock") return "LOW_STOCK";
  if (filter === "out-of-stock") return "OUT_OF_STOCK";
  return null;
}

function isTopSellingSort(sort) {
  return sort === "top-selling";
}

async function getTopSellingProducts({ where, page, limit }) {
  const salesWhere = {
    productId: { not: null },
    order: { status: { in: TOP_SELLING_ORDER_STATUSES } },
    product: { is: where },
  };

  const [groups, allGroups, categories, brands] = await prisma.$transaction([
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: salesWhere,
      _sum: { quantity: true },
      orderBy: [{ _sum: { quantity: "desc" } }, { productId: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: salesWhere,
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const productIds = groups.map((group) => group.productId).filter(Boolean);
  const productsRaw = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: productInclude(),
      })
    : [];
  const productById = new Map(productsRaw.map((product) => [product.id, product]));
  const soldById = new Map(groups.map((group) => [group.productId, Number(group._sum.quantity || 0)]));
  const products = productIds
    .map((productId) => productById.get(productId))
    .filter(Boolean)
    .map((product) => ({ ...serializeProduct(product), totalSold: soldById.get(product.id) || 0 }));

  return {
    products,
    total: allGroups.length,
    categories,
    brands,
  };
}

export default async function AdminProductsPage({ searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, PRODUCT_READ_ROLES);
  const canManage = hasRole(user, PRODUCT_WRITE_ROLES);
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedParams || {}).forEach(([key, value]) => {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  });

  const query = params.get("q") || "";
  const categoryId = params.get("categoryId") || "";
  const brandId = params.get("brandId") || "";
  const status = params.get("status") || "";
  const filter = params.get("filter") || "";
  const sort = params.get("sort") || "";
  const topSelling = isTopSellingSort(sort);
  const stockStatus = stockStatusForFilter(filter);
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 12;

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
    ...(categoryId ? { categoryId } : {}),
    ...(brandId ? { brandId } : {}),
    ...(status ? { status } : {}),
    ...(stockStatus ? { stockStatus } : {}),
  };

  const productResult = topSelling
    ? await getTopSellingProducts({ where, page, limit })
    : await prisma.$transaction([
        prisma.product.findMany({
          where,
          include: productInclude(),
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.product.count({ where }),
        prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
        prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      ]).then(([productsRaw, total, categories, brands]) => ({
        products: productsRaw.map(serializeProduct),
        total,
        categories,
        brands,
      }));

  const { products, total, categories, brands } = productResult;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const tableColumnCount = topSelling ? 10 : 9;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Products</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view products.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Catalog Management</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">{topSelling ? "Top Selling Products" : "Products"}</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Search, filter, and manage product inventory for ERP/BMS-ready catalog sync.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="h-11 rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              Bulk Actions
            </button>
            {canManage ? (
              <Link href="/admin/products/new" className="inline-flex h-11 items-center rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)]">
                Add Product
              </Link>
            ) : (
              <span className="inline-flex h-11 items-center rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-black text-amber-700">Read-only</span>
            )}
          </div>
        </div>
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm md:grid-cols-[1.4fr_1fr_1fr_220px_auto]">
        {filter ? <input type="hidden" name="filter" value={filter} /> : null}
        {sort ? <input type="hidden" name="sort" value={sort} /> : null}
        <input name="q" defaultValue={query} placeholder="Search products, SKU, barcode" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="categoryId" defaultValue={categoryId} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select name="brandId" defaultValue={brandId} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          <option value="ACTIVE">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4"><input type="checkbox" className="size-4 accent-[#ef3338]" /></th>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">SKU</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Stock</th>
                {topSelling ? <th className="px-5 py-4">Sold</th> : null}
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Featured</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {products.map((product) => (
                <tr key={product.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4"><input type="checkbox" className="size-4 accent-[#ef3338]" /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={getThumbnail(product)} alt={product.title} className="size-14 rounded-xl border border-[#e5e7eb] object-cover" />
                      <div>
                        <Link href={`/admin/products/${product.id}`} className="font-black text-[#111827] hover:text-[#ef3338]">
                          {product.title}
                        </Link>
                        <p className="mt-1 text-xs font-bold text-[#667085]">{product.category?.name || "Uncategorized"} • {product.brand?.name || "No brand"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#344054]">{product.sku || "—"}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#ef3338]">{money(product.discountPrice || product.price)}</td>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{product.stockQuantity}</td>
                  {topSelling ? <td className="px-5 py-4 text-sm font-black text-[#111827]">{product.totalSold || 0}</td> : null}
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(product.status)}`}>{product.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    {product.isFeatured ? <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-[#ef3338] ring-1 ring-red-200">Featured</span> : <span className="text-sm font-bold text-[#98a2b3]">No</span>}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{new Date(product.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/products/${product.id}`} className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                      {canManage ? "Edit" : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
              {!products.length ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No products found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Try changing filters or create your first product.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[#667085]">
          Page <span className="font-black text-[#111827]">{page}</span> of <span className="font-black text-[#111827]">{totalPages}</span> • {total} products
        </p>
        <div className="flex gap-2">
          <Link aria-disabled={page <= 1} href={page <= 1 ? "#" : buildHref(params, { page: page - 1 })} className={`rounded-xl px-4 py-2 text-sm font-black ${page <= 1 ? "pointer-events-none bg-[#f2f4f7] text-[#98a2b3]" : "border border-[#d0d5dd] text-[#344054]"}`}>
            Previous
          </Link>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map((itemPage) => (
            <Link key={itemPage} href={buildHref(params, { page: itemPage })} className={`grid size-10 place-items-center rounded-xl text-sm font-black ${itemPage === page ? "bg-[#ef3338] text-white" : "border border-[#d0d5dd] text-[#344054]"}`}>
              {itemPage}
            </Link>
          ))}
          <Link aria-disabled={page >= totalPages} href={page >= totalPages ? "#" : buildHref(params, { page: page + 1 })} className={`rounded-xl px-4 py-2 text-sm font-black ${page >= totalPages ? "pointer-events-none bg-[#f2f4f7] text-[#98a2b3]" : "bg-[#ef3338] text-white"}`}>
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
