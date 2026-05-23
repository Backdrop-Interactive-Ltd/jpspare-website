import { prisma } from "../../../lib/db";
import { fallbackProducts } from "../../../lib/fallbackData";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const where = {
      status: "ACTIVE",
      ...(category ? { category: { slug: category } } : {}),
    };

    const items = await prisma.product.findMany({
      where,
      include: { category: true, brand: true, media: { include: { media: true }, orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return Response.json({ items: items.length ? items : fallbackProducts, fallback: items.length === 0 });
  } catch {
    return Response.json({ items: fallbackProducts, fallback: true });
  }
}
