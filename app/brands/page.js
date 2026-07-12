import TopDealBar from "../TopDealBar";
import { Header } from "../homepage/site-header";
import CollectionPageClient from "../collection-page/CollectionPageClient";
import { prisma } from "../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Brands | JPSPARE",
  description: "Shop premium automotive brands available at JPSPARE.",
};

function serializeMoney(value) {
  if (value === null || value === undefined) return null;
  return typeof value?.toString === "function" ? value.toString() : value;
}

function getProductImage(product) {
  return (
    product?.images?.find((image) => image.isThumbnail)?.url ||
    product?.images?.[0]?.url ||
    product?.media?.[0]?.media?.url ||
    null
  );
}

function createBrandCard(brand) {
  const firstProduct = brand.products?.[0] || null;
  const productCount = brand._count?.products || brand.products?.length || 0;
  const image = brand.coverImageUrl || brand.logoUrl || getProductImage(firstProduct);

  return {
    id: brand.id,
    slug: brand.slug,
    category: firstProduct?.category?.name || "Brand",
    name: brand.name,
    title: brand.name,
    shortDescription: brand.description || firstProduct?.shortDescription || "",
    price: productCount > 0 ? `${productCount} Products` : "Explore Brand",
    oldPrice: firstProduct?.compareAtPrice ? serializeMoney(firstProduct.compareAtPrice) : null,
    reviews: brand.isFeatured ? 5 : 4,
    image,
    brand: {
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logoUrl,
    },
    href: `/products?brand=${brand.slug}`,
  };
}

async function getBrandsCollectionData() {
  try {
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
        products: {
          some: {
            status: "ACTIVE",
          },
        },
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
        products: {
          where: {
            status: "ACTIVE",
          },
          include: {
            category: true,
            images: { orderBy: { sortOrder: "asc" } },
            media: { include: { media: true }, orderBy: { sortOrder: "asc" } },
          },
          orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
          take: 1,
        },
      },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    });

    const products = brands.map(createBrandCard).filter((item) => item.name && item.slug);
    if (!products.length) return null;

    return {
      eyebrow: "Premium Partners",
      title: "Shop Premium",
      highlight: "Brands",
      description: "Browse CMS-managed brand collections from trusted automotive manufacturers.",
      filters: ["All", ...Array.from(new Set(products.map((product) => product.category).filter(Boolean)))],
      products,
    };
  } catch {
    return null;
  }
}

export default async function BrandsPage() {
  const collectionData = await getBrandsCollectionData();

  return (
    <>
      <TopDealBar />
      <Header />
      <CollectionPageClient pageKey="brands" collectionData={collectionData} />
    </>
  );
}
