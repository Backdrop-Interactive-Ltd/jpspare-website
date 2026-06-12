import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseLimit(value) {
  const parsed = Number.parseInt(value || "12", 10);
  return Math.min(Math.max(Number.isFinite(parsed) ? parsed : 12, 1), 24);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = (searchParams.get("category") || "").trim();
  const limit = parseLimit(searchParams.get("limit"));

  if (!category) {
    return Response.json({ items: [], error: "Category is required" }, { status: 400 });
  }

  try {
    const items = await prisma.brand.findMany({
      where: {
        isActive: true,
        products: {
          some: {
            status: "ACTIVE",
            category: {
              OR: [
                { slug: category },
                { slug: { contains: category, mode: "insensitive" } },
                { parent: { slug: category } },
              ],
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        isFeatured: true,
      },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      take: limit,
    });

    return Response.json({ items });
  } catch {
    return Response.json({ items: [], error: "Unable to load category brands" }, { status: 500 });
  }
}
