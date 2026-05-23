import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/db";
import { CATALOG_MANAGE_ROLES, categoryInclude, serializeCategory } from "../../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import CategoryForm from "../CategoryForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function flattenCategories(categories, parentId = null, depth = 0) {
  return categories
    .filter((category) => category.parentId === parentId)
    .flatMap((category) => [
      { id: category.id, label: `${"— ".repeat(depth)}${category.name}` },
      ...flattenCategories(categories, category.id, depth + 1),
    ]);
}

function descendantIds(categories, id) {
  const children = categories.filter((category) => category.parentId === id);
  return children.flatMap((child) => [child.id, ...descendantIds(categories, child.id)]);
}

export default async function EditCategoryPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);
  const { id } = await params;

  const [category, categories] = await prisma.$transaction([
    prisma.category.findUnique({ where: { id }, include: categoryInclude() }),
    prisma.category.findMany({ select: { id: true, name: true, parentId: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  if (!category) notFound();

  const blocked = new Set([id, ...descendantIds(categories, id)]);
  const parentOptions = flattenCategories(categories.filter((item) => !blocked.has(item.id)));

  return <CategoryForm mode="edit" category={serializeCategory(category)} parentOptions={parentOptions} canManage={canManage} />;
}
