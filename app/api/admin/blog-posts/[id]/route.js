import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES, slugify } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BLOG_POST_STATUSES = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const id = async (context) => (await context.params).id;

function cleanString(value) {
  if (value === undefined || value === null) return null;
  const clean = String(value).trim();
  return clean ? clean : null;
}

function dateValue(value) {
  const clean = cleanString(value);
  if (!clean) return null;
  const date = new Date(clean);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => cleanString(tag)).filter(Boolean);
  }
  return String(value || "")
    .split(",")
    .map((tag) => cleanString(tag))
    .filter(Boolean);
}

function normalizeBlogPostPayload(body) {
  const title = cleanString(body.title);
  const slug = cleanString(body.slug) || slugify(title);
  const status = BLOG_POST_STATUSES.has(body.status) ? body.status : "DRAFT";

  return {
    title,
    slug,
    excerpt: cleanString(body.excerpt),
    content: cleanString(body.content) || "",
    featuredImage: cleanString(body.featuredImage),
    categoryId: cleanString(body.categoryId),
    authorName: cleanString(body.authorName),
    tags: normalizeTags(body.tags),
    status,
    featured: Boolean(body.featured),
    publishedAt: dateValue(body.publishedAt),
    seoTitle: cleanString(body.seoTitle),
    seoDescription: cleanString(body.seoDescription),
  };
}

function validateBlogPost(payload) {
  if (!payload.title || !payload.slug) return "Blog post title and slug are required.";
  return null;
}

function serializeBlogPost(post) {
  if (!post) return null;
  return {
    ...post,
    publishedAt: post.publishedAt?.toISOString?.() ?? post.publishedAt,
    createdAt: post.createdAt?.toISOString?.() ?? post.createdAt,
    updatedAt: post.updatedAt?.toISOString?.() ?? post.updatedAt,
  };
}

function uniqueSlugError(error) {
  return error?.code === "P2002" ? "A blog post with this slug already exists." : null;
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const item = await prisma.blogPost.findUnique({
    where: { id: await id(context) },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  if (!item) return apiError("Blog post not found.", 404);

  return json({ item: serializeBlogPost(item) });
}

async function updateBlogPost(request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeBlogPostPayload(await request.json());
  const error = validateBlogPost(payload);
  if (error) return apiError(error, 422);

  try {
    const item = await prisma.blogPost.update({
      where: { id: await id(context) },
      data: payload,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    return json({ item: serializeBlogPost(item) });
  } catch (error) {
    const message = uniqueSlugError(error);
    if (message) return apiError(message, 409);
    if (error?.code === "P2003") return apiError("Selected blog category is invalid.", 422);
    if (error?.code === "P2025") return apiError("Blog post not found.", 404);
    throw error;
  }
}

export async function PUT(request, context) {
  return updateBlogPost(request, context);
}

export async function PATCH(request, context) {
  return updateBlogPost(request, context);
}

export async function DELETE(_request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  try {
    await prisma.blogPost.delete({ where: { id: await id(context) } });
    return json({ ok: true });
  } catch (error) {
    if (error?.code === "P2025") return apiError("Blog post not found.", 404);
    throw error;
  }
}
