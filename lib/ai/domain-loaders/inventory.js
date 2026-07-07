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

  return where;
}

export async function loadInventoryProducts(inputJson = {}) {
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
        warehouseStocks: {
          where: filters.warehouseId ? { warehouseId: filters.warehouseId } : undefined,
          select: {
            warehouseId: true,
            onHand: true,
            reserved: true,
            available: true,
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
  } catch {
    return [];
  }
}
