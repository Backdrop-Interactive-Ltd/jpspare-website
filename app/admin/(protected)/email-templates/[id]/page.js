import { notFound } from "next/navigation";
import { CATALOG_MANAGE_ROLES } from "../../../../../lib/admin/catalogPayload";
import { prisma } from "../../../../../lib/db";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import EmailTemplateForm from "../EmailTemplateForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeTemplate(template) {
  if (!template) return null;
  return {
    ...template,
    createdAt: template.createdAt?.toISOString?.() ?? template.createdAt,
    updatedAt: template.updatedAt?.toISOString?.() ?? template.updatedAt,
  };
}

export default async function EditEmailTemplatePage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);
  const { id } = await params;

  const template = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!template) notFound();

  return <EmailTemplateForm mode="edit" template={serializeTemplate(template)} canManage={canManage} />;
}
