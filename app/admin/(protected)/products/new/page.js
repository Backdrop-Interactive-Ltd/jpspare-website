import { prisma } from "../../../../../lib/db";
import { PRODUCT_WRITE_ROLES } from "../../../../../lib/admin/productPayload";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function NewProductPage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, PRODUCT_WRITE_ROLES);

  const [categories, brands] = await prisma.$transaction([
    prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return <ProductForm mode="new" categories={categories} brands={brands} canManage={canManage} />;
}
