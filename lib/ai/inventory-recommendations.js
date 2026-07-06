import { detectDeadStock } from "../inventory-intelligence/dead-stock";
import { forecastProductDemand } from "../inventory-intelligence/demand-forecast";
import { generateReorderSuggestion } from "../inventory-intelligence/reorder-center";
import { analyzeProductStockHealth } from "../inventory-intelligence/stock-health";
import { analyzeSupplierPerformance } from "../inventory-intelligence/supplier-performance";

const DAY_MS = 24 * 60 * 60 * 1000;

const VALID_SEVERITIES = new Set(["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"]);
const SEVERITY_RANK = {
  INFO: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

function cleanString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const stringValue = String(value).trim();
  return stringValue || fallback;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
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

function severityToConfidence(severity) {
  if (severity === "CRITICAL") return 0.95;
  if (severity === "HIGH") return 0.85;
  if (severity === "MEDIUM") return 0.65;
  if (severity === "LOW") return 0.45;
  return 0.35;
}

function labelFromType(type) {
  return cleanString(type)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeProduct(product = {}) {
  const supplier = toPlainObject(product.supplier);
  const analytics = toPlainObject(product.analytics);

  return {
    ...product,
    id: cleanString(product.id || product.productId, null),
    name: cleanString(product.name || product.title, "Unnamed product"),
    sku: cleanString(product.sku || product.SKU),
    stockQuantity: Math.max(0, toNumber(product.stockQuantity)),
    reservedStock: Math.max(0, toNumber(product.reservedStock)),
    lowStockThreshold: Math.max(1, toNumber(product.lowStockThreshold, 5)),
    price: Math.max(0, toNumber(product.price)),
    costPrice: Math.max(0, toNumber(product.costPrice)),
    orders: toArray(product.orders),
    inventoryMovements: toArray(product.inventoryMovements),
    supplier,
    category: toPlainObject(product.category),
    brand: toPlainObject(product.brand),
    analytics,
    supplierName: cleanString(product.supplierName || supplier.name),
  };
}

function dateToIso(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function daysUntil(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - Date.now()) / DAY_MS);
}

function stockoutSeverity(projectedStockoutDate) {
  const days = daysUntil(projectedStockoutDate);
  if (days === null) return "INFO";
  if (days <= 7) return "CRITICAL";
  if (days <= 14) return "HIGH";
  if (days <= 30) return "MEDIUM";
  return "LOW";
}

function addRecommendation(recommendations, recommendation) {
  const normalized = normalizeInventoryRecommendation(recommendation);
  if (!normalized) return;

  const existing = recommendations.get(normalized.type);
  if (!existing || SEVERITY_RANK[normalized.severity] > SEVERITY_RANK[existing.severity]) {
    recommendations.set(normalized.type, normalized);
  }
}

export function getRecommendationSeverity(scoreOrStatus) {
  if (typeof scoreOrStatus === "string") {
    const status = scoreOrStatus.trim().toUpperCase();

    if (status === "OUT_OF_STOCK" || status === "CRITICAL") return "CRITICAL";
    if (status === "HIGH") return "HIGH";
    if (status === "LOW") return "LOW";
    if (status === "MEDIUM" || status === "OVERSTOCK") return "MEDIUM";
    if (status === "HEALTHY" || status === "NONE") return "INFO";
  }

  const score = Number(scoreOrStatus);
  if (!Number.isFinite(score)) return "INFO";
  if (score >= 0.9) return "CRITICAL";
  if (score >= 0.75) return "HIGH";
  if (score >= 0.5) return "MEDIUM";
  if (score > 0) return "LOW";
  return "INFO";
}

export function normalizeInventoryRecommendation(input = {}) {
  const type = cleanString(input.type).toUpperCase();
  if (!type) return null;

  const proposedActionType = cleanString(input.proposedActionType).toUpperCase() || null;
  const severity = VALID_SEVERITIES.has(cleanString(input.severity).toUpperCase())
    ? cleanString(input.severity).toUpperCase()
    : getRecommendationSeverity(input.severity ?? input.confidenceScore);

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

export function generateInventoryRecommendations(product = {}) {
  const normalizedProduct = normalizeProduct(product);
  const recommendations = new Map();
  const stockHealth = analyzeProductStockHealth(normalizedProduct);
  const reorder = generateReorderSuggestion({
    ...normalizedProduct,
    analytics: {
      ...normalizedProduct.analytics,
      salesLast30Days: normalizedProduct.analytics.salesLast30Days ?? stockHealth.salesLast30Days,
      salesLast90Days: normalizedProduct.analytics.salesLast90Days ?? stockHealth.salesLast90Days,
      velocityScore: normalizedProduct.analytics.velocityScore ?? stockHealth.velocityScore,
    },
  });
  const deadStock = detectDeadStock(normalizedProduct);
  const forecast = forecastProductDemand(normalizedProduct, { forecastDays: 30 });
  const supplierPerformance = normalizedProduct.supplier
    ? analyzeSupplierPerformance(normalizedProduct.supplier)
    : null;

  if (stockHealth.healthStatus === "OUT_OF_STOCK") {
    addRecommendation(recommendations, {
      type: "OUT_OF_STOCK_RISK",
      severity: "CRITICAL",
      title: "Product is out of stock",
      message: `${normalizedProduct.name} has no available stock.`,
      confidenceScore: 0.95,
      proposedActionType: "FLAG_STOCKOUT_RISK",
      metadata: { stockHealth },
    });
  }

  if (stockHealth.healthStatus === "LOW" || stockHealth.healthStatus === "CRITICAL") {
    addRecommendation(recommendations, {
      type: "LOW_STOCK_RISK",
      severity: getRecommendationSeverity(stockHealth.healthStatus),
      title: "Low stock risk detected",
      message: `${normalizedProduct.name} is below the configured stock threshold.`,
      confidenceScore: stockHealth.healthStatus === "CRITICAL" ? 0.9 : 0.8,
      proposedActionType: "FLAG_LOW_STOCK",
      metadata: { stockHealth },
    });
  }

  if (reorder.shouldReorder) {
    addRecommendation(recommendations, {
      type: "REORDER_RECOMMENDATION",
      severity: getRecommendationSeverity(reorder.priority),
      title: "Reorder inventory",
      message: reorder.reason || `Create a reorder recommendation for ${normalizedProduct.name}.`,
      confidenceScore: severityToConfidence(getRecommendationSeverity(reorder.priority)),
      proposedActionType: "CREATE_REORDER_RECOMMENDATION",
      metadata: { reorder },
    });
  }

  if (deadStock.isDeadStock) {
    addRecommendation(recommendations, {
      type: "DEAD_STOCK_WARNING",
      severity: getRecommendationSeverity(deadStock.severity),
      title: "Dead stock warning",
      message: deadStock.reason || `${normalizedProduct.name} has slow or no recent sales activity.`,
      confidenceScore: severityToConfidence(getRecommendationSeverity(deadStock.severity)),
      proposedActionType: "FLAG_DEAD_STOCK",
      metadata: {
        ...deadStock,
        lastSoldAt: dateToIso(deadStock.lastSoldAt),
      },
    });
  }

  if (toArray(stockHealth.flags).includes("FAST_MOVING")) {
    addRecommendation(recommendations, {
      type: "FAST_MOVING_WARNING",
      severity: "MEDIUM",
      title: "Fast-moving product",
      message: `${normalizedProduct.name} has high recent sales velocity.`,
      confidenceScore: clampScore(stockHealth.velocityScore, 0.8),
      proposedActionType: null,
      requiresApproval: false,
      metadata: { stockHealth },
    });
  }

  if (["MEDIUM", "HIGH", "CRITICAL"].includes(deadStock.severity)) {
    addRecommendation(recommendations, {
      type: "SLOW_MOVING_WARNING",
      severity: getRecommendationSeverity(deadStock.severity),
      title: "Slow-moving inventory",
      message: `${normalizedProduct.name} may need promotional or clearance attention.`,
      confidenceScore: severityToConfidence(getRecommendationSeverity(deadStock.severity)),
      proposedActionType: "PROPOSE_CAMPAIGN",
      metadata: {
        ...deadStock,
        lastSoldAt: dateToIso(deadStock.lastSoldAt),
      },
    });
  }

  if (forecast.projectedStockoutDate) {
    const severity = stockoutSeverity(forecast.projectedStockoutDate);
    addRecommendation(recommendations, {
      type: "STOCKOUT_PROJECTION",
      severity,
      title: "Projected stockout",
      message: `${normalizedProduct.name} is projected to run out of stock.`,
      confidenceScore: clampScore(forecast.confidenceScore, severityToConfidence(severity)),
      proposedActionType: "FLAG_STOCKOUT_RISK",
      metadata: {
        ...forecast,
        projectedStockoutDate: dateToIso(forecast.projectedStockoutDate),
        daysUntilStockout: daysUntil(forecast.projectedStockoutDate),
      },
    });
  }

  if (
    supplierPerformance &&
    (toArray(supplierPerformance.flags).includes("LATE_DELIVERIES") ||
      toArray(supplierPerformance.flags).includes("LOW_COMPLETION_RATE"))
  ) {
    const hasMultipleRisks =
      toArray(supplierPerformance.flags).includes("LATE_DELIVERIES") &&
      toArray(supplierPerformance.flags).includes("LOW_COMPLETION_RATE");

    addRecommendation(recommendations, {
      type: "SUPPLIER_RISK",
      severity: hasMultipleRisks || supplierPerformance.performanceScore < 60 ? "HIGH" : "MEDIUM",
      title: "Supplier risk detected",
      message: `${normalizedProduct.supplierName || "The supplier"} has delivery or completion risk signals.`,
      confidenceScore: clampScore(1 - supplierPerformance.performanceScore / 100, 0.6),
      proposedActionType: "NOTIFY_SUPPLIER_DRAFT",
      metadata: { supplierPerformance },
    });
  }

  return {
    productId: normalizedProduct.id,
    productName: normalizedProduct.name,
    sku: normalizedProduct.sku,
    recommendations: Array.from(recommendations.values()),
  };
}
