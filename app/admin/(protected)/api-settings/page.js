import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/db";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import {
  API_KEY_READ_ROLES,
  API_KEY_WRITE_ROLES,
  apiKeyInclude,
  serializeApiKey,
} from "../../../../lib/admin/apiKeys";
import ApiSettingsClient from "./ApiSettingsClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminApiSettingsPage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };

  if (!hasRole(user, API_KEY_READ_ROLES)) redirect("/admin/dashboard");

  const items = await prisma.apiKey.findMany({
    include: apiKeyInclude(),
    orderBy: { createdAt: "desc" },
  });

  return (
    <ApiSettingsClient
      initialItems={items.map(serializeApiKey)}
      canManage={hasRole(user, API_KEY_WRITE_ROLES)}
      adminEmail={session.user.email}
    />
  );
}
