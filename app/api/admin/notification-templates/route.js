import { apiError, json, prisma, requireAdminApi } from "../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES, slugify } from "../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NOTIFICATION_CHANNELS = new Set(["EMAIL", "SMS", "IN_APP", "PUSH"]);

function cleanString(value) {
  if (value === undefined || value === null) return null;
  const clean = String(value).trim();
  return clean ? clean : null;
}

function parseJsonValue(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || (typeof parsed !== "object" && !Array.isArray(parsed))) {
    throw new Error("JSON value must be an object or array.");
  }
  return parsed;
}

function normalizeTemplatePayload(body = {}) {
  const name = cleanString(body.name);
  const channel = NOTIFICATION_CHANNELS.has(body.channel) ? body.channel : "IN_APP";

  return {
    name,
    slug: cleanString(body.slug) || slugify(name),
    channel,
    subject: cleanString(body.subject),
    body: cleanString(body.body),
    variablesJson: parseJsonValue(body.variablesJson),
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
  };
}

function validateTemplate(payload) {
  if (!payload.name) return "Template name is required.";
  if (!payload.slug) return "Template slug is required.";
  if (!NOTIFICATION_CHANNELS.has(payload.channel)) return "Notification channel is invalid.";
  if (!payload.body) return "Template body is required.";
  return null;
}

function serializeTemplate(template) {
  if (!template) return null;
  return {
    ...template,
    createdAt: template.createdAt?.toISOString?.() ?? template.createdAt,
    updatedAt: template.updatedAt?.toISOString?.() ?? template.updatedAt,
  };
}

function uniqueSlugError(error) {
  return error?.code === "P2002" ? "A notification template with this slug already exists." : null;
}

function buildWhere(searchParams) {
  const query = searchParams.get("q")?.trim();
  const channel = searchParams.get("channel") || "";
  const active = searchParams.get("active") || "";

  return {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { subject: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(channel && NOTIFICATION_CHANNELS.has(channel) ? { channel } : {}),
    ...(active === "active" ? { isActive: true } : {}),
    ...(active === "inactive" ? { isActive: false } : {}),
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
    prisma.notificationTemplate.findMany({
      where,
      orderBy: [{ channel: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notificationTemplate.count({ where }),
  ]);

  return json({
    items: items.map(serializeTemplate),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}

export async function POST(request) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  let payload;
  try {
    payload = normalizeTemplatePayload(await request.json());
  } catch {
    return apiError("Variables JSON must be a valid object or array.", 422);
  }

  const error = validateTemplate(payload);
  if (error) return apiError(error, 422);

  try {
    const item = await prisma.notificationTemplate.create({ data: payload });
    return json({ item: serializeTemplate(item) }, 201);
  } catch (error) {
    const message = uniqueSlugError(error);
    if (message) return apiError(message, 409);
    throw error;
  }
}
