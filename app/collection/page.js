import { prisma } from "../../lib/db";
import { fallbackCategories } from "../../lib/fallbackData";
import CollectionClient from "./CollectionClient";

export const metadata = {
  title: "All Collections | JPSPARE",
  description: "Explore JPSPARE automotive parts collections by category.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function normalizeCategory(category, index = 0) {
  const image =
    category.thumbnailUrl ||
    category.images?.find((item) => item.type === "THUMBNAIL")?.url ||
    category.images?.[0]?.url ||
    "";

  return {
    id: category.id || category.slug || `collection-${index}`,
    name: category.name || "Automotive Collection",
    slug: category.slug || "products",
    description:
      category.description ||
      category.seoDescription ||
      "Browse authentic Japanese automotive parts selected for reliability, fitment, and everyday performance.",
    image,
    count: category._count?.products ?? category.productsCount ?? 0,
    rating: "4.8",
  };
}

async function getCollections() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        _count: { select: { products: true } },
      },
    });

    return (categories.length ? categories : fallbackCategories).map(normalizeCategory);
  } catch {
    return fallbackCategories.map(normalizeCategory);
  }
}

export default async function CollectionPage() {
  const collections = await getCollections();
  const premiumParts = collections.reduce((total, collection) => total + Number(collection.count || 0), 0);

  return <CollectionClient collections={collections} premiumParts={premiumParts} />;
}
