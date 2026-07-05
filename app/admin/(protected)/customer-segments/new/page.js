import { CATALOG_MANAGE_ROLES } from "../../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import CustomerSegmentForm from "../CustomerSegmentForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function NewCustomerSegmentPage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);

  return <CustomerSegmentForm mode="new" canManage={canManage} />;
}
