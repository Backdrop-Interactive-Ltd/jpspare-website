import { apiError, json, prisma, requireAdminApi } from "../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES, slugify } from "../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

function buildWhere(searchParams) {
  const query = searchParams.get("q")?.trim();
  const active = searchParams.get("active") || "";

  return {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(active === "true" ? { isActive: true } : {}),
    ...(active === "false" ? { isActive: false } : {}),
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
    prisma.customerSegment.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.customerSegment.count({ where }),
  ]);

  return json({
    items: items.map(serializeSegment),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}

export async function POST(request) {
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
    const item = await prisma.customerSegment.create({ data: payload });
    return json({ item: serializeSegment(item) }, 201);
  } catch (error) {
    const message = uniqueSlugError(error);
    if (message) return apiError(message, 409);
    throw error;
  }
}
