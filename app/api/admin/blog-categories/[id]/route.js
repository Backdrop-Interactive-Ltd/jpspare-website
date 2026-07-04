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

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const item = await prisma.blogCategory.findUnique({
    where: { id: await id(context) },
    include: { _count: { select: { posts: true } } },
  });
  if (!item) return apiError("Blog category not found.", 404);

  return json({ item: serializeBlogCategory(item) });
}

async function updateBlogCategory(request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeBlogCategoryPayload(await request.json());
  const error = validateBlogCategory(payload);
  if (error) return apiError(error, 422);

  try {
    const item = await prisma.blogCategory.update({
      where: { id: await id(context) },
      data: payload,
      include: { _count: { select: { posts: true } } },
    });
    return json({ item: serializeBlogCategory(item) });
  } catch (error) {
    const message = uniqueSlugError(error);
    if (message) return apiError(message, 409);
    if (error?.code === "P2025") return apiError("Blog category not found.", 404);
    throw error;
  }
}

export async function PUT(request, context) {
  return updateBlogCategory(request, context);
}

export async function PATCH(request, context) {
  return updateBlogCategory(request, context);
}

export async function DELETE(_request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const categoryId = await id(context);
  const postCount = await prisma.blogPost.count({ where: { categoryId } });
  if (postCount > 0) return apiError("Cannot delete a blog category that has posts.", 409);

  try {
    await prisma.blogCategory.delete({ where: { id: categoryId } });
    return json({ ok: true });
  } catch (error) {
    if (error?.code === "P2025") return apiError("Blog category not found.", 404);
    throw error;
  }
}
