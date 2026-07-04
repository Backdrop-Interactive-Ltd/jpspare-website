import { apiError, json, prisma, requireAdminApi } from "../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES, slugify } from "../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function cleanString(value) {
  if (value === undefined || value === null) return null;
  const clean = String(value).trim();
  return clean ? clean : null;
}

function intValue(value, fallback = 0) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeBlogCategoryPayload(body) {
  const name = cleanString(body.name);
  const slug = cleanString(body.slug) || slugify(name);

  return {
    name,
    slug,
    description: cleanString(body.description),
    sortOrder: intValue(body.sortOrder),
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
  };
}

function validateBlogCategory(payload) {
  if (!payload.name || !payload.slug) return "Blog category name and slug are required.";
  return null;
}

function serializeBlogCategory(category) {
  if (!category) return null;
  return {
    ...category,
    createdAt: category.createdAt?.toISOString?.() ?? category.createdAt,
    updatedAt: category.updatedAt?.toISOString?.() ?? category.updatedAt,
  };
}

function uniqueSlugError(error) {
  return error?.code === "P2002" ? "A blog category with this slug already exists." : null;
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

  const [itemsRaw, total] = await prisma.$transaction([
    prisma.blogCategory.findMany({
      where,
      include: { _count: { select: { posts: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.blogCategory.count({ where }),
  ]);

  return json({
    items: itemsRaw.map(serializeBlogCategory),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}

export async function POST(request) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeBlogCategoryPayload(await request.json());
  const error = validateBlogCategory(payload);
  if (error) return apiError(error, 422);

  try {
    const item = await prisma.blogCategory.create({
      data: payload,
      include: { _count: { select: { posts: true } } },
    });
    return json({ item: serializeBlogCategory(item) }, 201);
  } catch (error) {
    const message = uniqueSlugError(error);
    if (message) return apiError(message, 409);
    throw error;
  }
}
