const DAY_MS = 24 * 60 * 60 * 1000;
const COMPLETED_STATUSES = new Set(["COMPLETED", "DELIVERED"]);

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

function isCompletedOrder(order) {
  const status = order?.status;
  if (!status) return true;
  return COMPLETED_STATUSES.has(String(status).toUpperCase());
}

function orderQuantity(order) {
  if (!order) return 0;
  if (Number.isFinite(Number(order.quantity))) return positiveNumber(order.quantity);
  if (Array.isArray(order.items)) {
    return order.items.reduce((sum, item) => sum + positiveNumber(item.quantity), 0);
  }
  if (Array.isArray(order.orderItems)) {
    return order.orderItems.reduce((sum, item) => sum + positiveNumber(item.quantity), 0);
  }
  return 1;
}

export function calculateSalesInWindow(orders = [], days = 30) {
  if (!Array.isArray(orders) || !orders.length) return 0;

  const windowDays = Math.max(1, positiveNumber(days, 30));
  const since = Date.now() - windowDays * DAY_MS;

  return orders.reduce((sum, order) => {
    const date = orderDate(order);
    if (!date || date.getTime() < since || !isCompletedOrder(order)) return sum;
    return sum + orderQuantity(order);
  }, 0);
}

export function calculateForecastConfidence(salesLast90Days = 0) {
  const sales = positiveNumber(salesLast90Days);

  if (sales >= 30) return { level: "HIGH", score: 0.85 };
  if (sales >= 10) return { level: "MEDIUM", score: 0.6 };
  return { level: "LOW", score: 0.35 };
}

export function calculateProjectedStockoutDate({
  availableStock = 0,
  averageDailySales = 0,
} = {}) {
  const stock = positiveNumber(availableStock);
  const dailySales = positiveNumber(averageDailySales);

  if (dailySales <= 0) return null;

  const daysUntilStockout = stock / dailySales;
  return new Date(Date.now() + daysUntilStockout * DAY_MS);
}

export function forecastProductDemand(product = {}, options = {}) {
  const forecastDays = Math.max(1, positiveNumber(options.forecastDays, 30));
  const orders = Array.isArray(product.orders) ? product.orders : [];
  const stockQuantity = positiveNumber(product.stockQuantity);
  const reservedStock = positiveNumber(product.reservedStock);
  const availableStock = stockQuantity - reservedStock;
  const salesLast30Days = calculateSalesInWindow(orders, 30);
  const salesLast90Days = calculateSalesInWindow(orders, 90);
  const averageDailySales = salesLast90Days / 90;
  const forecastQuantity = Math.ceil(averageDailySales * forecastDays);
  const confidence = calculateForecastConfidence(salesLast90Days);

  return {
    forecastQuantity,
    confidenceScore: confidence.score,
    method: "MOVING_AVERAGE",
    averageDailySales,
    salesLast30Days,
    salesLast90Days,
    projectedStockoutDate: calculateProjectedStockoutDate({
      availableStock,
      averageDailySales,
    }),
  };
}
