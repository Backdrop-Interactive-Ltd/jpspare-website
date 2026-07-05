import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES, slugify } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NOTIFICATION_CHANNELS = new Set(["EMAIL", "SMS", "IN_APP", "PUSH"]);
const id = async (context) => (await context.params).id;

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

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const item = await prisma.notificationTemplate.findUnique({ where: { id: await id(context) } });
  if (!item) return apiError("Notification template not found.", 404);

  return json({ item: serializeTemplate(item) });
}

async function updateTemplate(request, context) {
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
    const item = await prisma.notificationTemplate.update({
      where: { id: await id(context) },
      data: payload,
    });
    return json({ item: serializeTemplate(item) });
  } catch (error) {
    const message = uniqueSlugError(error);
    if (message) return apiError(message, 409);
    if (error?.code === "P2025") return apiError("Notification template not found.", 404);
    throw error;
  }
}

export async function PUT(request, context) {
  return updateTemplate(request, context);
}

export async function PATCH(request, context) {
  return updateTemplate(request, context);
}

export async function DELETE(_request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  try {
    await prisma.notificationTemplate.delete({ where: { id: await id(context) } });
    return json({ ok: true });
  } catch (error) {
    if (error?.code === "P2025") return apiError("Notification template not found.", 404);
    throw error;
  }
}
