import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CAMPAIGN_TYPES = new Set([
  "FLASH_SALE",
  "EID_CAMPAIGN",
  "BRAND_CAMPAIGN",
  "CATEGORY_CAMPAIGN",
  "FREE_SHIPPING",
  "BUNDLE_OFFER",
  "NEW_ARRIVAL",
  "CLEARANCE",
  "CUSTOM",
]);

function publicCampaign(campaign) {
  return {
    id: campaign.id,
    name: campaign.name,
    slug: campaign.slug,
    type: campaign.type,
    priority: campaign.priority,
    bannerImage: campaign.bannerImage,
    landingPageEnabled: campaign.landingPageEnabled,
    seoTitle: campaign.seoTitle,
    seoDescription: campaign.seoDescription,
    startsAt: campaign.startsAt?.toISOString?.() ?? campaign.startsAt,
    endsAt: campaign.endsAt?.toISOString?.() ?? campaign.endsAt,
  };
}

function activeCampaignWhere(now, type) {
  return {
    status: "ACTIVE",
    AND: [
      { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
      { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
    ],
    ...(type ? { type } : {}),
  };
}

function parseLimit(value) {
  const parsed = Number.parseInt(value || "20", 10);
  if (!Number.isInteger(parsed) || parsed < 1) return 20;
  return Math.min(parsed, 100);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawType = searchParams.get("type")?.trim();
  const type = rawType && CAMPAIGN_TYPES.has(rawType) ? rawType : null;

  if (rawType && !type) {
    return NextResponse.json({ items: [] });
  }

  const now = new Date();
  let campaigns = [];

  try {
    campaigns = await prisma.promotionCampaign.findMany({
      where: activeCampaignWhere(now, type),
      orderBy: [{ priority: "desc" }, { startsAt: "desc" }, { createdAt: "desc" }],
      take: parseLimit(searchParams.get("limit")),
    });
  } catch (error) {
    console.error("[Campaigns API] Failed to load campaigns", {
      message: error?.message,
      code: error?.code,
    });
  }

  return NextResponse.json({ items: campaigns.map(publicCampaign) });
}
