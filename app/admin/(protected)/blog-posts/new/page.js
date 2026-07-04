import { CATALOG_MANAGE_ROLES } from "../../../../../lib/admin/catalogPayload";
import { prisma } from "../../../../../lib/db";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import BlogPostForm from "../BlogPostForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function NewBlogPostPage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);
  const categories = await prisma.blogCategory.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return <BlogPostForm mode="new" categories={categories} canManage={canManage} />;
}
