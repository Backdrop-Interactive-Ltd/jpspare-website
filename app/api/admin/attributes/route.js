import { apiError, json, prisma, requireAdminApi } from "../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES, slugify } from "../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ATTRIBUTE_TYPES = ["TEXT", "NUMBER", "BOOLEAN", "SELECT", "MULTI_SELECT"];

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
  if (error?.code === "P2002") {
    const field = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : "name or slug";
    return apiError(`Attribute ${field} already exists.`, 409);
  }
  return apiError("Unable to save attribute.", 400);
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);

  const where = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status === "active" ? { isActive: true } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
    ...(ATTRIBUTE_TYPES.includes(type) ? { type } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.productAttribute.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.productAttribute.count({ where }),
  ]);

  return json({
    items: items.map(serializeAttribute),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}

export async function POST(request) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeAttributePayload(await request.json());
  const error = validateAttributePayload(payload);
  if (error) return apiError(error, 422);

  try {
    const item = await prisma.productAttribute.create({ data: payload });
    return json({ item: serializeAttribute(item) }, 201);
  } catch (error) {
    return attributeError(error);
  }
}
