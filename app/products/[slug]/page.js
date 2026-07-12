import ProductDetailClient from "./ProductDetailClient";
import { MainNavBar } from "../../homepage/site-header";
import { prisma } from "../../../lib/db";
import { buildBreadcrumbSchema, buildProductSchema, jsonLdScript } from "@/lib/seo/structured-data";
import { notFound } from "next/navigation";

function toNumber(value) {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function serializeProduct(product) {
  if (!product) return null;

  const images = [
    ...(Array.isArray(product.images)
      ? product.images.map((image) => ({
          id: image.id,
          url: image.url,
          alt: image.alt,
          sortOrder: image.sortOrder,
          isThumbnail: image.isThumbnail,
        }))
      : []),
    ...(Array.isArray(product.media)
      ? product.media
          .filter((item) => item?.media?.url && (!item.media.type || item.media.type === "IMAGE"))
          .map((item) => ({
            id: item.mediaId,
            url: item.media.url,
            alt: item.alt || item.media.alt,
            sortOrder: item.sortOrder,
            isThumbnail: false,
          }))
      : []),
  ].filter((image, index, list) => image.url && list.findIndex((item) => item.url === image.url) === index);

  return {
    id: product.id,
    title: product.title,
    name: product.title,
    slug: product.slug,
    sku: product.sku,
    shortDescription: product.shortDescription,
    description: product.description,
    fullDescription: product.fullDescription,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    price: toNumber(product.price),
    discountPrice: toNumber(product.discountPrice),
    compareAtPrice: toNumber(product.compareAtPrice),
    status: product.status,
    stockQuantity: product.stockQuantity,
    stockStatus: product.stockStatus,
    category: product.category,
    brand: product.brand,
    images,
    image: images[0]?.url || null,
    thumbnail: images[0]?.url || null,
    specifications: Array.isArray(product.specifications) ? product.specifications : [],
    tags: Array.isArray(product.tags) ? product.tags.map((tag) => tag.name).filter(Boolean) : [],
  };
}

function serializeMerchProduct(product) {
  const serialized = serializeProduct(product);
  if (!serialized) return null;

  return {
    id: serialized.id,
    productId: serialized.id,
    slug: serialized.slug,
    title: serialized.title,
    name: serialized.title,
    sku: serialized.sku,
    shortDescription: serialized.shortDescription,
    price: serialized.discountPrice ?? serialized.price,
    oldPrice: serialized.compareAtPrice ?? (serialized.discountPrice ? serialized.price : null),
    discountPrice: serialized.discountPrice,
    compareAtPrice: serialized.compareAtPrice,
    stockStatus: serialized.stockStatus,
    stockQuantity: serialized.stockQuantity,
    image: serialized.image,
    thumbnail: serialized.thumbnail,
    images: serialized.images,
    brand: serialized.brand,
    category: serialized.category?.name || "Products",
    categorySlug: serialized.category?.slug || null,
  };
}

const productSelect = {
  id: true,
  title: true,
  slug: true,
  sku: true,
  shortDescription: true,
  description: true,
  fullDescription: true,
  seoTitle: true,
  seoDescription: true,
  price: true,
  discountPrice: true,
  compareAtPrice: true,
  stockStatus: true,
  stockQuantity: true,
  status: true,
  isFeatured: true,
  createdAt: true,
  categoryId: true,
  brandId: true,
  category: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
  images: {
    select: { id: true, url: true, alt: true, sortOrder: true, isThumbnail: true },
    orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
  },
  media: {
    select: {
      mediaId: true,
      sortOrder: true,
      alt: true,
      media: {
        select: { url: true, alt: true, type: true },
      },
    },
    orderBy: { sortOrder: "asc" },
  },
  specifications: {
    select: { id: true, name: true, value: true, sortOrder: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  },
  tags: { select: { name: true } },
};

async function getProductData(slug) {
  const product = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    select: productSelect,
  });

  return serializeProduct(product);
}

function mergeUniqueProducts(groups, currentProductId, limit) {
  const seen = new Set([currentProductId].filter(Boolean));
  const merged = [];

  for (const group of groups) {
    for (const product of group || []) {
      if (!product?.id || seen.has(product.id)) continue;
      seen.add(product.id);
      merged.push(product);
      if (merged.length >= limit) return merged;
    }
  }

  return merged;
}

async function getRelatedProducts(product, limit = 4) {
  const categoryId = product?.category?.id;
  const brandId = product?.brand?.id;
  const productId = product?.id;

  const [categoryProducts, brandProducts] = await Promise.all([
    categoryId
      ? prisma.product.findMany({
          where: { status: "ACTIVE", categoryId, id: { not: productId } },
          select: productSelect,
          orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
          take: limit,
        })
      : [],
    brandId
      ? prisma.product.findMany({
          where: { status: "ACTIVE", brandId, id: { not: productId } },
          select: productSelect,
          orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
          take: limit,
        })
      : [],
  ]);

  return mergeUniqueProducts([categoryProducts, brandProducts], productId, limit).map(serializeMerchProduct).filter(Boolean);
}

async function getBuyingNowProducts(product, excludeIds = [], limit = 5) {
  const productId = product?.id;
  const categoryId = product?.category?.id;
  const brandId = product?.brand?.id;
  const excludedIds = [productId, ...excludeIds].filter(Boolean);
  const contextualOr = [
    categoryId ? { categoryId } : null,
    brandId ? { brandId } : null,
  ].filter(Boolean);

  const [contextualProducts, featuredProducts] = await Promise.all([
    contextualOr.length
      ? prisma.product.findMany({
          where: { status: "ACTIVE", id: { notIn: excludedIds }, OR: contextualOr },
          select: productSelect,
          orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
          take: limit,
        })
      : [],
    prisma.product.findMany({
      where: { status: "ACTIVE", id: { notIn: excludedIds } },
      select: productSelect,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit,
    }),
  ]);

  return mergeUniqueProducts([contextualProducts, featuredProducts], productId, limit).map(serializeMerchProduct).filter(Boolean);
}

function titleFromSlug(slug) {
  return String(slug || "Product Details")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductData(slug);
  const title = product?.seoTitle || product?.title || titleFromSlug(slug) || "Product Details";
  const description = product?.seoDescription || product?.shortDescription || product?.description || "Authentic auto parts and accessories from JPSPARE.";

  return {
    title: `${title} | JPSPARE`,
    description,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductData(slug);

  if (!product) {
    notFound();
  }
  const relatedProducts = await getRelatedProducts(product);
  const buyingNowProducts = await getBuyingNowProducts(product, relatedProducts.map((item) => item.id));

  const productSchema = buildProductSchema(product, { url: `/products/${slug}` });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    ...(product?.category ? [{ name: product.category.name, url: `/collections/${product.category.slug}` }] : []),
    { name: product?.title || "Product Details", url: `/products/${slug}` },
  ]);

  return (
    <>
      <MainNavBar showTrackOrder={false} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(productSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema)} />
      <ProductDetailClient slug={slug} product={product} relatedProducts={relatedProducts} buyingNowProducts={buyingNowProducts} />
    </>
  );
}
