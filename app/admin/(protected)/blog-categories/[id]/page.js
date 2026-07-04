import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/db";
import { CATALOG_MANAGE_ROLES } from "../../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import BlogCategoryForm from "../BlogCategoryForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeBlogCategory(category) {
  if (!category) return null;
  return {
    ...category,
    createdAt: category.createdAt?.toISOString?.() ?? category.createdAt,
    updatedAt: category.updatedAt?.toISOString?.() ?? category.updatedAt,
  };
}

export default async function EditBlogCategoryPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);
  const { id } = await params;

  const category = await prisma.blogCategory.findUnique({
    where: { id },
    include: { _count: { select: { posts: true } } },
  });
  if (!category) notFound();

  return <BlogCategoryForm mode="edit" category={serializeBlogCategory(category)} canManage={canManage} />;
}
