import { prisma } from "../../../lib/db";
import { fallbackProducts } from "../../../lib/fallbackData";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getOrderBy(sort) {
  if (sort === "price-low") return { price: "asc" };
  if (sort === "price-high") return { price: "desc" };
  return { createdAt: "desc" };
}

function createPagination(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

function collectCategoryIds(categories, parentId) {
  const ids = [parentId];
  const children = categories.filter((category) => category.parentId === parentId);

  for (const child of children) {
    ids.push(...collectCategoryIds(categories, child.id));
  }

  return ids;
}

export async function GET(request) {
  let hasProductFilters = false;
  let page = 1;
  let limit = DEFAULT_LIMIT;

  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") || "").trim();
    const brand = (searchParams.get("brand") || "").trim();
    const query = (searchParams.get("q") || searchParams.get("search") || "").trim();
    const requestedStatus = (searchParams.get("status") || "").trim().toUpperCase();
    const status = requestedStatus === "ACTIVE" ? requestedStatus : "ACTIVE";
    const sort = (searchParams.get("sort") || "newest").trim();
    page = parsePositiveInteger(searchParams.get("page"), 1);
    limit = Math.min(parsePositiveInteger(searchParams.get("limit"), DEFAULT_LIMIT), MAX_LIMIT);
    hasProductFilters = ["category", "q", "search", "status", "brand"].some((key) => searchParams.has(key));
    let categoryIds = null;

    if (category) {
      const matchedCategory = await prisma.category.findFirst({
        where: {
          isActive: true,
          OR: [{ slug: category }, { name: { equals: category, mode: "insensitive" } }],
        },
        select: { id: true },
      });

      if (!matchedCategory) {
        const pagination = createPagination(page, limit, 0);
        return Response.json({ items: [], data: [], pagination, meta: pagination, fallback: false });
      }

      const categories = await prisma.category.findMany({
        where: { isActive: true },
        select: { id: true, parentId: true },
      });
      categoryIds = collectCategoryIds(categories, matchedCategory.id);
    }

    const where = {
      status,
      ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
      ...(brand
        ? {
            brand: {
              OR: [{ slug: brand }, { name: { equals: brand, mode: "insensitive" } }],
            },
          }
        : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { sku: { contains: query, mode: "insensitive" } },
              { category: { name: { contains: query, mode: "insensitive" } } },
              { brand: { name: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          images: { orderBy: { sortOrder: "asc" } },
          media: { include: { media: true }, orderBy: { sortOrder: "asc" } },
        },
        orderBy: getOrderBy(sort),
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);
    const pagination = createPagination(page, limit, total);

    if (items.length) {
      return Response.json({ items, data: items, pagination, meta: pagination, fallback: false });
    }

    if (hasProductFilters) {
      return Response.json({ items: [], data: [], pagination, meta: pagination, fallback: false });
    }

    const start = (page - 1) * limit;
    const fallbackItems = fallbackProducts.slice(start, start + limit);
    const fallbackPagination = createPagination(page, limit, fallbackProducts.length);
    return Response.json({
      items: fallbackItems,
      data: fallbackItems,
      pagination: fallbackPagination,
      meta: fallbackPagination,
      fallback: true,
    });
  } catch {
    if (hasProductFilters) {
      const pagination = createPagination(page, limit, 0);
      return Response.json(
        { items: [], data: [], pagination, meta: pagination, fallback: false, error: "Unable to load products" },
        { status: 500 },
      );
    }

    const start = (page - 1) * limit;
    const fallbackItems = fallbackProducts.slice(start, start + limit);
    const pagination = createPagination(page, limit, fallbackProducts.length);
    return Response.json({
      items: fallbackItems,
      data: fallbackItems,
      pagination,
      meta: pagination,
      fallback: true,
    });
  }
}
