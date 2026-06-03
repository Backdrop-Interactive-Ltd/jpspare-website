import { slugify } from "./catalogPayload.js";
import { frontendCategoryBlueprint } from "../catalogBlueprint.js";

function normalizeNode(node, parentSlug = "", index = 0) {
  if (typeof node === "string") {
    return {
      name: node,
      slug: parentSlug ? `${parentSlug}-${slugify(node)}` : slugify(node),
      sortOrder: index * 10,
      children: [],
    };
  }

  return {
    ...node,
    slug: node.slug || (parentSlug ? `${parentSlug}-${slugify(node.name)}` : slugify(node.name)),
    sortOrder: Number(node.sortOrder ?? index * 10),
    children: Array.isArray(node.children) ? node.children : [],
  };
}

async function upsertCategoryTree(prisma, node, parentId = null, parentSlug = "", index = 0, stats) {
  const category = normalizeNode(node, parentSlug, index);

  const item = await prisma.category.upsert({
    where: { slug: category.slug },
    create: {
      name: category.name,
      slug: category.slug,
      description: category.description || null,
      parentId,
      sortOrder: category.sortOrder,
      isActive: true,
      isFeatured: Boolean(category.isFeatured),
      showInMenu: true,
      source: "FRONTEND_BLUEPRINT",
      syncStatus: "LOCAL",
    },
    update: {
      name: category.name,
      description: category.description || null,
      parentId,
      sortOrder: category.sortOrder,
      isActive: true,
      isFeatured: Boolean(category.isFeatured),
      showInMenu: true,
      source: "FRONTEND_BLUEPRINT",
      syncStatus: "LOCAL",
    },
    select: { id: true, slug: true },
  });

  stats.count += 1;

  for (const [childIndex, child] of category.children.entries()) {
    await upsertCategoryTree(prisma, child, item.id, item.slug, childIndex + 1, stats);
  }
}

export async function seedFrontendCategories(prisma) {
  const stats = { count: 0 };

  for (const [index, category] of frontendCategoryBlueprint.entries()) {
    await upsertCategoryTree(prisma, category, null, "", index + 1, stats);
  }

  return stats;
}
