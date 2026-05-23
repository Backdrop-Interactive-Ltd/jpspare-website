export const PRODUCT_WRITE_ROLES = ["SUPER_ADMIN", "PRODUCT_MANAGER"];
export const PRODUCT_READ_ROLES = ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER", "CONTENT_EDITOR", "ORDER_MANAGER", "SUPPORT_STAFF"];

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nullableString(value) {
  if (value === undefined || value === null) return null;
  const clean = String(value).trim();
  return clean ? clean : null;
}

function decimalString(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return number.toFixed(2);
}

function intValue(value, fallback = 0) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

function stockStatusValue(stockQuantity, reservedStock, lowStockThreshold) {
  const available = Math.max(0, intValue(stockQuantity) - intValue(reservedStock));
  const threshold = Math.max(0, intValue(lowStockThreshold, 5));
  if (available <= 0) return "OUT_OF_STOCK";
  if (available <= threshold) return "LOW_STOCK";
  return "IN_STOCK";
}

export function normalizeProductPayload(body) {
  const title = nullableString(body.title);
  const slug = nullableString(body.slug) || slugify(title);
  const price = decimalString(body.price);

  return {
    product: {
      title,
      slug,
      shortDescription: nullableString(body.shortDescription),
      fullDescription: nullableString(body.fullDescription),
      description: nullableString(body.fullDescription || body.description),
      sku: nullableString(body.sku),
      barcode: nullableString(body.barcode),
      price,
      discountPrice: decimalString(body.discountPrice),
      costPrice: decimalString(body.costPrice),
      compareAtPrice: decimalString(body.compareAtPrice),
      stockQuantity: intValue(body.stockQuantity),
      reservedStock: intValue(body.reservedStock),
      lowStockThreshold: intValue(body.lowStockThreshold, 5),
      stockStatus: stockStatusValue(body.stockQuantity, body.reservedStock, body.lowStockThreshold),
      warehouseId: nullableString(body.warehouseId),
      externalStockId: nullableString(body.externalStockId),
      isFeatured: Boolean(body.isFeatured),
      status: body.status === "ACTIVE" || body.status === "ARCHIVED" ? body.status : "DRAFT",
      seoTitle: nullableString(body.seoTitle),
      seoDescription: nullableString(body.seoDescription),
      seoKeywords: nullableString(body.seoKeywords),
      categoryId: nullableString(body.categoryId),
      brandId: nullableString(body.brandId),
      externalId: nullableString(body.externalId),
      source: nullableString(body.source) || "LOCAL",
      syncStatus: body.syncStatus || "LOCAL",
      lastSyncedAt: body.lastSyncedAt ? new Date(body.lastSyncedAt) : null,
    },
    images: Array.isArray(body.images) ? body.images : [],
    tags: Array.isArray(body.tags) ? body.tags : [],
    specifications: Array.isArray(body.specifications) ? body.specifications : [],
  };
}

export function validateProductPayload(payload) {
  if (!payload.product.title || !payload.product.slug || payload.product.price === null) {
    return "Product title, slug, and price are required.";
  }
  return null;
}

export function productInclude() {
  return {
    category: true,
    brand: true,
    images: { orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }] },
    tags: { orderBy: { name: "asc" } },
    specifications: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    media: { include: { media: true }, orderBy: { sortOrder: "asc" } },
  };
}

export function serializeProduct(product) {
  if (!product) return null;
  return {
    ...product,
    price: product.price?.toString?.() ?? product.price,
    discountPrice: product.discountPrice?.toString?.() ?? product.discountPrice,
    costPrice: product.costPrice?.toString?.() ?? product.costPrice,
    compareAtPrice: product.compareAtPrice?.toString?.() ?? product.compareAtPrice,
    createdAt: product.createdAt?.toISOString?.() ?? product.createdAt,
    updatedAt: product.updatedAt?.toISOString?.() ?? product.updatedAt,
    lastSyncedAt: product.lastSyncedAt?.toISOString?.() ?? product.lastSyncedAt,
    images: product.images?.map((image) => ({
      ...image,
      createdAt: image.createdAt?.toISOString?.() ?? image.createdAt,
      updatedAt: image.updatedAt?.toISOString?.() ?? image.updatedAt,
      lastSyncedAt: image.lastSyncedAt?.toISOString?.() ?? image.lastSyncedAt,
    })),
    specifications: product.specifications?.map((spec) => ({
      ...spec,
      createdAt: spec.createdAt?.toISOString?.() ?? spec.createdAt,
      updatedAt: spec.updatedAt?.toISOString?.() ?? spec.updatedAt,
    })),
    tags: product.tags?.map((tag) => ({
      ...tag,
      createdAt: tag.createdAt?.toISOString?.() ?? tag.createdAt,
    })),
  };
}

export async function replaceProductRelations(prisma, productId, payload) {
  await prisma.productImage.deleteMany({ where: { productId } });
  await prisma.productTag.deleteMany({ where: { productId } });
  await prisma.productSpecification.deleteMany({ where: { productId } });

  const cleanImages = payload.images
    .filter((image) => image?.url)
    .map((image, index) => ({
      productId,
      url: image.url,
      alt: nullableString(image.alt),
      mediaId: nullableString(image.mediaId),
      sortOrder: intValue(image.sortOrder, index),
      isThumbnail: Boolean(image.isThumbnail),
      source: nullableString(image.source) || "LOCAL",
      syncStatus: image.syncStatus || "LOCAL",
    }));

  const cleanTags = [...new Set(payload.tags.map((tag) => nullableString(tag?.name || tag)).filter(Boolean))].map((name) => ({
    productId,
    name,
  }));

  const cleanSpecs = payload.specifications
    .filter((spec) => nullableString(spec?.name) && nullableString(spec?.value))
    .map((spec, index) => ({
      productId,
      name: nullableString(spec.name),
      value: nullableString(spec.value),
      sortOrder: intValue(spec.sortOrder, index),
    }));

  if (cleanImages.length) await prisma.productImage.createMany({ data: cleanImages });
  if (cleanTags.length) await prisma.productTag.createMany({ data: cleanTags, skipDuplicates: true });
  if (cleanSpecs.length) await prisma.productSpecification.createMany({ data: cleanSpecs });
}
