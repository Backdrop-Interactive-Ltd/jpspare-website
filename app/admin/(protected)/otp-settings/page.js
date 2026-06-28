import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/db";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import {
  OTP_PROVIDER_READ_ROLES,
  OTP_PROVIDER_WRITE_ROLES,
  serializeOtpProvider,
} from "../../../../lib/admin/otp-provider-response";
import OtpSettingsPageClient from "./OtpSettingsPageClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminOtpSettingsPage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };

  if (!hasRole(user, OTP_PROVIDER_READ_ROLES)) redirect("/admin/dashboard");

  const providers = await prisma.otpProvider.findMany({
    orderBy: [{ channel: "asc" }, { isDefault: "desc" }, { createdAt: "desc" }],
  });

  return <OtpSettingsPageClient initialProviders={providers.map(serializeOtpProvider)} canManage={hasRole(user, OTP_PROVIDER_WRITE_ROLES)} />;
}
