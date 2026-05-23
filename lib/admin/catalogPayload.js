export const CATALOG_MANAGE_ROLES = ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"];
export const CATALOG_READ_ROLES = ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER", "CONTENT_EDITOR"];

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

function intValue(value, fallback = 0) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

export function categoryInclude() {
  return {
    parent: { select: { id: true, name: true, slug: true } },
    children: { select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } },
    images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    _count: { select: { products: true, children: true } },
  };
}

export function brandInclude() {
  return {
    _count: { select: { products: true } },
  };
}

export function normalizeCategoryPayload(body) {
  const name = nullableString(body.name);
  const slug = nullableString(body.slug) || slugify(name);

  return {
    category: {
      name,
      slug,
      description: nullableString(body.description),
      thumbnailUrl: nullableString(body.thumbnailUrl),
      iconUrl: nullableString(body.iconUrl),
      parentId: nullableString(body.parentId),
      sortOrder: intValue(body.sortOrder),
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
      isFeatured: Boolean(body.isFeatured),
      showInMenu: body.showInMenu === undefined ? true : Boolean(body.showInMenu),
      seoTitle: nullableString(body.seoTitle),
      seoDescription: nullableString(body.seoDescription),
      seoKeywords: nullableString(body.seoKeywords),
      externalId: nullableString(body.externalId),
      source: nullableString(body.source) || "LOCAL",
      syncStatus: body.syncStatus || "LOCAL",
      lastSyncedAt: body.lastSyncedAt ? new Date(body.lastSyncedAt) : null,
    },
    images: Array.isArray(body.images) ? body.images : [],
  };
}

export function normalizeBrandPayload(body) {
  const name = nullableString(body.name);
  const slug = nullableString(body.slug) || slugify(name);

  return {
    brand: {
      name,
      slug,
      description: nullableString(body.description),
      logoUrl: nullableString(body.logoUrl),
      coverImageUrl: nullableString(body.coverImageUrl),
      websiteUrl: nullableString(body.websiteUrl),
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
      isFeatured: Boolean(body.isFeatured),
      seoTitle: nullableString(body.seoTitle),
      seoDescription: nullableString(body.seoDescription),
      seoKeywords: nullableString(body.seoKeywords),
      externalId: nullableString(body.externalId),
      source: nullableString(body.source) || "LOCAL",
      syncStatus: body.syncStatus || "LOCAL",
      lastSyncedAt: body.lastSyncedAt ? new Date(body.lastSyncedAt) : null,
    },
  };
}

export function validateNamedPayload(payload, label = "Item") {
  if (!payload.name || !payload.slug) return `${label} name and slug are required.`;
  return null;
}

export function serializeCategory(category) {
  if (!category) return null;
  return {
    ...category,
    createdAt: category.createdAt?.toISOString?.() ?? category.createdAt,
    updatedAt: category.updatedAt?.toISOString?.() ?? category.updatedAt,
    lastSyncedAt: category.lastSyncedAt?.toISOString?.() ?? category.lastSyncedAt,
    images: category.images?.map((image) => ({
      ...image,
      createdAt: image.createdAt?.toISOString?.() ?? image.createdAt,
      updatedAt: image.updatedAt?.toISOString?.() ?? image.updatedAt,
      lastSyncedAt: image.lastSyncedAt?.toISOString?.() ?? image.lastSyncedAt,
    })),
  };
}

export function serializeBrand(brand) {
  if (!brand) return null;
  return {
    ...brand,
    createdAt: brand.createdAt?.toISOString?.() ?? brand.createdAt,
    updatedAt: brand.updatedAt?.toISOString?.() ?? brand.updatedAt,
    lastSyncedAt: brand.lastSyncedAt?.toISOString?.() ?? brand.lastSyncedAt,
  };
}

export async function replaceCategoryImages(prisma, categoryId, images) {
  await prisma.categoryImage.deleteMany({ where: { categoryId } });

  const cleanImages = images
    .filter((image) => image?.url)
    .map((image, index) => ({
      categoryId,
      url: image.url,
      type: nullableString(image.type) || "THUMBNAIL",
      alt: nullableString(image.alt),
      mediaId: nullableString(image.mediaId),
      sortOrder: intValue(image.sortOrder, index),
      source: nullableString(image.source) || "LOCAL",
      syncStatus: image.syncStatus || "LOCAL",
    }));

  if (cleanImages.length) await prisma.categoryImage.createMany({ data: cleanImages });
}
