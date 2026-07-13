import { prisma } from "../../../../lib/db";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import ProductTypesManager from "./ProductTypesManager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeProductType(productType) {
  return {
    ...productType,
    createdAt: productType.createdAt?.toISOString?.() ?? productType.createdAt,
    updatedAt: productType.updatedAt?.toISOString?.() ?? productType.updatedAt,
  };
}

export default async function AdminProductTypesPage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Product Types</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view product types.</p>
      </div>
    );
  }

  const productTypes = await prisma.productType.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return <ProductTypesManager initialProductTypes={productTypes.map(serializeProductType)} canManage={canManage} />;
}
