import { requireAdminPage } from "../../../lib/auth/admin";
import AdminShell from "./AdminShell";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ProtectedAdminLayout({ children }) {
  const session = await requireAdminPage();

  return <AdminShell session={session}>{children}</AdminShell>;
}
