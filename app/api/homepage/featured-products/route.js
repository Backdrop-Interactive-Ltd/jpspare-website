import { NextResponse } from "next/server";
import { getHomepageCms, getHomepageFeaturedProducts } from "../../../../lib/homepage/cms";
import { prisma } from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODUCT_SECTION_LIMIT = 30;

function formatTaka(value) {
  const amount = Number(value || 0);
  return `Tk ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function normalizeProduct(product) {
  const thumbnail = product.images?.find((image) => image.isThumbnail) || product.images?.[0];

  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    category: product.category?.name || product.brand?.name || "JPSPARE",
    name: product.title,
    title: product.title,
    price: formatTaka(product.discountPrice || product.price),
    oldPrice: product.discountPrice ? formatTaka(product.price) : "",
    discountPrice: product.discountPrice ? product.discountPrice.toString() : null,
    compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : null,
    stockQuantity: product.stockQuantity,
    reviews: 5,
    image: thumbnail?.url || product.media?.[0]?.media?.url || "",
    brand: product.brand
      ? {
          name: product.brand.name,
          slug: product.brand.slug,
          logoUrl: product.brand.logoUrl,
        }
      : null,
  };
}

async function getHomepageProductSections() {
  try {
    const include = {
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true, slug: true, logoUrl: true } },
      images: {
        select: { url: true, isThumbnail: true, sortOrder: true },
        orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
        take: 2,
      },
      media: {
        include: { media: { select: { url: true } } },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    };

    const [bestSellers, newArrivals] = await prisma.$transaction([
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        include,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: PRODUCT_SECTION_LIMIT,
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        include,
        orderBy: [{ createdAt: "desc" }],
        take: PRODUCT_SECTION_LIMIT,
      }),
    ]);

    return {
      bestSellers: bestSellers.map(normalizeProduct),
      newArrivals: newArrivals.map(normalizeProduct),
      latestProducts: newArrivals.map(normalizeProduct),
    };
  } catch {
    return {
      bestSellers: [],
      newArrivals: [],
      latestProducts: [],
    };
  }
}

export async function GET() {
  const cms = await getHomepageCms();
  const [products, sections] = await Promise.all([
    getHomepageFeaturedProducts(cms),
    getHomepageProductSections(),
  ]);

  return NextResponse.json({
    products,
    featuredProducts: products,
    ...sections,
  });
}
