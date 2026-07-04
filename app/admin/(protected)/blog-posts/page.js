import Link from "next/link";
import { prisma } from "../../../../lib/db";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const statuses = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/blog-posts?${next.toString()}`;
}

function statusClass(status) {
  if (status === "PUBLISHED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "ARCHIVED") return "bg-gray-100 text-gray-600 ring-gray-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function formatDate(value) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleDateString("en-GB");
}

export default async function AdminBlogPostsPage({ searchParams }) {
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
  const categoryId = params.get("categoryId") || "";
  const featured = params.get("featured") || "";
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Blog Posts</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view blog posts.</p>
      </div>
    );
  }

  const where = {
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status && statuses.includes(status) ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(featured === "true" ? { featured: true } : {}),
  };

  const [posts, total, categories] = await prisma.$transaction([
    prisma.blogPost.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.blogPost.count({ where }),
    prisma.blogCategory.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Blog CMS</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Blog Posts</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Create and manage database-backed editorial posts.</p>
          </div>
          {canManage ? (
            <Link href="/admin/blog-posts/new" className="inline-flex h-11 items-center rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)]">
              Add Blog Post
            </Link>
          ) : (
            <span className="inline-flex h-11 items-center rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-black text-amber-700">Read-only</span>
          )}
        </div>
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm md:grid-cols-[1.4fr_1fr_180px_180px_auto]">
        <input name="q" defaultValue={query} placeholder="Search title, slug, excerpt" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="categoryId" defaultValue={categoryId} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select name="featured" defaultValue={featured} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All posts</option>
          <option value="true">Featured only</option>
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Post</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Featured</th>
                <th className="px-5 py-4">Published</th>
                <th className="px-5 py-4">Author</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {posts.map((post) => (
                <tr key={post.id} className="transition hover:bg-red-50/40">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={post.featuredImage || "/jpspare-logo.png"} alt={post.title} className="size-14 rounded-xl border border-[#e5e7eb] object-cover" />
                      <div>
                        <Link href={`/admin/blog-posts/${post.id}`} className="font-black text-[#111827] hover:text-[#ef3338]">
                          {post.title}
                        </Link>
                        <p className="mt-1 max-w-sm truncate text-xs font-bold text-[#667085]">{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#344054]">{post.category?.name || "No category"}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(post.status)}`}>{post.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    {post.featured ? <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-[#ef3338] ring-1 ring-red-200">Featured</span> : <span className="text-sm font-bold text-[#98a2b3]">No</span>}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(post.publishedAt)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#344054]">{post.authorName || "JPSPARE"}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/blog-posts/${post.id}`} className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                      {canManage ? "Edit" : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
              {!posts.length ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No blog posts found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Create your first editorial post or change filters.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[#667085]">
          Page <span className="font-black text-[#111827]">{page}</span> of <span className="font-black text-[#111827]">{totalPages}</span> • {total} blog posts
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
