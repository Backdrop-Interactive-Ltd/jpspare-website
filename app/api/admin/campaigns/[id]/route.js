import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES, slugify } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CAMPAIGN_TYPES = new Set(["FLASH_SALE", "EID_CAMPAIGN", "BRAND_CAMPAIGN", "CATEGORY_CAMPAIGN", "FREE_SHIPPING", "BUNDLE_OFFER", "NEW_ARRIVAL", "CLEARANCE", "CUSTOM"]);
const CAMPAIGN_STATUSES = new Set(["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "ENDED", "ARCHIVED"]);
const id = async (context) => (await context.params).id;

function cleanString(value) {
  if (value === undefined || value === null) return null;
  const clean = String(value).trim();
  return clean ? clean : null;
}

function dateValue(value) {
  const clean = cleanString(value);
  if (!clean) return null;
  const date = new Date(clean);
  return Number.isNaN(date.getTime()) ? null : date;
}

function intValue(value) {
  if (value === undefined || value === null || value === "") return 0;
  const number = Number.parseInt(value, 10);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function parseJsonValue(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || (typeof parsed !== "object" && !Array.isArray(parsed))) {
    throw new Error("JSON value must be an object or array.");
  }
  return parsed;
}

function normalizeCampaignPayload(body = {}) {
  const name = cleanString(body.name);
  const type = CAMPAIGN_TYPES.has(body.type) ? body.type : "CUSTOM";
  const status = CAMPAIGN_STATUSES.has(body.status) ? body.status : "DRAFT";

  return {
    name,
    slug: cleanString(body.slug) || slugify(name),
    type,
    status,
    priority: intValue(body.priority),
    startsAt: dateValue(body.startsAt),
    endsAt: dateValue(body.endsAt),
    rulesJson: parseJsonValue(body.rulesJson),
    actionsJson: parseJsonValue(body.actionsJson),
    bannerImage: cleanString(body.bannerImage),
    landingPageEnabled: Boolean(body.landingPageEnabled),
    seoTitle: cleanString(body.seoTitle),
    seoDescription: cleanString(body.seoDescription),
  };
}

function validateCampaign(payload) {
  if (!payload.name) return "Campaign name is required.";
  if (!payload.slug) return "Campaign slug is required.";
  if (payload.priority === null) return "Priority must be zero or greater.";
  if (payload.startsAt && payload.endsAt && payload.startsAt >= payload.endsAt) return "End date must be after start date.";
  return null;
}

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

function uniqueSlugError(error) {
  return error?.code === "P2002" ? "A campaign with this slug already exists." : null;
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const item = await prisma.promotionCampaign.findUnique({ where: { id: await id(context) } });
  if (!item) return apiError("Campaign not found.", 404);

  return json({ item: serializeCampaign(item) });
}

async function updateCampaign(request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  let payload;
  try {
    payload = normalizeCampaignPayload(await request.json());
  } catch {
    return apiError("Rules and actions JSON must be valid objects or arrays.", 422);
  }

  const error = validateCampaign(payload);
  if (error) return apiError(error, 422);

  try {
    const item = await prisma.promotionCampaign.update({
      where: { id: await id(context) },
      data: payload,
    });
    return json({ item: serializeCampaign(item) });
  } catch (error) {
    const message = uniqueSlugError(error);
    if (message) return apiError(message, 409);
    if (error?.code === "P2025") return apiError("Campaign not found.", 404);
    throw error;
  }
}

export async function PUT(request, context) {
  return updateCampaign(request, context);
}

export async function PATCH(request, context) {
  return updateCampaign(request, context);
}

export async function DELETE(_request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  try {
    await prisma.promotionCampaign.delete({ where: { id: await id(context) } });
    return json({ ok: true });
  } catch (error) {
    if (error?.code === "P2025") return apiError("Campaign not found.", 404);
    throw error;
  }
}
