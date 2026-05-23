import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/db";
import { CATALOG_MANAGE_ROLES, brandInclude, serializeBrand } from "../../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import BrandForm from "../BrandForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EditBrandPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);
  const { id } = await params;

  const brand = await prisma.brand.findUnique({ where: { id }, include: brandInclude() });
  if (!brand) notFound();

  return <BrandForm mode="edit" brand={serializeBrand(brand)} canManage={canManage} />;
}
