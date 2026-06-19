import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildTree(categories, parentId = null) {
  return categories
    .filter((category) => category.parentId === parentId)
    .map((category) => ({
      ...category,
      children: buildTree(categories, category.id),
    }));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const menuOnly = searchParams.get("menu") === "true";
  const featuredOnly = searchParams.get("featured") === "true";

  const items = await prisma.category.findMany({
    where: {
      isActive: true,
      ...(menuOnly ? { showInMenu: true } : {}),
      ...(featuredOnly ? { isFeatured: true } : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      thumbnailUrl: true,
      iconUrl: true,
      sortOrder: true,
      isFeatured: true,
      showInMenu: true,
      parentId: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const tree = buildTree(items);

  return Response.json({
    items: tree,
    data: tree,
    meta: {
      total: items.length,
    },
  });
}
