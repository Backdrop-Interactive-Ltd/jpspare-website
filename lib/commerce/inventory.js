import { prisma } from "../db";

export const INVENTORY_READ_ROLES = ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER", "ORDER_MANAGER", "CONTENT_EDITOR"];
export const INVENTORY_ADJUST_ROLES = ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"];

export const STOCK_STATUSES = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"];
export const STOCK_MOVEMENT_TYPES = [
  "STOCK_IN",
  "STOCK_OUT",
  "ORDER_RESERVED",
  "ORDER_CONFIRMED",
  "ORDER_CANCELLED",
  "MANUAL_ADJUSTMENT",
  "RETURN_ADJUSTMENT",
];

function toInt(value, fallback = 0) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

export function availableStock(product) {
  return Math.max(0, toInt(product?.stockQuantity) - toInt(product?.reservedStock));
}

export function stockStatusFor(product) {
  const available = availableStock(product);
  const threshold = Math.max(0, toInt(product?.lowStockThreshold, 5));

  if (available <= 0) return "OUT_OF_STOCK";
  if (available <= threshold) return "LOW_STOCK";
  return "IN_STOCK";
}

export function serializeInventoryProduct(product) {
  const available = availableStock(product);

  return {
    ...product,
    price: product?.price?.toString?.() ?? product?.price,
    discountPrice: product?.discountPrice?.toString?.() ?? product?.discountPrice,
    availableStock: available,
    computedStockStatus: stockStatusFor(product),
    createdAt: product?.createdAt?.toISOString?.() ?? product?.createdAt,
    updatedAt: product?.updatedAt?.toISOString?.() ?? product?.updatedAt,
    lastSyncedAt: product?.lastSyncedAt?.toISOString?.() ?? product?.lastSyncedAt,
  };
}

export async function refreshProductStockStatus(client, productId) {
  const product = await client.product.findUnique({
    where: { id: productId },
    select: { id: true, stockQuantity: true, reservedStock: true, lowStockThreshold: true },
  });

  if (!product) return null;

  return client.product.update({
    where: { id: productId },
    data: { stockStatus: stockStatusFor(product) },
  });
}

async function recordMovement(client, data) {
  return client.inventoryMovement.create({
    data: {
      productId: data.productId,
      type: data.type,
      quantity: Math.abs(toInt(data.quantity)),
      previousStock: toInt(data.previousStock),
      newStock: toInt(data.newStock),
      previousReservedStock: toInt(data.previousReservedStock),
      newReservedStock: toInt(data.newReservedStock),
      reason: data.reason || null,
      orderId: data.orderId || null,
      purchaseOrderId: data.purchaseOrderId || null,
      adminUserId: data.adminUserId || null,
      warehouseId: data.warehouseId || null,
      warehouseRefId: data.warehouseRefId || null,
      locationId: data.locationId || null,
      binId: data.binId || null,
      warehouseStockId: data.warehouseStockId || null,
      stockTransferId: data.stockTransferId || null,
      stockTransferItemId: data.stockTransferItemId || null,
      externalStockId: data.externalStockId || null,
      source: data.source || "LOCAL",
      syncStatus: data.syncStatus || "LOCAL",
      lastSyncedAt: data.lastSyncedAt || null,
    },
  });
}

export async function validateAvailableStock(items, client = prisma) {
  const productIds = [...new Set(items.map((item) => item.productId).filter(Boolean))];

  if (!productIds.length) return null;

  const products = await client.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      title: true,
      status: true,
      stockQuantity: true,
      reservedStock: true,
      lowStockThreshold: true,
    },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  for (const item of items) {
    if (!item.productId) continue;

    const product = productMap.get(item.productId);

    if (!product) {
      return `${item.productTitle} is no longer available.`;
    }

    if (product.status !== "ACTIVE") {
      return `${product.title} is not currently available for checkout.`;
    }

    const available = availableStock(product);
    if (available < item.quantity) {
      return `${product.title} has only ${available} available item${available === 1 ? "" : "s"} in stock.`;
    }
  }

  return null;
}

