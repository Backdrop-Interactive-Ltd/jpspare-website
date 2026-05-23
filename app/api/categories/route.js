import { prisma } from "../../../lib/db";
import { fallbackCategories } from "../../../lib/fallbackData";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return Response.json({ items: items.length ? items : fallbackCategories, fallback: items.length === 0 });
  } catch {
    return Response.json({ items: fallbackCategories, fallback: true });
  }
}
