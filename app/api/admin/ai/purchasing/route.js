import { generatePurchasingRecommendations } from "../../../../../lib/ai/purchasing-recommendations";
import { PURCHASE_READ_ROLES } from "../../../../../lib/admin/purchasePayload";
import { json, prisma, requireAdminApi } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SCAN_LIMIT = 100;

function cleanString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const stringValue = String(value).trim();
  return stringValue || fallback;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function paramValue(searchParams, key) {
  return cleanString(searchParams.get(key)).toUpperCase();
}

function serializePurchaseOrder(purchaseOrder, productId) {
  if (!purchaseOrder) return null;
  const supplier = purchaseOrder.supplier || null;

  return {
    id: purchaseOrder.id,
    supplierId: supplier?.id || purchaseOrder.supplierId || null,
    supplier: supplier
      ? {
          id: supplier.id,
          name: supplier.name || supplier.companyName || "Unknown supplier",
        }
      : null,
    status: purchaseOrder.status,
    total: toNumber(purchaseOrder.total),
    orderedAt: purchaseOrder.orderedAt,
    receivedAt: purchaseOrder.receivedAt,
    createdAt: purchaseOrder.createdAt,
    items: (purchaseOrder.items || [])
      .filter((item) => !productId || item.productId === productId)
      .map((item) => ({
        productId: item.productId,
        productTitle: item.productTitle,
        sku: item.sku,
        quantity: item.quantity,
        receivedQuantity: item.receivedQuantity,
        costPrice: toNumber(item.costPrice),
        total: toNumber(item.total),
        createdAt: item.createdAt,
        purchaseOrder,
      })),
  };
}

function supplierFromPurchaseOrder(purchaseOrder, productId) {
  const supplier = purchaseOrder?.supplier;
  if (!supplier) return null;

  return {
    id: supplier.id,
    name: supplier.name || supplier.companyName || "Unknown supplier",
    companyName: supplier.companyName,
    status: supplier.status,
    purchases: (supplier.purchases || []).map((purchase) => ({
      createdAt: purchase.orderedAt || purchase.createdAt,
      expectedDeliveryDate: purchase.receivedAt || purchase.orderedAt || purchase.createdAt,
      receivedAt: purchase.receivedAt,
      totalAmount: toNumber(purchase.total),
      status: purchase.status,
    })),
    products: [{ id: productId }],
  };
}

function uniqueById(items) {
  const byId = new Map();
  for (const item of items) {
    if (item?.id && !byId.has(item.id)) byId.set(item.id, item);
  }
  return Array.from(byId.values());
}

function purchasingInput(product) {
  const purchaseOrders = (product.purchaseItems || [])
    .map((item) => serializePurchaseOrder(item.purchaseOrder, product.id))
    .filter(Boolean);
  const suppliers = uniqueById(
    (product.purchaseItems || [])
      .map((item) => supplierFromPurchaseOrder(item.purchaseOrder, product.id))
      .filter(Boolean)
  );

  return {
    product: {
      id: product.id,
      name: product.title,
      sku: product.sku,
      costPrice: toNumber(product.costPrice),
      stockQuantity: product.stockQuantity,
      reservedStock: product.reservedStock,
    },
    suppliers,
    purchases: purchaseOrders,
    reorderSuggestion: product.reorderSuggestions?.[0] || null,
    demandForecast: product.demandForecasts?.[0] || null,
    warehouseStock: product.warehouseStocks || [],
  };
}

function recommendedSupplierFor(recommendation, product) {
  const metadataSupplier = recommendation.metadata?.supplier;
  if (metadataSupplier?.id || metadataSupplier?.name) {
    return {
      id: metadataSupplier.id || null,
      name: metadataSupplier.name || "Unknown supplier",
    };
  }

  const supplier = product.purchaseItems?.map((item) => item.purchaseOrder?.supplier).find(Boolean);
  if (!supplier) return null;

  return {
    id: supplier.id,
    name: supplier.name || supplier.companyName || "Unknown supplier",
  };
}

function flattenProductRecommendations(product) {
  const result = generatePurchasingRecommendations(purchasingInput(product));

  return result.recommendations.map((recommendation) => {
    const recommendedSupplier = recommendedSupplierFor(recommendation, product);

    return {
      id: `${result.productId}:${recommendation.type}`,
      productId: result.productId,
      productName: result.productName,
      sku: result.sku,
      categoryId: product.category?.id || null,
      categoryName: product.category?.name || null,
      brandId: product.brand?.id || null,
      brandName: product.brand?.name || null,
      recommendedSupplierId: recommendedSupplier?.id || null,
      recommendedSupplierName: recommendedSupplier?.name || null,
      ...recommendation,
    };
  });
}

function matchesFilter(recommendation, filters) {
  if (filters.severity && recommendation.severity !== filters.severity) return false;
  if (filters.type && recommendation.type !== filters.type) return false;
  if (filters.supplier && recommendation.recommendedSupplierId !== filters.supplier) return false;
  if (
    filters.category &&
    recommendation.categoryId !== filters.category &&
    cleanString(recommendation.categoryName).toUpperCase() !== filters.category
  ) return false;
  if (
    filters.brand &&
    recommendation.brandId !== filters.brand &&
    cleanString(recommendation.brandName).toUpperCase() !== filters.brand
  ) return false;
  return true;
}

function countBy(recommendations, predicate) {
  return recommendations.filter(predicate).length;
}

