import AdminPlaceholderPage from "../AdminPlaceholderPage";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await requireAdminPage();
  if (!session.user.roles.includes("SUPER_ADMIN")) redirect("/admin/dashboard");

  return <AdminPlaceholderPage title="Users" description="Super Admin user management area. Sidebar access is hidden for non SUPER_ADMIN roles." endpoint="Future /api/admin/users" />;
}
