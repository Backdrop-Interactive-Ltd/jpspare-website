import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES, slugify } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TEMPLATE_CATEGORIES = new Set(["TRANSACTIONAL", "MARKETING", "AUTH", "ORDER", "SHIPPING", "SUPPORT", "NEWSLETTER"]);
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
  const category = TEMPLATE_CATEGORIES.has(body.category) ? body.category : "TRANSACTIONAL";

  return {
    name,
    slug: cleanString(body.slug) || slugify(name),
    category,
    subject: cleanString(body.subject),
    htmlBody: cleanString(body.htmlBody),
    textBody: cleanString(body.textBody),
    variablesJson: parseJsonValue(body.variablesJson),
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
  };
}

function validateTemplate(payload) {
  if (!payload.name) return "Template name is required.";
  if (!payload.slug) return "Template slug is required.";
  if (!TEMPLATE_CATEGORIES.has(payload.category)) return "Template category is invalid.";
  if (!payload.subject) return "Template subject is required.";
  if (!payload.htmlBody) return "Template HTML body is required.";
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
  return error?.code === "P2002" ? "An email template with this slug already exists." : null;
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const item = await prisma.emailTemplate.findUnique({ where: { id: await id(context) } });
  if (!item) return apiError("Email template not found.", 404);

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
    const item = await prisma.emailTemplate.update({
      where: { id: await id(context) },
      data: payload,
    });
    return json({ item: serializeTemplate(item) });
  } catch (error) {
    const message = uniqueSlugError(error);
    if (message) return apiError(message, 409);
    if (error?.code === "P2025") return apiError("Email template not found.", 404);
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
    await prisma.emailTemplate.delete({ where: { id: await id(context) } });
    return json({ ok: true });
  } catch (error) {
    if (error?.code === "P2025") return apiError("Email template not found.", 404);
    throw error;
  }
}