export async function reserveOrderStock(client, items, order, options = {}) {
  for (const item of items) {
    if (!item.productId) continue;

    const product = await client.product.findUnique({
      where: { id: item.productId },
      select: {
        id: true,
        title: true,
        stockQuantity: true,
        reservedStock: true,
        lowStockThreshold: true,
        warehouseId: true,
        externalStockId: true,
      },
    });

    if (!product) {
      throw new Error(`${item.productTitle} is no longer available.`);
    }

    const quantity = Math.max(1, toInt(item.quantity, 1));
    const available = availableStock(product);

    if (available < quantity) {
      throw new Error(`${product.title} has only ${available} available item${available === 1 ? "" : "s"} in stock.`);
    }

    const previousReserved = toInt(product.reservedStock);
    const newReserved = previousReserved + quantity;
    const nextStatus = stockStatusFor({ ...product, reservedStock: newReserved });

    await client.product.update({
      where: { id: product.id },
      data: {
        reservedStock: newReserved,
        stockStatus: nextStatus,
      },
    });

    await recordMovement(client, {
      productId: product.id,
      type: "ORDER_RESERVED",
      quantity,
      previousStock: product.stockQuantity,
      newStock: product.stockQuantity,
      previousReservedStock: previousReserved,
      newReservedStock: newReserved,
      reason: options.reason || `Reserved for order ${order.orderNumber}`,
      orderId: order.id,
      adminUserId: options.adminUserId,
      warehouseId: product.warehouseId,
      externalStockId: product.externalStockId,
      source: options.source || "WEB",
    });
  }
}

export async function confirmOrderStock(client, order, options = {}) {
  for (const item of order.items || []) {
    if (!item.productId) continue;

    const existingMovement = await client.inventoryMovement.findFirst({
      where: { orderId: order.id, productId: item.productId, type: "ORDER_CONFIRMED" },
      select: { id: true },
    });
    if (existingMovement) continue;

    const product = await client.product.findUnique({
      where: { id: item.productId },
      select: {
        id: true,
        title: true,
        stockQuantity: true,
        reservedStock: true,
        lowStockThreshold: true,
        warehouseId: true,
        externalStockId: true,
      },
    });
    if (!product) continue;

    const quantity = Math.max(1, toInt(item.quantity, 1));
    if (toInt(product.stockQuantity) < quantity) {
      throw new Error(`${product.title} does not have enough physical stock to confirm this order.`);
    }

    const previousStock = toInt(product.stockQuantity);
    const previousReserved = toInt(product.reservedStock);
    const newStock = previousStock - quantity;
    const newReserved = Math.max(0, previousReserved - quantity);
    const nextStatus = stockStatusFor({ ...product, stockQuantity: newStock, reservedStock: newReserved });

    await client.product.update({
      where: { id: product.id },
      data: {
        stockQuantity: newStock,
        reservedStock: newReserved,
        stockStatus: nextStatus,
      },
    });

    await recordMovement(client, {
      productId: product.id,
      type: "ORDER_CONFIRMED",
      quantity,
      previousStock,
      newStock,
      previousReservedStock: previousReserved,
      newReservedStock: newReserved,
      reason: options.reason || `Stock deducted for confirmed order ${order.orderNumber}`,
      orderId: order.id,
      adminUserId: options.adminUserId,
      warehouseId: product.warehouseId,
      externalStockId: product.externalStockId,
      source: options.source || "ADMIN",
    });
  }
}

export async function cancelOrderStock(client, order, options = {}) {
  for (const item of order.items || []) {
    if (!item.productId) continue;

    const existingCancel = await client.inventoryMovement.findFirst({
      where: { orderId: order.id, productId: item.productId, type: "ORDER_CANCELLED" },
      select: { id: true },
    });
    if (existingCancel) continue;

    const product = await client.product.findUnique({
      where: { id: item.productId },
      select: {
        id: true,
        stockQuantity: true,
        reservedStock: true,
        lowStockThreshold: true,
        warehouseId: true,
        externalStockId: true,
      },
    });
    if (!product) continue;

    const confirmedMovement = await client.inventoryMovement.findFirst({
      where: { orderId: order.id, productId: item.productId, type: "ORDER_CONFIRMED" },
      select: { id: true },
    });

    const quantity = Math.max(1, toInt(item.quantity, 1));
    const previousStock = toInt(product.stockQuantity);
    const previousReserved = toInt(product.reservedStock);
    const newStock = confirmedMovement ? previousStock + quantity : previousStock;
    const newReserved = confirmedMovement ? previousReserved : Math.max(0, previousReserved - quantity);
    const nextStatus = stockStatusFor({ ...product, stockQuantity: newStock, reservedStock: newReserved });

    await client.product.update({
      where: { id: product.id },
      data: {
        stockQuantity: newStock,
        reservedStock: newReserved,
        stockStatus: nextStatus,
      },
    });

    await recordMovement(client, {
      productId: product.id,
      type: "ORDER_CANCELLED",
      quantity,
      previousStock,
      newStock,
      previousReservedStock: previousReserved,
      newReservedStock: newReserved,
      reason: options.reason || `Stock released for cancelled order ${order.orderNumber}`,
      orderId: order.id,
      adminUserId: options.adminUserId,
      warehouseId: product.warehouseId,
      externalStockId: product.externalStockId,
      source: options.source || "ADMIN",
    });
  }
}

