import { prisma } from "../db";

function normalizeTargetSegment(segment) {
  if (!segment?.id || !segment?.slug || !segment?.name) return null;
  return {
    id: String(segment.id),
    slug: String(segment.slug),
    name: String(segment.name),
  };
}

export function getCampaignTargetSegments(campaign) {
  const actions = campaign?.actionsJson;
  if (!actions || typeof actions !== "object" || Array.isArray(actions)) return [];
  const targetSegments = Array.isArray(actions.targetSegments) ? actions.targetSegments : [];
  return targetSegments.map(normalizeTargetSegment).filter(Boolean);
}

export function hasCampaignSegmentTargeting(campaign) {
  return getCampaignTargetSegments(campaign).length > 0;
}

export async function resolveCampaignTargetSegments(ids, prismaClient = prisma) {
  const cleanIds = Array.from(new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || "").trim()).filter(Boolean)));
  if (!cleanIds.length) return [];

  const segments = await prismaClient.customerSegment.findMany({
    where: {
      id: { in: cleanIds },
      isActive: true,
    },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
    },
  });

  const byId = new Map(segments.map((segment) => [segment.id, normalizeTargetSegment(segment)]));
  return cleanIds.map((id) => byId.get(id)).filter(Boolean);
}
