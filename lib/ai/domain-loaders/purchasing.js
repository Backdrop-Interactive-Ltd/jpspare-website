import { prisma } from "../../db";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 100;

function cleanString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const stringValue = String(value).trim();
  return stringValue || fallback;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((item) => cleanString(item)).filter(Boolean)));
}

function normalizeLimit(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(number), MAX_LIMIT);
}

function normalizeFilters(inputJson = {}) {
  const source = inputJson.filters && typeof inputJson.filters === "object" ? inputJson.filters : inputJson;

  return {
    productIds: normalizeStringArray(source.productIds),
    supplierIds: normalizeStringArray(source.supplierIds),
    warehouseId: cleanString(source.warehouseId) || null,
    categoryId: cleanString(source.categoryId) || null,
    limit: normalizeLimit(source.limit ?? inputJson.limit),
  };
}

function buildWhere(filters) {
  const where = {};

  if (filters.productIds.length) {
    where.id = { in: filters.productIds };
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.warehouseId) {
    where.warehouseStocks = {
      some: {
        warehouseId: filters.warehouseId,
      },
    };
  }

  if (filters.supplierIds.length) {
    where.purchaseItems = {
      some: {
        purchaseOrder: {
          supplierId: { in: filters.supplierIds },
        },
      },
    };
  }

  return where;
}

export async function loadPurchasingProducts(inputJson = {}) {
  try {
    const filters = normalizeFilters(inputJson);

    return await prisma.product.findMany({
      where: buildWhere(filters),
      orderBy: [{ updatedAt: "desc" }],
      take: filters.limit,
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
          where: filters.warehouseId ? { warehouseId: filters.warehouseId } : undefined,
          select: {
            warehouseId: true,
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
          where: filters.supplierIds.length
            ? {
                purchaseOrder: {
                  supplierId: { in: filters.supplierIds },
                },
              }
            : undefined,
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
  } catch {
    return [];
  }
}
