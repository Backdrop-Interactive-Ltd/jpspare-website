import { CATALOG_MANAGE_ROLES } from "../../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import NotificationTemplateForm from "../NotificationTemplateForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function NewNotificationTemplatePage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);

  return <NotificationTemplateForm mode="new" canManage={canManage} />;
}
