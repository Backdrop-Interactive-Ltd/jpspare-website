import { prisma } from "../../../../../lib/db";
import { PRODUCT_WRITE_ROLES } from "../../../../../lib/admin/productPayload";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function flattenCategories(categories, parentId = null, depth = 0) {
  return categories
    .filter((category) => category.parentId === parentId)
    .flatMap((category) => [
      { id: category.id, name: `${"-- ".repeat(depth)}${category.name}` },
      ...flattenCategories(categories, category.id, depth + 1),
    ]);
}

export default async function NewProductPage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, PRODUCT_WRITE_ROLES);

  const [categories, brands] = await prisma.$transaction([
    prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true, parentId: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.brand.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return <ProductForm mode="new" categories={flattenCategories(categories)} brands={brands} canManage={canManage} />;
}
