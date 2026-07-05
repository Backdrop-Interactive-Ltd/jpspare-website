import { apiError, json, prisma, requireAdminApi } from "../_utils";
import { INVENTORY_READ_ROLES } from "../../../../lib/commerce/inventory";
import { buildInventoryIntelligenceAnalytics } from "../../../../lib/inventory-intelligence/analytics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  return Number(value) || 0;
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function serializeProduct(product) {
  if (!product) return null;
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    sku: product.sku,
    price: toNumber(product.price),
    stockQuantity: product.stockQuantity,
    reservedStock: product.reservedStock,
    lowStockThreshold: product.lowStockThreshold,
    stockStatus: product.stockStatus,
    categoryName: product.category?.name || null,
    brandName: product.brand?.name || null,
  };
}

function serializeReorder(item) {
  return {
    id: item.id,
    productId: item.productId,
    product: serializeProduct(item.product),
    suggestedQuantity: item.suggestedQuantity,
    reason: item.reason,
    priority: item.priority,
    status: item.status,
    estimatedDemand: item.estimatedDemand,
    currentStock: item.currentStock,
    leadTimeDays: item.leadTimeDays,
    createdAt: serializeDate(item.createdAt),
    updatedAt: serializeDate(item.updatedAt),
  };
}

function serializeDeadStock(item) {
  return {
    id: item.id,
    productId: item.productId,
    product: serializeProduct(item.product),
    stockQuantity: item.stockQuantity,
    daysWithoutSale: item.daysWithoutSale,
    lastSoldAt: serializeDate(item.lastSoldAt),
    estimatedValue: toNumber(item.estimatedValue),
    reason: item.reason,
    status: item.status,
    calculatedAt: serializeDate(item.calculatedAt),
    createdAt: serializeDate(item.createdAt),
  };
}

export async function GET() {
  const auth = await requireAdminApi(INVENTORY_READ_ROLES);
  if (auth.response) return auth.response;

  try {
    const [
      totalProducts,
      stockProducts,
      lowStockProducts,
      deadStockProducts,
      openReorderSuggestions,
      activeForecasts,
      abcRows,
      velocityAggregate,
      topLowStock,
      topDeadStock,
      recentReorders,
      recentDeadStock,
      analyticsRows,
      forecastRows,
      suppliers,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.findMany({
        select: { price: true, stockQuantity: true },
      }),
      prisma.product.count({
        where: { stockStatus: { in: ["LOW_STOCK", "OUT_OF_STOCK"] } },
      }),
      prisma.deadStockSnapshot.count({
        where: { status: "OPEN" },
      }),
      prisma.reorderSuggestion.count({
        where: { status: "OPEN" },
      }),
      prisma.demandForecast.count({
        where: { periodEnd: { gte: new Date() } },
      }),
      prisma.inventoryAnalytics.groupBy({
        by: ["abcClass"],
        _count: { _all: true },
      }),
      prisma.inventoryAnalytics.aggregate({
        _avg: { velocityScore: true },
      }),
      prisma.inventoryAnalytics.findMany({
        include: {
          product: {
            include: { category: true, brand: true },
          },
        },
        orderBy: [{ availableStock: "asc" }, { calculatedAt: "desc" }],
        take: 5,
      }),
      prisma.deadStockSnapshot.findMany({
        include: {
          product: {
            include: { category: true, brand: true },
          },
        },
        where: { status: "OPEN" },
        orderBy: [{ daysWithoutSale: "desc" }, { calculatedAt: "desc" }],
        take: 5,
      }),
      prisma.reorderSuggestion.findMany({
        include: {
          product: {
            include: { category: true, brand: true },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take: 8,
      }),
      prisma.deadStockSnapshot.findMany({
        include: {
          product: {
            include: { category: true, brand: true },
          },
        },
        orderBy: [{ calculatedAt: "desc" }],
        take: 8,
      }),
      prisma.inventoryAnalytics.findMany({
        select: {
          salesLast90Days: true,
          velocityScore: true,
        },
      }),
      prisma.demandForecast.findMany({
        select: {
          confidenceScore: true,
        },
      }),
      prisma.supplier.findMany({
        include: {
          purchases: {
            select: {
              createdAt: true,
              orderedAt: true,
              receivedAt: true,
              total: true,
              subtotal: true,
              status: true,
            },
          },
        },
      }),
    ]);

    const totalStockValue = stockProducts.reduce((sum, product) => {
      return sum + toNumber(product.price) * (product.stockQuantity || 0);
    }, 0);
    const derived = buildInventoryIntelligenceAnalytics({
      stockProducts,
      analyticsRows,
      deadStockRows: recentDeadStock,
      forecastRows,
      suppliers,
    });

    return json({
      overview: {
        totalProducts,
        totalStockValue,
        lowStockProducts,
        deadStockProducts,
        openReorderSuggestions,
        activeForecasts,
      },
      analytics: {
        abcDistribution: abcRows.map((row) => ({
          abcClass: row.abcClass || "Unclassified",
          count: row._count._all,
        })),
        averageVelocityScore: velocityAggregate._avg.velocityScore || 0,
        inventoryTurnoverRatio: derived.analytics.inventoryTurnoverRatio,
        averageDaysWithoutSale: derived.analytics.averageDaysWithoutSale,
        fastMovingProductCount: derived.analytics.fastMovingProductCount,
        slowMovingProductCount: derived.analytics.slowMovingProductCount,
        topLowStockProducts: topLowStock.map((item) => ({
          id: item.id,
          productId: item.productId,
          product: serializeProduct(item.product),
          currentStock: item.currentStock,
          reservedStock: item.reservedStock,
          availableStock: item.availableStock,
          lowStockThreshold: item.lowStockThreshold,
          stockStatus: item.stockStatus,
          abcClass: item.abcClass,
          velocityScore: item.velocityScore,
          calculatedAt: serializeDate(item.calculatedAt),
        })),
        topDeadStockProducts: topDeadStock.map(serializeDeadStock),
      },
      distributions: derived.distributions,
      recentReorders: recentReorders.map(serializeReorder),
      recentDeadStock: recentDeadStock.map(serializeDeadStock),
    });
  } catch (error) {
    return apiError(error.message || "Failed to load inventory intelligence.", 500);
  }
}
