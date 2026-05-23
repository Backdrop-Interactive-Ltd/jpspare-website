import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import { SUPPLIER_MANAGE_ROLES, SUPPLIER_READ_ROLES } from "../../../../../lib/admin/purchasePayload";
import SupplierForm from "../SupplierForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function NewSupplierPage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, SUPPLIER_READ_ROLES);
  const canManage = hasRole(user, SUPPLIER_MANAGE_ROLES);

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Suppliers</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view suppliers.</p>
      </div>
    );
  }

  return <SupplierForm mode="new" canManage={canManage} />;
}
