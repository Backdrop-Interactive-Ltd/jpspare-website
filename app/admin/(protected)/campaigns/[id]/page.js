import { notFound } from "next/navigation";
import { CATALOG_MANAGE_ROLES } from "../../../../../lib/admin/catalogPayload";
import { prisma } from "../../../../../lib/db";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import CampaignForm from "../CampaignForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeCampaign(campaign) {
  if (!campaign) return null;
  return {
    ...campaign,
    startsAt: campaign.startsAt?.toISOString?.() ?? campaign.startsAt,
    endsAt: campaign.endsAt?.toISOString?.() ?? campaign.endsAt,
    createdAt: campaign.createdAt?.toISOString?.() ?? campaign.createdAt,
    updatedAt: campaign.updatedAt?.toISOString?.() ?? campaign.updatedAt,
  };
}

export default async function EditCampaignPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);
  const { id } = await params;

  const campaign = await prisma.promotionCampaign.findUnique({ where: { id } });
  if (!campaign) notFound();

  return <CampaignForm mode="edit" campaign={serializeCampaign(campaign)} canManage={canManage} />;
}
