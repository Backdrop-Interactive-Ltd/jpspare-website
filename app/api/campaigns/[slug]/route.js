import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
    rulesJson: campaign.rulesJson,
    actionsJson: campaign.actionsJson,
  };
}

export async function GET(_request, { params }) {
  const { slug } = await params;
  const cleanSlug = String(slug || "").trim();

  if (!cleanSlug) {
    return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
  }

  const now = new Date();
  let campaign = null;

  try {
    campaign = await prisma.promotionCampaign.findFirst({
      where: {
        slug: cleanSlug,
        status: "ACTIVE",
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
    });
  } catch (error) {
    console.error("[Campaign API] Failed to load campaign", {
      message: error?.message,
      code: error?.code,
    });
  }

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
  }

  return NextResponse.json({ item: publicCampaign(campaign) });
}
