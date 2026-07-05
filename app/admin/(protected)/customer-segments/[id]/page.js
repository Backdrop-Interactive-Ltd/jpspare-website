import { notFound } from "next/navigation";
import { CATALOG_MANAGE_ROLES } from "../../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import { prisma } from "../../../../../lib/db";
import CustomerSegmentForm from "../CustomerSegmentForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeSegment(segment) {
  if (!segment) return null;
  return {
    ...segment,
    lastEvaluatedAt: segment.lastEvaluatedAt?.toISOString?.() ?? segment.lastEvaluatedAt,
    createdAt: segment.createdAt?.toISOString?.() ?? segment.createdAt,
    updatedAt: segment.updatedAt?.toISOString?.() ?? segment.updatedAt,
  };
}

export default async function EditCustomerSegmentPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);
  const { id } = await params;

  const segment = await prisma.customerSegment.findUnique({ where: { id } });
  if (!segment) notFound();

  return <CustomerSegmentForm mode="edit" segment={serializeSegment(segment)} canManage={canManage} />;
}
