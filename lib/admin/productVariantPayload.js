const SYNC_STATUSES = new Set(["LOCAL", "PENDING", "SYNCED", "FAILED"]);
const EDITABLE_FIELDS = [
  "sku",
  "barcode",
  "displayName",
  "price",
  "compareAtPrice",
  "discountPrice",
  "imageUrl",
  "isDefault",
  "isActive",
  "sortOrder",
  "externalId",
  "source",
  "syncStatus",
  "lastSyncedAt",
];

export function cleanString(value) {
  if (value === undefined || value === null) return null;
  const clean = String(value).trim();
  return clean || null;
}

export function decimalValue(value, field) {
  if (value === undefined) return { value: undefined };
  if (value === null || value === "") return { value: null };
  const number = Number(value);
  if (!Number.isFinite(number)) return { error: `${field} must be a valid number.` };
  return { value: number.toFixed(2) };
}

export function intValue(value, field) {
  if (value === undefined) return { value: undefined };
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return { error: `${field} must be a valid integer.` };
  return { value: number };
}

export function booleanValue(value) {
  if (value === undefined) return undefined;
  return Boolean(value);
}

export function imageUrlValue(value) {
  const clean = cleanString(value);
  if (!clean) return { value: null };
  if (clean.startsWith("/")) return { value: clean };

  try {
    const url = new URL(clean);
    if (url.protocol === "http:" || url.protocol === "https:") return { value: url.toString() };
  } catch {
    return { error: "imageUrl must be a valid URL or absolute path." };
  }

  return { error: "imageUrl must be a valid URL or absolute path." };
}

export function dateValue(value) {
  if (value === undefined) return { value: undefined };
  if (value === null || value === "") return { value: null };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { error: "lastSyncedAt must be a valid date." };
  return { value: date };
}

export function normalizeProductVariantPayload(body = {}, { partial = false } = {}) {
  const data = {};
  const errors = [];
  const source = partial ? EDITABLE_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(body, field)) : EDITABLE_FIELDS;

  for (const field of source) {
    if (field === "price" || field === "compareAtPrice" || field === "discountPrice") {
      const result = decimalValue(body[field], field);
      if (result.error) errors.push(result.error);
      else if (result.value !== undefined) data[field] = result.value;
    } else if (field === "sortOrder") {
      const result = intValue(body[field] ?? (partial ? undefined : 0), "sortOrder");
      if (result.error) errors.push(result.error);
      else if (result.value !== undefined) data.sortOrder = result.value;
    } else if (field === "imageUrl") {
      const result = imageUrlValue(body.imageUrl);
      if (result.error) errors.push(result.error);
      else if (result.value !== undefined) data.imageUrl = result.value;
    } else if (field === "isDefault" || field === "isActive") {
      const value = booleanValue(body[field]);
      if (value !== undefined) data[field] = value;
      else if (!partial && field === "isDefault") data.isDefault = false;
      else if (!partial && field === "isActive") data.isActive = true;
    } else if (field === "syncStatus") {
      const clean = cleanString(body.syncStatus);
      if (clean && !SYNC_STATUSES.has(clean)) errors.push("syncStatus must be LOCAL, PENDING, SYNCED, or FAILED.");
      else if (clean || !partial) data.syncStatus = clean;
    } else if (field === "lastSyncedAt") {
      const result = dateValue(body.lastSyncedAt);
      if (result.error) errors.push(result.error);
      else if (result.value !== undefined) data.lastSyncedAt = result.value;
    } else {
      const value = cleanString(body[field]);
      if (value !== null || !partial) data[field] = value;
    }
  }

  return { data, errors };
}

export function serializeProductVariant(item) {
  if (!item) return null;
  return {
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    variant: item.variant
      ? {
          id: item.variant.id,
          name: item.variant.name,
          slug: item.variant.slug,
          description: item.variant.description,
          isActive: item.variant.isActive,
        }
      : null,
    sku: item.sku,
    barcode: item.barcode,
    displayName: item.displayName,
    price: item.price?.toString?.() ?? item.price,
    compareAtPrice: item.compareAtPrice?.toString?.() ?? item.compareAtPrice,
    discountPrice: item.discountPrice?.toString?.() ?? item.discountPrice,
    imageUrl: item.imageUrl,
    isDefault: item.isDefault,
    isActive: item.isActive,
    sortOrder: item.sortOrder,
    externalId: item.externalId,
    source: item.source,
    syncStatus: item.syncStatus,
    lastSyncedAt: item.lastSyncedAt?.toISOString?.() ?? item.lastSyncedAt,
    createdAt: item.createdAt?.toISOString?.() ?? item.createdAt,
    updatedAt: item.updatedAt?.toISOString?.() ?? item.updatedAt,
  };
}

export function productVariantInclude() {
  return {
    variant: {
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
      },
    },
  };
}
