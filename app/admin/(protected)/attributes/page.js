import { prisma } from "../../../../lib/db";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import AttributesManager from "./AttributesManager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeAttribute(attribute) {
  return {
    ...attribute,
    createdAt: attribute.createdAt?.toISOString?.() ?? attribute.createdAt,
    updatedAt: attribute.updatedAt?.toISOString?.() ?? attribute.updatedAt,
  };
}

export default async function AdminAttributesPage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, CATALOG_READ_ROLES);
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Product Attributes</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view product attributes.</p>
      </div>
    );
  }

  const attributes = await prisma.productAttribute.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return <AttributesManager initialAttributes={attributes.map(serializeAttribute)} canManage={canManage} />;
}
