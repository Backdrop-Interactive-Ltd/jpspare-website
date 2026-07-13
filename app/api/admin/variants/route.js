import { apiError, json, prisma, requireAdminApi } from "../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES, slugify } from "../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function cleanString(value) {
  if (value === undefined || value === null) return null;
  const clean = String(value).trim();
  return clean || null;
}

function intValue(value, fallback = 0) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeVariantPayload(body) {
  const name = cleanString(body.name);
  const slug = cleanString(body.slug) || slugify(name);

  return {
    name,
    slug,
    description: cleanString(body.description),
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    sortOrder: intValue(body.sortOrder),
  };
}

function validateVariantPayload(payload) {
  if (!payload.name || !payload.slug) return "Variant name and slug are required.";
  return null;
}

function serializeVariant(variant) {
  if (!variant) return null;
  return {
    ...variant,
    createdAt: variant.createdAt?.toISOString?.() ?? variant.createdAt,
    updatedAt: variant.updatedAt?.toISOString?.() ?? variant.updatedAt,
  };
}

function variantError(error) {
  if (error?.code === "P2002") {
    const field = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : "name or slug";
    return apiError(`Variant ${field} already exists.`, 409);
  }
  return apiError("Unable to save variant.", 400);
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
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
  };

  const [items, total] = await prisma.$transaction([
    prisma.variant.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.variant.count({ where }),
  ]);

  return json({
    items: items.map(serializeVariant),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}

export async function POST(request) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeVariantPayload(await request.json());
  const error = validateVariantPayload(payload);
  if (error) return apiError(error, 422);

  try {
    const item = await prisma.variant.create({ data: payload });
    return json({ item: serializeVariant(item) }, 201);
  } catch (error) {
    return variantError(error);
  }
}
