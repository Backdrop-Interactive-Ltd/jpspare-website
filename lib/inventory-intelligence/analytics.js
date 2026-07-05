import { analyzeSupplierPerformance } from "./supplier-performance";

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function average(values = []) {
  const cleanValues = values.map((value) => toNumber(value)).filter((value) => value > 0);
  if (!cleanValues.length) return 0;
  return cleanValues.reduce((sum, value) => sum + value, 0) / cleanValues.length;
}

function increment(distribution, key) {
  const safeKey = key || "Unclassified";
  distribution[safeKey] = (distribution[safeKey] || 0) + 1;
  return distribution;
}

function forecastConfidenceLabel(score) {
  const confidence = toNumber(score);
  if (confidence >= 0.75) return "HIGH";
  if (confidence >= 0.5) return "MEDIUM";
  return "LOW";
}

function purchaseForSupplierEngine(purchase) {
  return {
    createdAt: purchase.createdAt || purchase.orderedAt,
    expectedDeliveryDate: purchase.expectedDeliveryDate || purchase.orderedAt,
    receivedAt: purchase.receivedAt,
    totalAmount: purchase.total || purchase.subtotal,
    status: purchase.status,
  };
}

function supplierTierDistribution(suppliers = []) {
  return suppliers.reduce((distribution, supplier) => {
    const result = analyzeSupplierPerformance({
      purchases: Array.isArray(supplier.purchases) ? supplier.purchases.map(purchaseForSupplierEngine) : [],
      products: [],
    });
    return increment(distribution, result.supplierTier);
  }, {});
}

export function buildInventoryIntelligenceAnalytics({
  stockProducts = [],
  analyticsRows = [],
  deadStockRows = [],
  forecastRows = [],
  suppliers = [],
} = {}) {
  const totalStockUnits = stockProducts.reduce((sum, product) => sum + Math.max(0, toNumber(product.stockQuantity)), 0);
  const totalSalesLast90Days = analyticsRows.reduce((sum, row) => sum + Math.max(0, toNumber(row.salesLast90Days)), 0);
  const inventoryTurnoverRatio = totalStockUnits > 0 ? totalSalesLast90Days / totalStockUnits : 0;
  const averageDaysWithoutSale = average(deadStockRows.map((row) => row.daysWithoutSale));
  const fastMovingProductCount = analyticsRows.filter((row) => toNumber(row.velocityScore) >= 0.8).length;
  const slowMovingProductCount = analyticsRows.filter((row) => toNumber(row.velocityScore) <= 0.2 || toNumber(row.salesLast90Days) === 0).length;
  const forecastConfidenceDistribution = forecastRows.reduce((distribution, forecast) => {
    return increment(distribution, forecastConfidenceLabel(forecast.confidenceScore));
  }, {});

  return {
    analytics: {
      inventoryTurnoverRatio,
      averageDaysWithoutSale,
      fastMovingProductCount,
      slowMovingProductCount,
    },
    distributions: {
      supplierTierDistribution: supplierTierDistribution(suppliers),
      forecastConfidenceDistribution,
    },
  };
}
