import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/db";
import { PRODUCT_WRITE_ROLES, productInclude, serializeProduct } from "../../../../../lib/admin/productPayload";
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

export default async function EditProductPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, PRODUCT_WRITE_ROLES);
  const { id } = await params;

  const [product, categories, brands] = await prisma.$transaction([
    prisma.product.findUnique({ where: { id }, include: productInclude() }),
    prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true, parentId: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.brand.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return <ProductForm mode="edit" product={serializeProduct(product)} categories={flattenCategories(categories)} brands={brands} canManage={canManage} />;
}
