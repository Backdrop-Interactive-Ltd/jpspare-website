import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { json, prisma, requireAdminApi } from "../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TRANSFER_STATUSES = new Set(["DRAFT", "REQUESTED", "IN_TRANSIT", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"]);

function clean(value) {
  return String(value || "").trim();
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

function serializeWarehouse(warehouse) {
  if (!warehouse) return null;
  return {
    id: warehouse.id,
    code: warehouse.code,
    name: warehouse.name,
  };
}

function buildWhere(searchParams) {
  const search = clean(searchParams.get("search"));
  const status = clean(searchParams.get("status")).toUpperCase();
  const fromWarehouseId = clean(searchParams.get("fromWarehouseId"));
  const toWarehouseId = clean(searchParams.get("toWarehouseId"));

  return {
    ...(status && TRANSFER_STATUSES.has(status) ? { status } : {}),
    ...(fromWarehouseId ? { fromWarehouseId } : {}),
    ...(toWarehouseId ? { toWarehouseId } : {}),
    ...(search ? { transferNumber: { contains: search, mode: "insensitive" } } : {}),
  };
}

function serializeTransfer(transfer) {
  return {
    id: transfer.id,
    transferNumber: transfer.transferNumber,
    status: transfer.status,
    fromWarehouse: serializeWarehouse(transfer.fromWarehouse),
    toWarehouse: serializeWarehouse(transfer.toWarehouse),
    itemCount: transfer._count?.items || 0,
    requestedAt: serializeDate(transfer.requestedAt),
    shippedAt: serializeDate(transfer.shippedAt),
    receivedAt: serializeDate(transfer.receivedAt),
    createdAt: serializeDate(transfer.createdAt),
    updatedAt: serializeDate(transfer.updatedAt),
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);
  const where = buildWhere(searchParams);

  const [transfers, total, statusRows, warehouses] = await Promise.all([
    prisma.stockTransfer.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        fromWarehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        toWarehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    }),
    prisma.stockTransfer.count({ where }),
    prisma.stockTransfer.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.warehouse.findMany({
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
      },
    }),
  ]);

  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));

  return json({
    analytics: {
      totalTransfers: Object.values(countsByStatus).reduce((sum, count) => sum + count, 0),
      draftTransfers: countsByStatus.DRAFT || 0,
      inTransitTransfers: countsByStatus.IN_TRANSIT || 0,
      receivedTransfers: countsByStatus.RECEIVED || 0,
      cancelledTransfers: countsByStatus.CANCELLED || 0,
    },
    filters: {
      warehouses,
      statuses: [...TRANSFER_STATUSES],
    },
    transfers: transfers.map(serializeTransfer),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
}
