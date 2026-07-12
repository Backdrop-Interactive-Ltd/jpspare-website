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

async function getProductData(slug) {
  const product = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    select: {
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
    },
  });

  return serializeProduct(product);
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
      <ProductDetailClient slug={slug} product={product} />
    </>
  );
}
