import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES, slugify } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ATTRIBUTE_TYPES = ["TEXT", "NUMBER", "BOOLEAN", "SELECT", "MULTI_SELECT"];
const id = async (context) => (await context.params).id;

function cleanString(value) {
  if (value === undefined || value === null) return null;
  const clean = String(value).trim();
  return clean || null;
}

function intValue(value, fallback = 0) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeAttributePayload(body) {
  const name = cleanString(body.name);
  const slug = cleanString(body.slug) || slugify(name);
  const type = ATTRIBUTE_TYPES.includes(body.type) ? body.type : "TEXT";

  return {
    name,
    slug,
    description: cleanString(body.description),
    type,
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    sortOrder: intValue(body.sortOrder),
  };
}

function validateAttributePayload(payload) {
  if (!payload.name || !payload.slug) return "Attribute name and slug are required.";
  if (!ATTRIBUTE_TYPES.includes(payload.type)) return "Attribute type is invalid.";
  return null;
}

function serializeAttribute(attribute) {
  if (!attribute) return null;
  return {
    ...attribute,
    createdAt: attribute.createdAt?.toISOString?.() ?? attribute.createdAt,
    updatedAt: attribute.updatedAt?.toISOString?.() ?? attribute.updatedAt,
  };
}

function attributeError(error) {
  if (error?.code === "P2025") return apiError("Attribute not found.", 404);
  if (error?.code === "P2002") {
    const field = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : "name or slug";
    return apiError(`Attribute ${field} already exists.`, 409);
  }
  return apiError("Unable to save attribute.", 400);
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const item = await prisma.productAttribute.findUnique({ where: { id: await id(context) } });
  if (!item) return apiError("Attribute not found.", 404);
  return json({ item: serializeAttribute(item) });
}

async function updateAttribute(request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeAttributePayload(await request.json());
  const error = validateAttributePayload(payload);
  if (error) return apiError(error, 422);

  try {
    const item = await prisma.productAttribute.update({ where: { id: await id(context) }, data: payload });
    return json({ item: serializeAttribute(item) });
  } catch (error) {
    return attributeError(error);
  }
}

export async function PUT(request, context) {
  return updateAttribute(request, context);
}

export async function PATCH(request, context) {
  return updateAttribute(request, context);
}

export async function DELETE(_request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  try {
    await prisma.productAttribute.delete({ where: { id: await id(context) } });
    return json({ ok: true });
  } catch (error) {
    return attributeError(error);
  }
}