function distributionBy(recommendations, key) {
  const counts = new Map();
  for (const item of recommendations) {
    const value = item[key] || "NONE";
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function buildAnalytics(recommendations, scannedProducts) {
  const totalConfidence = recommendations.reduce((sum, item) => {
    const score = Number(item.confidenceScore);
    return sum + (Number.isFinite(score) ? score : 0);
  }, 0);
  const productIds = new Set(recommendations.map((item) => item.productId).filter(Boolean));
  const supplierIds = new Set(recommendations.map((item) => item.recommendedSupplierId).filter(Boolean));

  return {
    totalRecommendations: recommendations.length,
    purchaseUrgency: countBy(recommendations, (item) => item.type === "PURCHASE_URGENCY"),
    supplierRecommendations: countBy(recommendations, (item) => item.type === "SUPPLIER_RECOMMENDATION"),
    costOptimizationOpportunities: countBy(recommendations, (item) => item.type === "COST_OPTIMIZATION"),
    leadTimeRisks: countBy(recommendations, (item) => item.type === "LEAD_TIME_RISK"),
    supplierReliabilityRisks: countBy(recommendations, (item) => item.type === "SUPPLIER_RELIABILITY_RISK"),
    procurementRiskSummaries: countBy(recommendations, (item) => item.type === "PROCUREMENT_RISK_SUMMARY"),
    averageConfidenceScore: recommendations.length ? totalConfidence / recommendations.length : 0,
    recommendationsRequiringApproval: countBy(recommendations, (item) => item.requiresApproval),
    pureWarningCount: countBy(recommendations, (item) => !item.requiresApproval),
    productCoverageCount: productIds.size,
    supplierCoverageCount: supplierIds.size,
    severityDistribution: distributionBy(recommendations, "severity"),
    recommendationTypeDistribution: distributionBy(recommendations, "type"),
    proposedActionDistribution: distributionBy(recommendations, "proposedActionType"),
    scannedProducts,
  };
}

function buildGrouped(recommendations) {
  return {
    purchaseUrgency: recommendations.filter((item) => item.type === "PURCHASE_URGENCY").slice(0, 10),
    recommendedSuppliers: recommendations.filter((item) => item.type === "SUPPLIER_RECOMMENDATION").slice(0, 10),
    costOptimization: recommendations.filter((item) => item.type === "COST_OPTIMIZATION").slice(0, 10),
    leadTimeRisks: recommendations.filter((item) => item.type === "LEAD_TIME_RISK").slice(0, 10),
    procurementRiskSummary: recommendations.filter((item) => item.type === "PROCUREMENT_RISK_SUMMARY").slice(0, 10),
  };
}

function uniqueOptions(recommendations, idKey, nameKey) {
  const byId = new Map();
  for (const item of recommendations) {
    const id = item[idKey];
    const name = item[nameKey];
    if (id && !byId.has(id)) byId.set(id, { id, name: name || id });
  }
  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function GET(request) {
  const auth = await requireAdminApi(PURCHASE_READ_ROLES);
  if (auth.response) return auth.response;

  const searchParams = new URL(request.url).searchParams;
  const filters = {
    severity: paramValue(searchParams, "severity"),
    type: paramValue(searchParams, "type"),
    supplier: cleanString(searchParams.get("supplier")),
    category: paramValue(searchParams, "category"),
    brand: paramValue(searchParams, "brand"),
  };

  const products = await prisma.product.findMany({
    orderBy: [{ updatedAt: "desc" }],
    take: SCAN_LIMIT,
    select: {
      id: true,
      title: true,
      sku: true,
      costPrice: true,
      stockQuantity: true,
      reservedStock: true,
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      warehouseStocks: {
        select: {
          onHand: true,
          reserved: true,
          available: true,
        },
      },
      reorderSuggestions: {
        orderBy: [{ createdAt: "desc" }],
        take: 1,
        select: {
          suggestedQuantity: true,
          reason: true,
          priority: true,
          status: true,
          estimatedDemand: true,
          currentStock: true,
          leadTimeDays: true,
          createdAt: true,
        },
      },
      demandForecasts: {
        orderBy: [{ createdAt: "desc" }],
        take: 1,
        select: {
          periodStart: true,
          periodEnd: true,
          forecastQuantity: true,
          actualQuantity: true,
          confidenceScore: true,
          method: true,
          createdAt: true,
        },
      },
      purchaseItems: {
        orderBy: [{ createdAt: "desc" }],
        take: 20,
        select: {
          purchaseOrder: {
            select: {
              id: true,
              supplierId: true,
              status: true,
              total: true,
              orderedAt: true,
              receivedAt: true,
              createdAt: true,
              supplier: {
                select: {
                  id: true,
                  name: true,
                  companyName: true,
                  status: true,
                  purchases: {
                    orderBy: [{ createdAt: "desc" }],
                    take: 20,
                    select: {
                      createdAt: true,
                      orderedAt: true,
                      receivedAt: true,
                      total: true,
                      status: true,
                    },
                  },
                },
              },
              items: {
                select: {
                  productId: true,
                  productTitle: true,
                  sku: true,
                  quantity: true,
                  receivedQuantity: true,
                  costPrice: true,
                  total: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const allRecommendations = products.flatMap(flattenProductRecommendations);
  const recommendations = allRecommendations.filter((item) => matchesFilter(item, filters));

  return json({
    analytics: buildAnalytics(recommendations, products.length),
    recommendations,
    grouped: buildGrouped(recommendations),
    filters: {
      severities: Array.from(new Set(allRecommendations.map((item) => item.severity))).sort(),
      types: Array.from(new Set(allRecommendations.map((item) => item.type))).sort(),
      suppliers: uniqueOptions(allRecommendations, "recommendedSupplierId", "recommendedSupplierName"),
      categories: uniqueOptions(allRecommendations, "categoryId", "categoryName"),
      brands: uniqueOptions(allRecommendations, "brandId", "brandName"),
      scannedProducts: products.length,
      scanLimit: SCAN_LIMIT,
    },
  });
}
