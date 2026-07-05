import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { json, prisma, requireAdminApi } from "../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const WAREHOUSE_STATUSES = new Set(["ACTIVE", "INACTIVE"]);

function clean(value) {
  return String(value || "").trim();
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function serializeWarehouse(warehouse) {
  return {
    id: warehouse.id,
    code: warehouse.code,
    name: warehouse.name,
    status: warehouse.status,
    address: warehouse.address,
    contactName: warehouse.contactName,
    contactPhone: warehouse.contactPhone,
    externalId: warehouse.externalId,
    source: warehouse.source,
    syncStatus: warehouse.syncStatus,
    lastSyncedAt: serializeDate(warehouse.lastSyncedAt),
    createdAt: serializeDate(warehouse.createdAt),
    updatedAt: serializeDate(warehouse.updatedAt),
    counts: {
      locations: warehouse._count?.locations || 0,
      bins: warehouse._count?.bins || 0,
      stocks: warehouse._count?.stocks || 0,
      incomingTransfers: warehouse._count?.incomingTransfers || 0,
      outgoingTransfers: warehouse._count?.outgoingTransfers || 0,
    },
  };
}

function buildWhere(searchParams) {
  const search = clean(searchParams.get("search"));
  const status = clean(searchParams.get("status")).toUpperCase();

  return {
    ...(status && WAREHOUSE_STATUSES.has(status) ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);
  const where = buildWhere(searchParams);

  const [warehouses, total, totalWarehouses, activeWarehouses, totalLocations, totalBins] = await prisma.$transaction([
    prisma.warehouse.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            locations: true,
            bins: true,
            stocks: true,
            incomingTransfers: true,
            outgoingTransfers: true,
          },
        },
      },
    }),
    prisma.warehouse.count({ where }),
    prisma.warehouse.count(),
    prisma.warehouse.count({ where: { status: "ACTIVE" } }),
    prisma.warehouseLocation.count(),
    prisma.stockBin.count(),
  ]);

  return json({
    analytics: {
      totalWarehouses,
      activeWarehouses,
      totalLocations,
      totalBins,
    },
    warehouses: warehouses.map(serializeWarehouse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
}
