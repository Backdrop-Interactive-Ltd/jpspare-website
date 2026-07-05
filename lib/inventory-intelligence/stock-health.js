const DAY_MS = 24 * 60 * 60 * 1000;

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function quantityFromOrder(order) {
  if (!order) return 0;
  if (Number.isFinite(Number(order.quantity))) return toNumber(order.quantity);
  if (Array.isArray(order.items)) {
    return order.items.reduce((sum, item) => sum + toNumber(item.quantity), 0);
  }
  if (Array.isArray(order.orderItems)) {
    return order.orderItems.reduce((sum, item) => sum + toNumber(item.quantity), 0);
  }
  return 1;
}

function orderDate(order) {
  return toDate(order?.deliveredAt || order?.completedAt || order?.paidAt || order?.createdAt || order?.updatedAt);
}

function isSaleMovement(movement) {
  const type = String(movement?.type || "").toUpperCase();
  return type === "ORDER_CONFIRMED" || type === "STOCK_OUT" || type.includes("SALE");
}

function movementQuantity(movement) {
  return Math.abs(toNumber(movement?.quantity));
}

function movementDate(movement) {
  return toDate(movement?.createdAt || movement?.updatedAt);
}

function sumSalesInWindow({ orders = [], inventoryMovements = [], days }) {
  const since = Date.now() - days * DAY_MS;
  const orderSales = Array.isArray(orders)
    ? orders.reduce((sum, order) => {
        const date = orderDate(order);
        if (!date || date.getTime() < since) return sum;
        return sum + quantityFromOrder(order);
      }, 0)
    : 0;
  const movementSales = Array.isArray(inventoryMovements)
    ? inventoryMovements.reduce((sum, movement) => {
        const date = movementDate(movement);
        if (!date || date.getTime() < since || !isSaleMovement(movement)) return sum;
        return sum + movementQuantity(movement);
      }, 0)
    : 0;

  return orderSales + movementSales;
}

export function calculateVelocityScore({
  salesLast7Days = 0,
  salesLast30Days = 0,
  salesLast90Days = 0,
} = {}) {
  const weightedSales =
    toNumber(salesLast7Days) * 0.5 +
    toNumber(salesLast30Days) * 0.3 +
    toNumber(salesLast90Days) * 0.2;

  return Math.max(0, Math.min(1, weightedSales / 100));
}

export function getDaysSinceLastSale(orders = []) {
  if (!Array.isArray(orders) || !orders.length) return null;

  const latestSale = orders
    .map(orderDate)
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  if (!latestSale) return null;
  return Math.max(0, Math.floor((Date.now() - latestSale.getTime()) / DAY_MS));
}

export function analyzeProductStockHealth(product = {}) {
  const stockQuantity = Math.max(0, toNumber(product.stockQuantity));
  const reservedStock = Math.max(0, toNumber(product.reservedStock));
  const lowStockThreshold = Math.max(1, toNumber(product.lowStockThreshold, 5));
  const orders = Array.isArray(product.orders) ? product.orders : [];
  const inventoryMovements = Array.isArray(product.inventoryMovements) ? product.inventoryMovements : [];
  const availableStock = stockQuantity - reservedStock;
  const salesLast7Days = sumSalesInWindow({ orders, inventoryMovements, days: 7 });
  const salesLast30Days = sumSalesInWindow({ orders, inventoryMovements, days: 30 });
  const salesLast90Days = sumSalesInWindow({ orders, inventoryMovements, days: 90 });
  const velocityScore = calculateVelocityScore({
    salesLast7Days,
    salesLast30Days,
    salesLast90Days,
  });
  const daysSinceLastSale = getDaysSinceLastSale(orders);
  const flags = [];
  let healthStatus = "HEALTHY";

  if (availableStock <= 0) {
    healthStatus = "OUT_OF_STOCK";
    flags.push("LOW_STOCK", "CRITICAL_STOCK");
  } else if (availableStock <= lowStockThreshold / 2) {
    healthStatus = "CRITICAL";
    flags.push("LOW_STOCK", "CRITICAL_STOCK");
  } else if (availableStock <= lowStockThreshold) {
    healthStatus = "LOW";
    flags.push("LOW_STOCK");
  } else if (velocityScore > 0.8 && stockQuantity > lowStockThreshold * 3) {
    healthStatus = "OVERSTOCK";
    flags.push("OVERSTOCKED");
  }

  if (daysSinceLastSale === null || daysSinceLastSale > 90) {
    flags.push("NO_RECENT_SALES");
  }
  if (velocityScore > 0.8) {
    flags.push("FAST_MOVING");
  }

  return {
    availableStock,
    healthStatus,
    velocityScore,
    salesLast7Days,
    salesLast30Days,
    salesLast90Days,
    daysSinceLastSale,
    flags: Array.from(new Set(flags)),
  };
}
