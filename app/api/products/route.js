import { prisma } from "../../../lib/db";
import { fallbackProducts } from "../../../lib/fallbackData";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  let hasProductFilters = false;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = (searchParams.get("q") || searchParams.get("search") || "").trim();
    hasProductFilters = ["category", "q", "search", "status", "brand"].some((key) => searchParams.has(key));
    const where = {
      status: "ACTIVE",
      ...(category ? { category: { slug: category } } : {}),
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

    const items = await prisma.product.findMany({
      where,
      include: { category: true, brand: true, media: { include: { media: true }, orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    if (items.length) {
      return Response.json({ items, fallback: false });
    }

    return Response.json({ items: hasProductFilters ? [] : fallbackProducts, fallback: !hasProductFilters });
  } catch {
    if (hasProductFilters) {
      return Response.json({ items: [], fallback: false, error: "Unable to load products" }, { status: 500 });
    }

    return Response.json({ items: fallbackProducts, fallback: true });
  }
}
