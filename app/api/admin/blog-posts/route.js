import { apiError, json, prisma, requireAdminApi } from "../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES, slugify } from "../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BLOG_POST_STATUSES = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"]);

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

function buildWhere(searchParams) {
  const query = searchParams.get("q")?.trim();
  const status = searchParams.get("status") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const featured = searchParams.get("featured") || "";

  return {
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status && BLOG_POST_STATUSES.has(status) ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(featured === "true" ? { featured: true } : {}),
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
    prisma.blogPost.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return json({
    items: items.map(serializeBlogPost),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}

export async function POST(request) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeBlogPostPayload(await request.json());
  const error = validateBlogPost(payload);
  if (error) return apiError(error, 422);

  try {
    const item = await prisma.blogPost.create({
      data: payload,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    return json({ item: serializeBlogPost(item) }, 201);
  } catch (error) {
    const message = uniqueSlugError(error);
    if (message) return apiError(message, 409);
    if (error?.code === "P2003") return apiError("Selected blog category is invalid.", 422);
    throw error;
  }
}
