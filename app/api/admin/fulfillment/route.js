import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";
import { json, prisma, requireAdminApi } from "../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SHIPMENT_STATUSES = new Set(["DRAFT", "PICKING", "PICKED", "PACKING", "PACKED", "DISPATCHED", "IN_TRANSIT", "DELIVERED", "FAILED", "RETURNED", "CANCELLED"]);

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

function serializeCourier(courier) {
  if (!courier) return null;
  return {
    id: courier.id,
    code: courier.code,
    name: courier.name,
  };
}

function serializeOrder(order) {
  if (!order) return null;
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    status: order.status,
  };
}

function buildWhere(searchParams) {
  const search = clean(searchParams.get("search"));
  const status = clean(searchParams.get("status")).toUpperCase();
  const courierId = clean(searchParams.get("courierId"));
  const warehouseId = clean(searchParams.get("warehouseId"));

  return {
    ...(status && SHIPMENT_STATUSES.has(status) ? { status } : {}),
    ...(courierId ? { courierId } : {}),
    ...(warehouseId ? { warehouseId } : {}),
    ...(search
      ? {
          OR: [
            { shipmentNumber: { contains: search, mode: "insensitive" } },
            { trackingNumber: { contains: search, mode: "insensitive" } },
            { order: { orderNumber: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

function serializeShipment(shipment) {
  return {
    id: shipment.id,
    shipmentNumber: shipment.shipmentNumber,
    status: shipment.status,
    trackingNumber: shipment.trackingNumber,
    dispatchBatch: shipment.dispatchBatch,
    order: serializeOrder(shipment.order),
    warehouse: serializeWarehouse(shipment.warehouse),
    courier: serializeCourier(shipment.courier),
    itemCount: shipment._count?.items || 0,
    shippedAt: serializeDate(shipment.shippedAt),
    deliveredAt: serializeDate(shipment.deliveredAt),
    createdAt: serializeDate(shipment.createdAt),
    updatedAt: serializeDate(shipment.updatedAt),
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);
  const where = buildWhere(searchParams);

  const [shipments, total, statusRows, couriers, warehouses] = await Promise.all([
    prisma.shipment.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            customerPhone: true,
            status: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        courier: {
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
    prisma.shipment.count({ where }),
    prisma.shipment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.courier.findMany({
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
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
  ]);

  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));

  return json({
    analytics: {
      totalShipments: Object.values(countsByStatus).reduce((sum, count) => sum + count, 0),
      picking: countsByStatus.PICKING || 0,
      packed: countsByStatus.PACKED || 0,
      dispatched: countsByStatus.DISPATCHED || 0,
      inTransit: countsByStatus.IN_TRANSIT || 0,
      delivered: countsByStatus.DELIVERED || 0,
      failed: countsByStatus.FAILED || 0,
    },
    filters: {
      statuses: [...SHIPMENT_STATUSES],
      couriers,
      warehouses,
    },
    shipments: shipments.map(serializeShipment),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
}
