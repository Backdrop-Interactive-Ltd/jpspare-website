import { analyzeSupplierPerformance } from "../inventory-intelligence/supplier-performance";

const VALID_SEVERITIES = new Set(["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"]);
const SEVERITY_RANK = {
  INFO: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

const DAY_MS = 24 * 60 * 60 * 1000;

function cleanString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const stringValue = String(value).trim();
  return stringValue || fallback;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function positiveNumber(value, fallback = 0) {
  return Math.max(0, toNumber(value, fallback));
}

function clampScore(value, fallback = 0.5) {
  return Math.max(0, Math.min(1, toNumber(value, fallback)));
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function labelFromType(type) {
  return cleanString(type)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function severityToConfidence(severity) {
  if (severity === "CRITICAL") return 0.95;
  if (severity === "HIGH") return 0.85;
  if (severity === "MEDIUM") return 0.65;
  if (severity === "LOW") return 0.45;
  return 0.35;
}

function severityFromPriority(priority) {
  const value = cleanString(priority).toUpperCase();
  if (value === "CRITICAL") return "CRITICAL";
  if (value === "HIGH") return "HIGH";
  if (value === "MEDIUM") return "MEDIUM";
  if (value === "LOW") return "LOW";
  return "INFO";
}

function normalizeProduct(product = {}) {
  return {
    ...product,
    id: cleanString(product.id || product.productId, null),
    name: cleanString(product.name || product.title, "Unnamed product"),
    sku: cleanString(product.sku || product.SKU),
    stockQuantity: Math.max(0, toNumber(product.stockQuantity)),
    reservedStock: Math.max(0, toNumber(product.reservedStock)),
  };
}

function availableStockFrom(input = {}) {
  const warehouseRows = toArray(input.warehouseStock);
  if (warehouseRows.length) {
    return warehouseRows.reduce((sum, row) => sum + positiveNumber(row.available ?? row.onHand), 0);
  }

  const product = normalizeProduct(input.product);
  return Math.max(0, product.stockQuantity - product.reservedStock);
}

function purchaseDate(purchase = {}) {
  return toDate(
    purchase.receivedAt ||
      purchase.orderedAt ||
      purchase.createdAt ||
      purchase.purchaseOrder?.receivedAt ||
      purchase.purchaseOrder?.orderedAt ||
      purchase.purchaseOrder?.createdAt
  );
}

function productMatchesCostRecord(record = {}, productId) {
  if (!productId) return true;
  if (record.productId && record.productId === productId) return true;
  if (record.product?.id && record.product.id === productId) return true;
  return !record.productId && !record.product?.id;
}

function collectPurchaseCostRecords(purchases = [], productId = null) {
  const records = [];

  for (const purchase of toArray(purchases)) {
    if (Array.isArray(purchase.items)) {
      for (const item of purchase.items) {
        if (!productMatchesCostRecord(item, productId)) continue;
        records.push({
          cost: positiveNumber(item.costPrice ?? item.unitCost ?? item.price),
          date: purchaseDate({ ...item, purchaseOrder: purchase }),
        });
      }
      continue;
    }

    if (Array.isArray(purchase.purchaseItems)) {
      for (const item of purchase.purchaseItems) {
        if (!productMatchesCostRecord(item, productId)) continue;
        records.push({
          cost: positiveNumber(item.costPrice ?? item.unitCost ?? item.price),
          date: purchaseDate({ ...item, purchaseOrder: purchase }),
        });
      }
      continue;
    }

    if (!productMatchesCostRecord(purchase, productId)) continue;
    records.push({
      cost: positiveNumber(purchase.costPrice ?? purchase.unitCost ?? purchase.price),
      date: purchaseDate(purchase),
    });
  }

  return records.filter((record) => record.cost > 0);
}

function sortedPurchaseCosts(purchases = [], productId = null) {
  return collectPurchaseCostRecords(purchases, productId).sort((a, b) => {
    const bTime = b.date?.getTime?.() || 0;
    const aTime = a.date?.getTime?.() || 0;
    return bTime - aTime;
  });
}

function averageDailyDemandFromForecast(demandForecast = {}) {
  const forecastQuantity = positiveNumber(demandForecast.forecastQuantity);
  if (Number.isFinite(Number(demandForecast.averageDailyDemand))) {
    return positiveNumber(demandForecast.averageDailyDemand);
  }
  if (Number.isFinite(Number(demandForecast.averageDailySales))) {
    return positiveNumber(demandForecast.averageDailySales);
  }

  const start = toDate(demandForecast.periodStart);
  const end = toDate(demandForecast.periodEnd);
  if (start && end && end.getTime() > start.getTime()) {
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / DAY_MS));
    return forecastQuantity / days;
  }

  return forecastQuantity / 30;
}

function bestSupplierPerformance(suppliers = []) {
  const rows = toArray(suppliers)
    .map((supplier) => ({
      supplier,
      performance: analyzeSupplierPerformance(supplier),
    }))
    .sort((a, b) => b.performance.performanceScore - a.performance.performanceScore);

  return rows[0] || null;
}

function supplierRiskRows(suppliers = []) {
  return toArray(suppliers)
    .map((supplier) => ({
      supplier,
      performance: analyzeSupplierPerformance(supplier),
    }))
    .filter((row) => {
      const flags = toArray(row.performance.flags);
      return flags.includes("LATE_DELIVERIES") || flags.includes("LOW_COMPLETION_RATE");
    });
}

function openPurchasesBySupplier(purchases = []) {
  const openStatuses = new Set(["DRAFT", "ORDERED", "PARTIALLY_RECEIVED"]);
  const counts = new Map();

  for (const purchase of toArray(purchases)) {
    const status = cleanString(purchase.status).toUpperCase();
    if (status && !openStatuses.has(status)) continue;

    const supplierId = purchase.supplierId || purchase.supplier?.id || purchase.purchaseOrder?.supplierId;
    if (!supplierId) continue;
    counts.set(supplierId, (counts.get(supplierId) || 0) + 1);
  }

  return Array.from(counts.entries()).filter(([, count]) => count > 1);
}

function addRecommendation(recommendations, recommendation) {
  const normalized = normalizePurchasingRecommendation(recommendation);
  if (!normalized) return;

  const existing = recommendations.get(normalized.type);
  if (!existing || SEVERITY_RANK[normalized.severity] > SEVERITY_RANK[existing.severity]) {
    recommendations.set(normalized.type, normalized);
  }
}

export function calculateAveragePurchaseCost(purchases = [], productId = null) {
  const costs = collectPurchaseCostRecords(purchases, productId);
  if (!costs.length) return 0;
  return costs.reduce((sum, record) => sum + record.cost, 0) / costs.length;
}

export function getLatestPurchaseCost(purchases = [], productId = null) {
  return sortedPurchaseCosts(purchases, productId)[0]?.cost || 0;
}

export function estimateStockCoverageDays({ availableStock = 0, averageDailyDemand = 0 } = {}) {
  const stock = positiveNumber(availableStock);
  const dailyDemand = positiveNumber(averageDailyDemand);
  if (dailyDemand <= 0) return null;
  return Math.floor(stock / dailyDemand);
}

export function normalizePurchasingRecommendation(input = {}) {
  const type = cleanString(input.type).toUpperCase();
  if (!type) return null;

  const proposedActionType = cleanString(input.proposedActionType).toUpperCase() || null;
  const severity = VALID_SEVERITIES.has(cleanString(input.severity).toUpperCase())
    ? cleanString(input.severity).toUpperCase()
    : severityFromPriority(input.severity);

  return {
    type,
    severity,
    title: cleanString(input.title, labelFromType(type)),
    message: cleanString(input.message),
    confidenceScore: clampScore(input.confidenceScore, severityToConfidence(severity)),
    proposedActionType,
    requiresApproval: proposedActionType ? true : Boolean(input.requiresApproval),
    metadata: toPlainObject(input.metadata),
  };
}

export function generatePurchasingRecommendations(input = {}) {
  const product = normalizeProduct(input.product);
  const suppliers = toArray(input.suppliers);
  const purchases = toArray(input.purchases);
  const reorderSuggestion = toPlainObject(input.reorderSuggestion);
  const demandForecast = toPlainObject(input.demandForecast);
  const availableStock = availableStockFrom(input);
  const recommendations = new Map();
  const averageCost = calculateAveragePurchaseCost(purchases, product.id);
  const latestCost = getLatestPurchaseCost(purchases, product.id);
  const bestSupplier = bestSupplierPerformance(suppliers);
  const supplierRisks = supplierRiskRows(suppliers);
  const averageDailyDemand = averageDailyDemandFromForecast(demandForecast);
  const coverageDays = estimateStockCoverageDays({ availableStock, averageDailyDemand });

  if (["CRITICAL", "HIGH"].includes(cleanString(reorderSuggestion.priority).toUpperCase())) {
    const severity = severityFromPriority(reorderSuggestion.priority);
    addRecommendation(recommendations, {
      type: "PURCHASE_URGENCY",
      severity,
      title: "Purchase urgency detected",
      message: `${product.name} needs procurement attention based on reorder priority.`,
      confidenceScore: severityToConfidence(severity),
      proposedActionType: "PROPOSE_PURCHASE_ORDER",
      metadata: {
        reorderSuggestion,
        suggestedQuantity: reorderSuggestion.suggestedQuantity || null,
        availableStock,
      },
    });
  }

  if (bestSupplier && toArray(bestSupplier.performance.flags).includes("HIGH_PERFORMER")) {
    addRecommendation(recommendations, {
      type: "SUPPLIER_RECOMMENDATION",
      severity: "LOW",
      title: "Preferred supplier candidate",
      message: `${bestSupplier.supplier.name || bestSupplier.supplier.companyName || "A supplier"} has strong reliability signals.`,
      confidenceScore: clampScore(bestSupplier.performance.performanceScore / 100, 0.8),
      proposedActionType: "CHANGE_SUPPLIER",
      metadata: {
        supplier: {
          id: bestSupplier.supplier.id || null,
          name: bestSupplier.supplier.name || bestSupplier.supplier.companyName || null,
        },
        supplierPerformance: bestSupplier.performance,
      },
    });
  }

  if (supplierRisks.length) {
    const highestRisk = supplierRisks.sort((a, b) => a.performance.performanceScore - b.performance.performanceScore)[0];
    addRecommendation(recommendations, {
      type: "SUPPLIER_RELIABILITY_RISK",
      severity: highestRisk.performance.performanceScore < 60 ? "HIGH" : "MEDIUM",
      title: "Supplier reliability risk",
      message: `${highestRisk.supplier.name || highestRisk.supplier.companyName || "A supplier"} has late delivery or completion risk signals.`,
      confidenceScore: clampScore(1 - highestRisk.performance.performanceScore / 100, 0.65),
      proposedActionType: "FLAG_SUPPLIER_RISK",
      metadata: {
        supplier: {
          id: highestRisk.supplier.id || null,
          name: highestRisk.supplier.name || highestRisk.supplier.companyName || null,
        },
        supplierPerformance: highestRisk.performance,
      },
    });
  }

  if (latestCost > 0 && averageCost > 0 && latestCost > averageCost) {
    const increaseRatio = (latestCost - averageCost) / averageCost;
    addRecommendation(recommendations, {
      type: "COST_OPTIMIZATION",
      severity: increaseRatio >= 0.25 ? "HIGH" : "MEDIUM",
      title: "Purchase cost increased",
      message: `${product.name} latest purchase cost is higher than the average purchase cost.`,
      confidenceScore: clampScore(Math.min(0.95, 0.55 + increaseRatio), 0.65),
      proposedActionType: "NEGOTIATE_SUPPLIER",
      metadata: {
        latestPurchaseCost: latestCost,
        averagePurchaseCost: averageCost,
        increaseRatio,
      },
    });
  }

  if (bestSupplier?.performance.averageLeadTimeDays >= 30) {
    const leadTimeDays = bestSupplier.performance.averageLeadTimeDays;
    addRecommendation(recommendations, {
      type: "LEAD_TIME_RISK",
      severity: leadTimeDays >= 60 ? "HIGH" : "MEDIUM",
      title: "Long supplier lead time",
      message: `${bestSupplier.supplier.name || bestSupplier.supplier.companyName || "A supplier"} has an elevated average lead time.`,
      confidenceScore: leadTimeDays >= 60 ? 0.8 : 0.65,
      proposedActionType: "FLAG_SUPPLIER_RISK",
      metadata: {
        leadTimeDays,
        supplierPerformance: bestSupplier.performance,
      },
    });
  }

  if (positiveNumber(demandForecast.forecastQuantity) > availableStock) {
    addRecommendation(recommendations, {
      type: "STOCK_COVERAGE_WARNING",
      severity: coverageDays !== null && coverageDays <= 14 ? "HIGH" : "MEDIUM",
      title: "Forecast demand exceeds stock",
      message: `${product.name} forecast demand is higher than available inventory.`,
      confidenceScore: clampScore(demandForecast.confidenceScore, 0.6),
      proposedActionType: "PROPOSE_PURCHASE_ORDER",
      metadata: {
        availableStock,
        forecastQuantity: positiveNumber(demandForecast.forecastQuantity),
        averageDailyDemand,
        coverageDays,
      },
    });
  }

  const consolidationSuppliers = openPurchasesBySupplier(purchases);
  if (consolidationSuppliers.length) {
    addRecommendation(recommendations, {
      type: "PURCHASE_CONSOLIDATION",
      severity: "LOW",
      title: "Purchase consolidation opportunity",
      message: "Multiple open purchases share the same supplier and may be worth consolidating.",
      confidenceScore: 0.55,
      proposedActionType: "CONSOLIDATE_PURCHASE",
      metadata: {
        supplierOpenPurchaseCounts: consolidationSuppliers.map(([supplierId, count]) => ({ supplierId, count })),
      },
    });
  }

  const riskCount = Array.from(recommendations.values()).filter((item) =>
    ["PURCHASE_URGENCY", "SUPPLIER_RELIABILITY_RISK", "COST_OPTIMIZATION", "LEAD_TIME_RISK", "STOCK_COVERAGE_WARNING"].includes(item.type)
  ).length;

  if (riskCount >= 2) {
    addRecommendation(recommendations, {
      type: "PROCUREMENT_RISK_SUMMARY",
      severity: riskCount >= 4 ? "HIGH" : "MEDIUM",
      title: "Procurement risk summary",
      message: `${product.name} has multiple purchasing risk signals that should be reviewed together.`,
      confidenceScore: riskCount >= 4 ? 0.8 : 0.65,
      proposedActionType: null,
      requiresApproval: false,
      metadata: { riskCount },
    });
  }

  return {
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    recommendations: Array.from(recommendations.values()),
  };
}
