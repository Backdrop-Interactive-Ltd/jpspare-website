import { apiError, json, prisma, requireAdminApi } from "../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES, slugify } from "../../../../lib/admin/catalogPayload";
import { resolveCampaignTargetSegments } from "../../../../lib/campaigns/segment-targeting";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CAMPAIGN_TYPES = new Set(["FLASH_SALE", "EID_CAMPAIGN", "BRAND_CAMPAIGN", "CATEGORY_CAMPAIGN", "FREE_SHIPPING", "BUNDLE_OFFER", "NEW_ARRIVAL", "CLEARANCE", "CUSTOM"]);
const CAMPAIGN_STATUSES = new Set(["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "ENDED", "ARCHIVED"]);

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
    targetSegmentIds: Array.isArray(body.targetSegmentIds) ? body.targetSegmentIds : [],
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

async function withResolvedTargetSegments(payload) {
  const targetSegments = await resolveCampaignTargetSegments(payload.targetSegmentIds, prisma);
  const actions = payload.actionsJson && typeof payload.actionsJson === "object" && !Array.isArray(payload.actionsJson) ? payload.actionsJson : null;
  const { targetSegmentIds, ...data } = payload;

  if (!actions && !targetSegments.length) return data;

  return {
    ...data,
    actionsJson: {
      ...(actions || {}),
      targetSegments,
    },
  };
}

function buildWhere(searchParams) {
  const query = searchParams.get("q")?.trim();
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";

  return {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { seoTitle: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status && CAMPAIGN_STATUSES.has(status) ? { status } : {}),
    ...(type && CAMPAIGN_TYPES.has(type) ? { type } : {}),
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);
  const where = buildWhere(searchParams);

  const [items, total] = await prisma.$transaction([
    prisma.promotionCampaign.findMany({
      where,
      orderBy: [{ priority: "desc" }, { startsAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.promotionCampaign.count({ where }),
  ]);

  return json({
    items: items.map(serializeCampaign),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}

export async function POST(request) {
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
    const item = await prisma.promotionCampaign.create({ data: await withResolvedTargetSegments(payload) });
    return json({ item: serializeCampaign(item) }, 201);
  } catch (error) {
    const message = uniqueSlugError(error);
    if (message) return apiError(message, 409);
    throw error;
  }
}
