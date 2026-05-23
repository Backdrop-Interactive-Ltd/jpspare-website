import { prisma } from "../../../../../lib/db";
import { CATALOG_MANAGE_ROLES } from "../../../../../lib/admin/catalogPayload";
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

export default async function NewCategoryPage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);
  const categories = await prisma.category.findMany({ select: { id: true, name: true, parentId: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });

  return <CategoryForm mode="new" parentOptions={flattenCategories(categories)} canManage={canManage} />;
}
