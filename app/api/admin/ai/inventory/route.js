import { INVENTORY_READ_ROLES } from "../../../../../lib/commerce/inventory";
import { generateInventoryRecommendations } from "../../../../../lib/ai/inventory-recommendations";
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

function serializeOrderItem(item) {
  return {
    quantity: item.quantity || 0,
    createdAt: item.order?.createdAt || item.createdAt || null,
    updatedAt: item.order?.updatedAt || null,
    paidAt: item.order?.paidAt || null,
    status: item.order?.status || null,
  };
}

function serializePurchase(purchase) {
  const fallbackDate = purchase.receivedAt || purchase.orderedAt || purchase.createdAt || null;

  return {
    createdAt: purchase.orderedAt || purchase.createdAt || null,
    expectedDeliveryDate: fallbackDate,
    receivedAt: purchase.receivedAt || null,
    totalAmount: toNumber(purchase.total),
    status: purchase.status || null,
  };
}

function supplierFromProduct(product) {
  const supplier = product.purchaseItems
    ?.map((item) => item.purchaseOrder?.supplier)
    .find(Boolean);

  if (!supplier) return null;

  return {
    id: supplier.id,
    name: supplier.name || supplier.companyName || "Unknown supplier",
    companyName: supplier.companyName,
    status: supplier.status,
    purchases: Array.isArray(supplier.purchases) ? supplier.purchases.map(serializePurchase) : [],
    products: [{ id: product.id }],
  };
}

function productInput(product) {
  const latestAnalytics = product.inventoryAnalytics?.[0] || {};

  return {
    id: product.id,
    name: product.title,
    sku: product.sku,
    stockQuantity: product.stockQuantity,
    reservedStock: product.reservedStock,
    lowStockThreshold: product.lowStockThreshold,
    price: toNumber(product.price),
    costPrice: toNumber(product.costPrice),
    orders: (product.orderItems || []).map(serializeOrderItem),
    inventoryMovements: product.inventoryMovements || [],
    supplier: supplierFromProduct(product),
    category: product.category,
    brand: product.brand,
    analytics: {
      salesLast7Days: latestAnalytics.salesLast7Days,
      salesLast30Days: latestAnalytics.salesLast30Days,
      salesLast90Days: latestAnalytics.salesLast90Days,
      velocityScore: latestAnalytics.velocityScore,
    },
  };
}

function flattenProductRecommendations(product) {
  const result = generateInventoryRecommendations(productInput(product));

  return result.recommendations.map((recommendation) => ({
    id: `${result.productId}:${recommendation.type}`,
    productId: result.productId,
    productName: result.productName,
    sku: result.sku,
    categoryId: product.category?.id || null,
    categoryName: product.category?.name || null,
    brandId: product.brand?.id || null,
    brandName: product.brand?.name || null,
    ...recommendation,
  }));
}

function matchesFilter(recommendation, filters) {
  if (filters.severity && recommendation.severity !== filters.severity) return false;
  if (filters.type && recommendation.type !== filters.type) return false;
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

function buildAnalytics(recommendations) {
  return {
    totalRecommendations: recommendations.length,
    criticalRecommendations: countBy(recommendations, (item) => item.severity === "CRITICAL"),
    highSeverityRecommendations: countBy(recommendations, (item) => item.severity === "HIGH"),
    reorderRecommendations: countBy(recommendations, (item) => item.type === "REORDER_RECOMMENDATION"),
    deadStockWarnings: countBy(recommendations, (item) => item.type === "DEAD_STOCK_WARNING"),
    stockoutProjections: countBy(recommendations, (item) => item.type === "STOCKOUT_PROJECTION"),
    supplierRisks: countBy(recommendations, (item) => item.type === "SUPPLIER_RISK"),
  };
}

function buildGrouped(recommendations) {
  return {
    topCriticalRisks: recommendations.filter((item) => item.severity === "CRITICAL").slice(0, 10),
    reorderRecommendations: recommendations.filter((item) => item.type === "REORDER_RECOMMENDATION").slice(0, 10),
    deadStockWarnings: recommendations.filter((item) => item.type === "DEAD_STOCK_WARNING").slice(0, 10),
    supplierRisks: recommendations.filter((item) => item.type === "SUPPLIER_RISK").slice(0, 10),
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
  const auth = await requireAdminApi(INVENTORY_READ_ROLES);
  if (auth.response) return auth.response;

  const searchParams = new URL(request.url).searchParams;
  const filters = {
    severity: paramValue(searchParams, "severity"),
    type: paramValue(searchParams, "type"),
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
      price: true,
      costPrice: true,
      stockQuantity: true,
      reservedStock: true,
      lowStockThreshold: true,
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      orderItems: {
        orderBy: [{ createdAt: "desc" }],
        take: 50,
        select: {
          quantity: true,
          createdAt: true,
          order: {
            select: {
              status: true,
              paidAt: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
      inventoryMovements: {
        orderBy: [{ createdAt: "desc" }],
        take: 50,
        select: {
          type: true,
          quantity: true,
          createdAt: true,
        },
      },
      inventoryAnalytics: {
        orderBy: [{ calculatedAt: "desc" }],
        take: 1,
        select: {
          salesLast7Days: true,
          salesLast30Days: true,
          salesLast90Days: true,
          velocityScore: true,
        },
      },
      purchaseItems: {
        orderBy: [{ createdAt: "desc" }],
        take: 5,
        select: {
          purchaseOrder: {
            select: {
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
            },
          },
        },
      },
    },
  });

  const allRecommendations = products.flatMap(flattenProductRecommendations);
  const recommendations = allRecommendations.filter((item) => matchesFilter(item, filters));

  return json({
    analytics: buildAnalytics(recommendations),
    recommendations,
    grouped: buildGrouped(recommendations),
    filters: {
      severities: Array.from(new Set(allRecommendations.map((item) => item.severity))).sort(),
      types: Array.from(new Set(allRecommendations.map((item) => item.type))).sort(),
      categories: uniqueOptions(allRecommendations, "categoryId", "categoryName"),
      brands: uniqueOptions(allRecommendations, "brandId", "brandName"),
      scannedProducts: products.length,
      scanLimit: SCAN_LIMIT,
    },
  });
}
