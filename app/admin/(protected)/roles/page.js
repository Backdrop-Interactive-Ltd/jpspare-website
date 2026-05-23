import AdminPlaceholderPage from "../AdminPlaceholderPage";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { redirect } from "next/navigation";

export default async function AdminRolesPage() {
  const session = await requireAdminPage();
  if (!session.user.roles.includes("SUPER_ADMIN")) redirect("/admin/dashboard");

  return <AdminPlaceholderPage title="Roles" description="Super Admin role and permission management shell for expanding RBAC controls." endpoint="Future /api/admin/roles" />;
}
