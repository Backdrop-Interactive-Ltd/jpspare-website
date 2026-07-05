import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { json, prisma, requireAdminApi } from "../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function clean(value) {
  return String(value || "").trim();
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function buildWhere(searchParams) {
  const search = clean(searchParams.get("search"));
  const warehouseId = clean(searchParams.get("warehouseId"));
  const lowAvailability = searchParams.get("lowAvailability") === "1";
  const outOfStock = searchParams.get("outOfStock") === "1";

  return {
    ...(warehouseId ? { warehouseId } : {}),
    ...(search
      ? {
          product: {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          },
        }
      : {}),
    ...(outOfStock ? { available: { lte: 0 } } : {}),
    ...(lowAvailability && !outOfStock ? { available: { gt: 0, lte: 5 } } : {}),
  };
}

function serializeStock(row) {
  return {
    id: row.id,
    product: row.product
      ? {
          id: row.product.id,
          title: row.product.title,
          slug: row.product.slug,
          sku: row.product.sku,
        }
      : null,
    warehouse: row.warehouse
      ? {
          id: row.warehouse.id,
          code: row.warehouse.code,
          name: row.warehouse.name,
        }
      : null,
    location: row.location
      ? {
          id: row.location.id,
          code: row.location.code,
          name: row.location.name,
        }
      : null,
    bin: row.bin
      ? {
          id: row.bin.id,
          code: row.bin.code,
        }
      : null,
    onHand: row.onHand,
    reserved: row.reserved,
    available: row.available,
    updatedAt: serializeDate(row.updatedAt),
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);
  const where = buildWhere(searchParams);

  const [stock, total, totals, warehouses, warehousesWithStock, productsWithStock] = await Promise.all([
    prisma.warehouseStock.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            sku: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        bin: {
          select: {
            id: true,
            code: true,
          },
        },
      },
    }),
    prisma.warehouseStock.count({ where }),
    prisma.warehouseStock.aggregate({
      _sum: {
        onHand: true,
        reserved: true,
        available: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.warehouse.findMany({
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
      },
    }),
    prisma.warehouseStock.findMany({
      distinct: ["warehouseId"],
      select: { warehouseId: true },
    }),
    prisma.warehouseStock.findMany({
      distinct: ["productId"],
      select: { productId: true },
    }),
  ]);

  return json({
    analytics: {
      totalStockRows: totals._count._all || 0,
      totalOnHandQuantity: totals._sum.onHand || 0,
      totalReservedQuantity: totals._sum.reserved || 0,
      totalAvailableQuantity: totals._sum.available || 0,
      warehousesWithStock: warehousesWithStock.length,
      productsWithStock: productsWithStock.length,
    },
    filters: {
      warehouses,
    },
    stock: stock.map(serializeStock),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
}
