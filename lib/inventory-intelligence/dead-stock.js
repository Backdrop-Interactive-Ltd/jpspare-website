const DAY_MS = 24 * 60 * 60 * 1000;

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function positiveNumber(value, fallback = 0) {
  return Math.max(0, toNumber(value, fallback));
}

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function orderDate(order) {
  return toDate(order?.deliveredAt || order?.completedAt || order?.paidAt || order?.createdAt || order?.updatedAt);
}

function daysSince(date) {
  if (!date) return null;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / DAY_MS));
}

export function getLastSoldDate(orders = []) {
  if (!Array.isArray(orders) || !orders.length) return null;

  return orders
    .map(orderDate)
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime())[0] || null;
}

export function getDeadStockSeverity(daysWithoutSale) {
  const days = toNumber(daysWithoutSale, 0);

  if (days >= 365) return "CRITICAL";
  if (days >= 180) return "HIGH";
  if (days >= 90) return "MEDIUM";
  if (days >= 60) return "LOW";
  return "NONE";
}

export function calculateDeadStockValue({
  stockQuantity = 0,
  costPrice = 0,
} = {}) {
  return positiveNumber(stockQuantity) * positiveNumber(costPrice);
}

function reasonForSeverity(severity) {
  if (severity === "CRITICAL") return "No sales in the last year";
  if (severity === "HIGH") return "No sales in the last 180 days";
  if (severity === "MEDIUM") return "No sales in the last 90 days";
  if (severity === "LOW") return "No sales in the last 60 days";
  return "Recent sales activity detected";
}

export function detectDeadStock(product = {}) {
  const stockQuantity = positiveNumber(product.stockQuantity);
  const lastSoldAt = getLastSoldDate(product.orders);
  const daysWithoutSale = lastSoldAt ? daysSince(lastSoldAt) : stockQuantity > 0 ? 365 : 0;
  const severity = getDeadStockSeverity(daysWithoutSale);
  const isDeadStock = stockQuantity > 0 && daysWithoutSale >= 60;

  return {
    isDeadStock,
    severity,
    daysWithoutSale,
    lastSoldAt,
    estimatedValue: calculateDeadStockValue({
      stockQuantity,
      costPrice: product.costPrice,
    }),
    reason: reasonForSeverity(severity),
  };
}