export async function adjustProductStock(client, { productId, adjustment, reason, adminUserId, warehouseId }) {
  const quantityDelta = toInt(adjustment);
  if (!quantityDelta) {
    throw new Error("Adjustment quantity must not be zero.");
  }

  const product = await client.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      title: true,
      stockQuantity: true,
      reservedStock: true,
      lowStockThreshold: true,
      warehouseId: true,
      externalStockId: true,
    },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  const previousStock = toInt(product.stockQuantity);
  const newStock = previousStock + quantityDelta;
  const previousReserved = toInt(product.reservedStock);

  if (newStock < previousReserved) {
    throw new Error("Current stock cannot be lower than reserved stock.");
  }

  const nextStatus = stockStatusFor({ ...product, stockQuantity: newStock });

  const updated = await client.product.update({
    where: { id: product.id },
    data: {
      stockQuantity: newStock,
      stockStatus: nextStatus,
      warehouseId: warehouseId || product.warehouseId,
    },
  });

  await recordMovement(client, {
    productId: product.id,
    type: "MANUAL_ADJUSTMENT",
    quantity: Math.abs(quantityDelta),
    previousStock,
    newStock,
    previousReservedStock: previousReserved,
    newReservedStock: previousReserved,
    reason: reason || "Manual stock adjustment",
    adminUserId,
    warehouseId: warehouseId || product.warehouseId,
    externalStockId: product.externalStockId,
    source: "ADMIN",
  });

  return updated;
}

export async function receivePurchaseStock(client, purchase, options = {}) {
  for (const item of purchase.items || []) {
    if (!item.productId) continue;

    const existingMovement = await client.inventoryMovement.findFirst({
      where: { purchaseOrderId: purchase.id, productId: item.productId, type: "STOCK_IN" },
      select: { id: true },
    });
    if (existingMovement) continue;

    const product = await client.product.findUnique({
      where: { id: item.productId },
      select: {
        id: true,
        title: true,
        costPrice: true,
        stockQuantity: true,
        reservedStock: true,
        lowStockThreshold: true,
        warehouseId: true,
        externalStockId: true,
      },
    });
    if (!product) continue;

    const quantity = Math.max(1, toInt(item.quantity, 1));
    const previousStock = toInt(product.stockQuantity);
    const previousReserved = toInt(product.reservedStock);
    const newStock = previousStock + quantity;
    const nextStatus = stockStatusFor({ ...product, stockQuantity: newStock });
    const warehouseId = options.warehouseId || purchase.warehouseId || product.warehouseId;

    await client.product.update({
      where: { id: product.id },
      data: {
        stockQuantity: newStock,
        stockStatus: nextStatus,
        costPrice: item.costPrice,
        warehouseId,
      },
    });

    await client.purchaseOrderItem.update({
      where: { id: item.id },
      data: { receivedQuantity: quantity },
    });

    await recordMovement(client, {
      productId: product.id,
      type: "STOCK_IN",
      quantity,
      previousStock,
      newStock,
      previousReservedStock: previousReserved,
      newReservedStock: previousReserved,
      reason: options.reason || `Received purchase ${purchase.purchaseNumber}`,
      purchaseOrderId: purchase.id,
      adminUserId: options.adminUserId,
      warehouseId,
      externalStockId: product.externalStockId,
      source: options.source || "PURCHASE",
    });
  }
}
