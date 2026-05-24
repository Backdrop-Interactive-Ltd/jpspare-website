const SYNC_STATUSES = new Set(["LOCAL", "PENDING", "SYNCED", "FAILED"]);
const PRODUCT_STATUSES = new Set(["DRAFT", "ACTIVE", "ARCHIVED"]);

export function parsePagination(searchParams, defaults = {}) {
  const defaultPage = defaults.page || 1;
  const defaultLimit = defaults.limit || 50;
  const maxLimit = defaults.maxLimit || 100;

  const rawPage = Number(searchParams.get("page") || defaultPage);
  const rawLimit = Number(searchParams.get("limit") || defaultLimit);

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : defaultPage;
  const limit =
    Number.isInteger(rawLimit) && rawLimit > 0
      ? Math.min(rawLimit, maxLimit)
      : defaultLimit;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function parseUpdatedSince(searchParams) {
  const value = searchParams.get("updatedSince");
  if (!value) return { value: null, error: null };

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return {
      value: null,
      error: "updatedSince must be a valid ISO date.",
    };
  }

  return { value: parsed, error: null };
}

export function parseSyncStatus(searchParams) {
  const value = normalizeEnumValue(searchParams.get("syncStatus"));
  if (!value) return { value: null, error: null };
  if (!SYNC_STATUSES.has(value)) {
    return {
      value: null,
      error: "syncStatus must be LOCAL, PENDING, SYNCED, or FAILED.",
    };
  }
  return { value, error: null };
}

export function parseProductStatus(searchParams) {
  const value = normalizeEnumValue(searchParams.get("status"));
  if (!value) return { value: null, error: null };
  if (!PRODUCT_STATUSES.has(value)) {
    return {
      value: null,
      error: "status must be DRAFT, ACTIVE, or ARCHIVED.",
    };
  }
  return { value, error: null };
}

export function parseBooleanFilter(searchParams, key) {
  const value = searchParams.get(key);
  if (value == null || value === "") return { value: null, error: null };

  const normalized = value.toLowerCase();
  if (["true", "1", "yes", "active"].includes(normalized)) {
    return { value: true, error: null };
  }
  if (["false", "0", "no", "inactive"].includes(normalized)) {
    return { value: false, error: null };
  }

  return {
    value: null,
    error: `${key} must be true or false.`,
  };
}

export function queryErrorResponse(message) {
  return Response.json(
    {
      ok: false,
      error: {
        code: "INVALID_QUERY",
        message,
      },
    },
    { status: 400 },
  );
}

export function serverErrorResponse() {
  return Response.json(
    {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: "Unable to process BMS lookup request.",
      },
    },
    { status: 500 },
  );
}

export function paginationMeta({ page, limit, total }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function serializeProduct(product) {
  const primaryImage = product.images?.[0]
    ? {
        id: product.images[0].id,
        url: product.images[0].url,
        alt: product.images[0].alt,
        source: product.images[0].source,
      }
    : product.media?.[0]?.media
      ? {
          id: product.media[0].media.id,
          url: product.media[0].media.url,
          alt: product.media[0].alt || product.media[0].media.alt,
          fileName: product.media[0].media.fileName || product.media[0].media.filename,
        }
      : null;

  return {
    id: product.id,
    externalId: product.externalId,
    source: product.source,
    syncStatus: product.syncStatus,
    lastSyncedAt: toIso(product.lastSyncedAt),
    sku: product.sku,
    title: product.title,
    name: product.title,
    slug: product.slug,
    status: product.status,
    price: decimalToString(product.price),
    salePrice: decimalToString(product.discountPrice),
    stockQuantity: product.stockQuantity,
    reservedStock: product.reservedStock,
    category: product.category
      ? {
          id: product.category.id,
          externalId: product.category.externalId,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    brand: product.brand
      ? {
          id: product.brand.id,
          externalId: product.brand.externalId,
          name: product.brand.name,
          slug: product.brand.slug,
        }
      : null,
    primaryImage,
    createdAt: toIso(product.createdAt),
    updatedAt: toIso(product.updatedAt),
  };
}

export function serializeCategory(category) {
  return {
    id: category.id,
    externalId: category.externalId,
    source: category.source,
    syncStatus: category.syncStatus,
    lastSyncedAt: toIso(category.lastSyncedAt),
    name: category.name,
    slug: category.slug,
    parent: category.parent
      ? {
          id: category.parent.id,
          externalId: category.parent.externalId,
          name: category.parent.name,
          slug: category.parent.slug,
        }
      : null,
    parentId: category.parentId,
    parentExternalId: category.parent?.externalId || null,
    isActive: category.isActive,
    status: category.isActive ? "ACTIVE" : "INACTIVE",
    sortOrder: category.sortOrder,
    createdAt: toIso(category.createdAt),
    updatedAt: toIso(category.updatedAt),
  };
}

export function serializeBrand(brand) {
  return {
    id: brand.id,
    externalId: brand.externalId,
    source: brand.source,
    syncStatus: brand.syncStatus,
    lastSyncedAt: toIso(brand.lastSyncedAt),
    name: brand.name,
    slug: brand.slug,
    logo: brand.logoUrl
      ? {
          url: brand.logoUrl,
        }
      : null,
    coverImage: brand.coverImageUrl
      ? {
          url: brand.coverImageUrl,
        }
      : null,
    isActive: brand.isActive,
    status: brand.isActive ? "ACTIVE" : "INACTIVE",
    createdAt: toIso(brand.createdAt),
    updatedAt: toIso(brand.updatedAt),
  };
}

function normalizeEnumValue(value) {
  return value ? value.trim().toUpperCase() : null;
}

function decimalToString(value) {
  if (value == null) return null;
  return typeof value.toString === "function" ? value.toString() : String(value);
}

function toIso(value) {
  return value ? value.toISOString() : null;
}
