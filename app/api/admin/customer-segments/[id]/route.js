import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES, slugify } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

function normalizeSegmentPayload(body = {}) {
  const name = cleanString(body.name);

  return {
    name,
    slug: cleanString(body.slug) || slugify(name),
    description: cleanString(body.description),
    rulesJson: parseJsonValue(body.rulesJson),
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
  };
}

function validateSegment(payload) {
  if (!payload.name) return "Segment name is required.";
  if (!payload.slug) return "Segment slug is required.";
  return null;
}

function serializeSegment(segment) {
  if (!segment) return null;
  return {
    ...segment,
    lastEvaluatedAt: segment.lastEvaluatedAt?.toISOString?.() ?? segment.lastEvaluatedAt,
    createdAt: segment.createdAt?.toISOString?.() ?? segment.createdAt,
    updatedAt: segment.updatedAt?.toISOString?.() ?? segment.updatedAt,
  };
}

function uniqueSlugError(error) {
  return error?.code === "P2002" ? "A customer segment with this slug already exists." : null;
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const item = await prisma.customerSegment.findUnique({ where: { id: await id(context) } });
  if (!item) return apiError("Customer segment not found.", 404);

  return json({ item: serializeSegment(item) });
}

async function updateSegment(request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  let payload;
  try {
    payload = normalizeSegmentPayload(await request.json());
  } catch {
    return apiError("Rules JSON must be a valid object or array.", 422);
  }

  const error = validateSegment(payload);
  if (error) return apiError(error, 422);

  try {
    const item = await prisma.customerSegment.update({
      where: { id: await id(context) },
      data: payload,
    });
    return json({ item: serializeSegment(item) });
  } catch (error) {
    const message = uniqueSlugError(error);
    if (message) return apiError(message, 409);
    if (error?.code === "P2025") return apiError("Customer segment not found.", 404);
    throw error;
  }
}

export async function PUT(request, context) {
  return updateSegment(request, context);
}

export async function PATCH(request, context) {
  return updateSegment(request, context);
}

export async function DELETE(_request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  try {
    await prisma.customerSegment.delete({ where: { id: await id(context) } });
    return json({ ok: true });
  } catch (error) {
    if (error?.code === "P2025") return apiError("Customer segment not found.", 404);
    throw error;
  }
}
