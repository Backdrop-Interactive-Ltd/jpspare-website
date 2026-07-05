import Link from "next/link";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { prisma } from "../../../../lib/db";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const templateCategories = ["TRANSACTIONAL", "MARKETING", "AUTH", "ORDER", "SHIPPING", "SUPPORT", "NEWSLETTER"];

function buildHref(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
  });
  return `/admin/email-templates?${next.toString()}`;
}

function label(value) {
  return String(value || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString("en-GB");
}

function categoryClass(category) {
  if (category === "MARKETING" || category === "NEWSLETTER") return "bg-purple-50 text-purple-700 ring-purple-200";
  if (category === "AUTH") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (category === "ORDER" || category === "SHIPPING") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (category === "SUPPORT") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-red-50 text-[#ef3338] ring-red-100";
}

function successRate(total, failures) {
  if (!total) return "0%";
  return `${Math.round(((total - failures) / total) * 100)}%`;
}

export default async function AdminEmailTemplatesPage({ searchParams }) {
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
  const category = params.get("category") || "";
  const active = params.get("active") || "";
  const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
  const limit = 20;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Email Templates</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view email templates.</p>
      </div>
    );
  }

  const where = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { subject: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(category && templateCategories.includes(category) ? { category } : {}),
    ...(active === "active" ? { isActive: true } : {}),
    ...(active === "inactive" ? { isActive: false } : {}),
  };

  const [templates, total] = await prisma.$transaction([
    prisma.emailTemplate.findMany({
      where,
      orderBy: [{ category: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.emailTemplate.count({ where }),
  ]);
  const templateIds = templates.map((template) => template.id);
  const [sendRows, failureRows, lastSentRows] = templateIds.length
    ? await Promise.all([
        prisma.emailDeliveryLog.groupBy({
          by: ["templateId"],
          where: { templateId: { in: templateIds } },
          _count: { _all: true },
        }),
        prisma.emailDeliveryLog.groupBy({
          by: ["templateId"],
          where: { templateId: { in: templateIds }, status: "FAILED" },
          _count: { _all: true },
        }),
        prisma.emailDeliveryLog.groupBy({
          by: ["templateId"],
          where: { templateId: { in: templateIds }, status: "SENT" },
          _max: { sentAt: true },
        }),
      ])
    : [[], [], []];
  const sendsByTemplate = new Map(sendRows.map((row) => [row.templateId, row._count._all]));
  const failuresByTemplate = new Map(failureRows.map((row) => [row.templateId, row._count._all]));
  const lastSentByTemplate = new Map(lastSentRows.map((row) => [row.templateId, row._max.sentAt]));
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Messaging CMS</p>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Email Templates</h1>
            <p className="mt-2 text-sm font-semibold text-[#667085]">Manage reusable email content. Sending, preview, and delivery logs are not wired in this task.</p>
          </div>
          {canManage ? (
            <Link href="/admin/email-templates/new" className="inline-flex h-11 items-center rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)]">
              Add Template
            </Link>
          ) : (
            <span className="inline-flex h-11 items-center rounded-xl border border-amber-200 bg-amber-50 px-5 text-sm font-black text-amber-700">Read-only</span>
          )}
        </div>
      </section>

      <form className="grid gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_180px_auto]">
        <input name="q" defaultValue={query} placeholder="Search name, slug, or subject" className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
        <select name="category" defaultValue={category} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All categories</option>
          {templateCategories.map((item) => <option key={item} value={item}>{label(item)}</option>)}
        </select>
        <select name="active" defaultValue={active} className="h-11 rounded-xl border border-[#d0d5dd] px-4 text-sm font-bold outline-none focus:border-[#ef3338]">
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Filter</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1500px] w-full text-left">
            <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Template</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Total Sends</th>
                <th className="px-5 py-4">Failures</th>
                <th className="px-5 py-4">Success Rate</th>
                <th className="px-5 py-4">Last Sent</th>
                <th className="px-5 py-4">Updated</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {templates.map((template) => {
                const totalSends = sendsByTemplate.get(template.id) || 0;
                const totalFailures = failuresByTemplate.get(template.id) || 0;

                return (
                  <tr key={template.id} className="transition hover:bg-red-50/40">
                    <td className="px-5 py-4">
                      <Link href={`/admin/email-templates/${template.id}`} className="font-black text-[#111827] hover:text-[#ef3338]">{template.name}</Link>
                      <p className="mt-1 max-w-sm truncate text-xs font-bold text-[#667085]">{template.slug}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${categoryClass(template.category)}`}>{label(template.category)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="max-w-md truncate text-sm font-bold text-[#344054]">{template.subject}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${template.isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                        {template.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-[#111827]">{totalSends}</td>
                    <td className="px-5 py-4 text-sm font-black text-[#b42318]">{totalFailures}</td>
                    <td className="px-5 py-4 text-sm font-black text-[#111827]">{successRate(totalSends, totalFailures)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(lastSentByTemplate.get(template.id))}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDate(template.updatedAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/email-templates/${template.id}`} className="rounded-xl border border-[#d0d5dd] px-4 py-2 text-sm font-black text-[#344054] hover:border-[#ef3338] hover:text-[#ef3338]">
                        {canManage ? "Edit" : "View"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {!templates.length ? (
                <tr>
                  <td colSpan="10" className="px-5 py-16 text-center">
                    <p className="text-lg font-black text-[#111827]">No email templates found</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Create the first template or change filters.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[#667085]">
          Page <span className="font-black text-[#111827]">{page}</span> of <span className="font-black text-[#111827]">{totalPages}</span> • {total} templates
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
