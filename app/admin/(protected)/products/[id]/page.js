import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/db";
import { PRODUCT_WRITE_ROLES, productInclude, serializeProduct } from "../../../../../lib/admin/productPayload";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EditProductPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, PRODUCT_WRITE_ROLES);
  const { id } = await params;

  const [product, categories, brands] = await prisma.$transaction([
    prisma.product.findUnique({ where: { id }, include: productInclude() }),
    prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return <ProductForm mode="edit" product={serializeProduct(product)} categories={categories} brands={brands} canManage={canManage} />;
}
