export const SUPPLIER_MANAGE_ROLES = ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"];
export const SUPPLIER_READ_ROLES = ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER", "ORDER_MANAGER"];
export const PURCHASE_MANAGE_ROLES = ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"];
export const PURCHASE_READ_ROLES = ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER", "ORDER_MANAGER"];

export const SUPPLIER_STATUSES = ["ACTIVE", "INACTIVE"];
export const PURCHASE_STATUSES = ["DRAFT", "ORDERED", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"];

function nullableString(value) {
  if (value === undefined || value === null) return null;
  const clean = String(value).trim();
  return clean ? clean : null;
}

function intValue(value, fallback = 0) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

function decimalString(value, fallback = "0") {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number.toFixed(2) : fallback;
}

export function supplierInclude() {
  return {
    _count: { select: { purchases: true } },
  };
}

export function purchaseInclude() {
  return {
    supplier: true,
    createdBy: { select: { id: true, name: true, email: true } },
    updatedBy: { select: { id: true, name: true, email: true } },
    items: {
      include: {
        product: {
          include: {
            brand: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
            images: { orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }], take: 1 },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    },
    timeline: {
      include: { adminUser: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    },
    inventoryMovements: {
      include: { product: { select: { id: true, title: true, sku: true } } },
      orderBy: { createdAt: "desc" },
    },
  };
}

export function makePurchaseNumber() {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PO-${stamp}-${suffix}`;
}

export function normalizeSupplierPayload(body) {
  return {
    name: nullableString(body.name),
    companyName: nullableString(body.companyName),
    contactPerson: nullableString(body.contactPerson),
    phone: nullableString(body.phone),
    email: nullableString(body.email),
    address: nullableString(body.address),
    notes: nullableString(body.notes),
    status: SUPPLIER_STATUSES.includes(body.status) ? body.status : "ACTIVE",
    externalId: nullableString(body.externalId),
    source: nullableString(body.source) || "LOCAL",
    syncStatus: body.syncStatus || "LOCAL",
    lastSyncedAt: body.lastSyncedAt ? new Date(body.lastSyncedAt) : null,
  };
}

export function validateSupplierPayload(payload) {
  if (!payload.name) return "Supplier name is required.";
  return null;
}

export function normalizePurchasePayload(body, productMap = new Map()) {
  const items = (Array.isArray(body.items) ? body.items : [])
    .map((item) => {
      const product = item.productId ? productMap.get(item.productId) : null;
      const quantity = Math.max(1, intValue(item.quantity, 1));
      const costPrice = decimalString(item.costPrice || product?.costPrice || 0);
      const total = (Number(costPrice) * quantity).toFixed(2);

      return {
        productId: nullableString(item.productId),
        productTitle: nullableString(item.productTitle) || product?.title || "Purchase item",
        sku: nullableString(item.sku) || product?.sku || null,
        quantity,
        receivedQuantity: Math.max(0, intValue(item.receivedQuantity, 0)),
        costPrice,
        total,
      };
    })
    .filter((item) => item.productTitle && item.quantity > 0);

  const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0).toFixed(2);

  return {
    purchase: {
      supplierId: nullableString(body.supplierId),
      status: PURCHASE_STATUSES.includes(body.status) ? body.status : "DRAFT",
      subtotal,
      total: subtotal,
      notes: nullableString(body.notes),
      warehouseId: nullableString(body.warehouseId),
      externalPurchaseId: nullableString(body.externalPurchaseId),
      externalId: nullableString(body.externalId),
      source: nullableString(body.source) || "LOCAL",
      syncStatus: body.syncStatus || "LOCAL",
      lastSyncedAt: body.lastSyncedAt ? new Date(body.lastSyncedAt) : null,
    },
    items,
  };
}

export function validatePurchasePayload(payload) {
  if (!payload.items.length) return "Add at least one purchase item.";
  for (const item of payload.items) {
    if (!item.productId && !item.productTitle) return "Every purchase item needs a product or title.";
    if (item.quantity <= 0) return "Purchase quantity must be greater than zero.";
    if (Number(item.costPrice) < 0) return "Cost price cannot be negative.";
  }
  return null;
}

export function timelineTypeForStatus(status) {
  if (status === "ORDERED") return "ORDERED";
  if (status === "RECEIVED") return "RECEIVED";
  if (status === "CANCELLED") return "CANCELLED";
  return "STATUS_CHANGED";
}

export function statusDatePatch(status) {
  const now = new Date();
  if (status === "ORDERED") return { orderedAt: now };
  if (status === "RECEIVED") return { receivedAt: now };
  if (status === "CANCELLED") return { cancelledAt: now };
  return {};
}

function dateValue(value) {
  return value?.toISOString?.() ?? value ?? null;
}

export function serializeSupplier(supplier) {
  if (!supplier) return null;
  return {
    ...supplier,
    createdAt: dateValue(supplier.createdAt),
    updatedAt: dateValue(supplier.updatedAt),
    lastSyncedAt: dateValue(supplier.lastSyncedAt),
  };
}

export function serializePurchase(purchase) {
  if (!purchase) return null;
  return {
    ...purchase,
    subtotal: purchase.subtotal?.toString?.() ?? purchase.subtotal,
    total: purchase.total?.toString?.() ?? purchase.total,
    createdAt: dateValue(purchase.createdAt),
    updatedAt: dateValue(purchase.updatedAt),
    lastSyncedAt: dateValue(purchase.lastSyncedAt),
    orderedAt: dateValue(purchase.orderedAt),
    receivedAt: dateValue(purchase.receivedAt),
    cancelledAt: dateValue(purchase.cancelledAt),
    items: purchase.items?.map((item) => ({
      ...item,
      costPrice: item.costPrice?.toString?.() ?? item.costPrice,
      total: item.total?.toString?.() ?? item.total,
      createdAt: dateValue(item.createdAt),
      updatedAt: dateValue(item.updatedAt),
    })),
    timeline: purchase.timeline?.map((event) => ({
      ...event,
      createdAt: dateValue(event.createdAt),
    })),
    inventoryMovements: purchase.inventoryMovements?.map((movement) => ({
      ...movement,
      createdAt: dateValue(movement.createdAt),
      lastSyncedAt: dateValue(movement.lastSyncedAt),
    })),
  };
}
