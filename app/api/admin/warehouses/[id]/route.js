import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function warehouseId(context) {
  return (await context.params).id;
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
  };
}

function serializeLocation(location) {
  return {
    id: location.id,
    code: location.code,
    name: location.name,
    type: location.type,
    zone: location.zone,
    status: location.status,
    createdAt: serializeDate(location.createdAt),
    updatedAt: serializeDate(location.updatedAt),
    counts: {
      bins: location._count?.bins || 0,
      stocks: location._count?.stocks || 0,
    },
  };
}

function serializeBin(bin) {
  return {
    id: bin.id,
    code: bin.code,
    status: bin.status,
    capacityJson: bin.capacityJson,
    location: bin.location
      ? {
          id: bin.location.id,
          code: bin.location.code,
          name: bin.location.name,
        }
      : null,
    createdAt: serializeDate(bin.createdAt),
    updatedAt: serializeDate(bin.updatedAt),
    counts: {
      stocks: bin._count?.stocks || 0,
    },
  };
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const id = await warehouseId(context);
  const warehouse = await prisma.warehouse.findUnique({
    where: { id },
  });

  if (!warehouse) return apiError("Warehouse not found.", 404);

  const [locations, bins, stockAggregate, stockCount, incomingTransfers, outgoingTransfers] = await Promise.all([
    prisma.warehouseLocation.findMany({
      where: { warehouseId: id },
      orderBy: [{ code: "asc" }],
      include: {
        _count: {
          select: {
            bins: true,
            stocks: true,
          },
        },
      },
    }),
    prisma.stockBin.findMany({
      where: { warehouseId: id },
      orderBy: [{ code: "asc" }],
      include: {
        location: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            stocks: true,
          },
        },
      },
    }),
    prisma.warehouseStock.aggregate({
      where: { warehouseId: id },
      _sum: {
        onHand: true,
        reserved: true,
        available: true,
      },
    }),
    prisma.warehouseStock.count({ where: { warehouseId: id } }),
    prisma.stockTransfer.count({ where: { toWarehouseId: id } }),
    prisma.stockTransfer.count({ where: { fromWarehouseId: id } }),
  ]);

  return json({
    warehouse: serializeWarehouse(warehouse),
    locations: locations.map(serializeLocation),
    bins: bins.map(serializeBin),
    stockSummary: {
      stockRows: stockCount,
      totalOnHand: stockAggregate._sum.onHand || 0,
      totalReserved: stockAggregate._sum.reserved || 0,
      totalAvailable: stockAggregate._sum.available || 0,
    },
    transferSummary: {
      incomingTransfers,
      outgoingTransfers,
    },
  });
}
