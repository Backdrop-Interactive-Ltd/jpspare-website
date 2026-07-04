import ProductDetailClient from "./ProductDetailClient";
import { MainNavBar } from "../../homepage/site-header";
import { prisma } from "../../../lib/db";
import { buildBreadcrumbSchema, buildProductSchema, jsonLdScript } from "@/lib/seo/structured-data";

export const metadata = {
  title: "Product Details | JPSPARE",
  description: "Demo product details page for JPSPARE auto parts ecommerce.",
};

async function getProductSchemaData(slug) {
  try {
    return await prisma.product.findFirst({
      where: { slug, status: "ACTIVE" },
      select: {
        title: true,
        slug: true,
        sku: true,
        shortDescription: true,
        description: true,
        fullDescription: true,
        price: true,
        discountPrice: true,
        stockStatus: true,
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        images: {
          select: { url: true },
          orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
        },
      },
    });
  } catch {
    return null;
  }
}

function titleFromSlug(slug) {
  return String(slug || "Product Details")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductSchemaData(slug);
  const schemaProduct = product || {
    title: titleFromSlug(slug),
    slug,
    description: "JPSPARE product detail page.",
    images: [],
  };
  const productSchema = buildProductSchema(schemaProduct, { url: `/products/${slug}` });
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
      <ProductDetailClient slug={slug} />
    </>
  );
}
