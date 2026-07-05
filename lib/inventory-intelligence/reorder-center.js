function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function positiveNumber(value, fallback = 0) {
  return Math.max(0, toNumber(value, fallback));
}

export function calculateSuggestedQuantity({
  salesLast30Days = 0,
  leadTimeDays = 0,
  lowStockThreshold = 5,
} = {}) {
  const threshold = Math.max(1, positiveNumber(lowStockThreshold, 5));
  const averageDailySales = positiveNumber(salesLast30Days) / 30;
  const targetCoverageDays = Math.max(30, positiveNumber(leadTimeDays) * 2);
  const projectedQuantity = Math.ceil(averageDailySales * targetCoverageDays);

  return Math.max(threshold, projectedQuantity, 0);
}

export function determineReorderPriority({
  availableStock = 0,
  lowStockThreshold = 5,
} = {}) {
  const stock = toNumber(availableStock);
  const threshold = Math.max(1, positiveNumber(lowStockThreshold, 5));

  if (stock <= 0) return "CRITICAL";
  if (stock <= threshold) return "HIGH";
  if (stock <= threshold * 2) return "MEDIUM";
  return "LOW";
}

function buildReason({ availableStock, lowStockThreshold, estimatedDemand, supplierName }) {
  if (availableStock <= 0) return "Out of stock";
  if (availableStock <= lowStockThreshold) return "Below low stock threshold";
  if (estimatedDemand > availableStock) return "Projected demand exceeds available inventory";
  if (supplierName) return `Monitor supplier availability for ${supplierName}`;
  return "Inventory level is currently acceptable";
}

export function generateReorderSuggestion(product = {}) {
  const stockQuantity = positiveNumber(product.stockQuantity);
  const reservedStock = positiveNumber(product.reservedStock);
  const lowStockThreshold = Math.max(1, positiveNumber(product.lowStockThreshold, 5));
  const leadTimeDays = positiveNumber(product.leadTimeDays);
  const analytics = product.analytics || {};
  const salesLast30Days = positiveNumber(analytics.salesLast30Days);
  const velocityScore = positiveNumber(analytics.velocityScore);
  const availableStock = stockQuantity - reservedStock;
  const suggestedQuantity = calculateSuggestedQuantity({
    salesLast30Days,
    leadTimeDays,
    lowStockThreshold,
  });
  const targetCoverageDays = Math.max(30, leadTimeDays * 2);
  const estimatedDemand = Math.ceil((salesLast30Days / 30) * targetCoverageDays);
  const priority = determineReorderPriority({ availableStock, lowStockThreshold });
  const demandExceedsStock = estimatedDemand > availableStock && velocityScore > 0;
  const shouldReorder =
    priority === "CRITICAL" ||
    priority === "HIGH" ||
    priority === "MEDIUM" ||
    demandExceedsStock;

  return {
    shouldReorder,
    suggestedQuantity: shouldReorder ? suggestedQuantity : 0,
    priority,
    reason: buildReason({
      availableStock,
      lowStockThreshold,
      estimatedDemand,
      supplierName: product.supplierName,
    }),
    estimatedDemand,
    currentStock: stockQuantity,
    leadTimeDays,
  };
}
