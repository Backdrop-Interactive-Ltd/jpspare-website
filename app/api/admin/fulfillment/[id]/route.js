import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function shipmentId(context) {
  return (await context.params).id;
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
    address: warehouse.address,
  };
}

function serializeCourier(courier) {
  if (!courier) return null;
  return {
    id: courier.id,
    code: courier.code,
    name: courier.name,
    phone: courier.phone,
    email: courier.email,
    apiProvider: courier.apiProvider,
    trackingUrl: courier.trackingUrl,
  };
}

function serializeOrder(order) {
  if (!order) return null;
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    total: order.total?.toString?.() ?? order.total,
    createdAt: serializeDate(order.createdAt),
  };
}

function serializeShipment(shipment) {
  return {
    id: shipment.id,
    shipmentNumber: shipment.shipmentNumber,
    status: shipment.status,
    trackingNumber: shipment.trackingNumber,
    dispatchBatch: shipment.dispatchBatch,
    notes: shipment.notes,
    shippedAt: serializeDate(shipment.shippedAt),
    deliveredAt: serializeDate(shipment.deliveredAt),
    createdAt: serializeDate(shipment.createdAt),
    updatedAt: serializeDate(shipment.updatedAt),
    order: serializeOrder(shipment.order),
    warehouse: serializeWarehouse(shipment.warehouse),
    courier: serializeCourier(shipment.courier),
  };
}

function serializeItem(item) {
  return {
    id: item.id,
    product: item.product
      ? {
          id: item.product.id,
          title: item.product.title,
          slug: item.product.slug,
          sku: item.product.sku,
        }
      : null,
    quantity: item.quantity,
    pickedQuantity: item.pickedQuantity,
    packedQuantity: item.packedQuantity,
    deliveredQuantity: item.deliveredQuantity,
    createdAt: serializeDate(item.createdAt),
    updatedAt: serializeDate(item.updatedAt),
  };
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const shipment = await prisma.shipment.findUnique({
    where: { id: await shipmentId(context) },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          total: true,
          createdAt: true,
        },
      },
      warehouse: {
        select: {
          id: true,
          code: true,
          name: true,
          address: true,
        },
      },
      courier: {
        select: {
          id: true,
          code: true,
          name: true,
          phone: true,
          email: true,
          apiProvider: true,
          trackingUrl: true,
        },
      },
      items: {
        orderBy: [{ createdAt: "asc" }],
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              sku: true,
            },
          },
        },
      },
    },
  });

  if (!shipment) return apiError("Shipment not found.", 404);

  const totals = shipment.items.reduce(
    (summary, item) => ({
      quantity: summary.quantity + item.quantity,
      pickedQuantity: summary.pickedQuantity + item.pickedQuantity,
      packedQuantity: summary.packedQuantity + item.packedQuantity,
      deliveredQuantity: summary.deliveredQuantity + item.deliveredQuantity,
    }),
    { quantity: 0, pickedQuantity: 0, packedQuantity: 0, deliveredQuantity: 0 },
  );

  return json({
    shipment: serializeShipment(shipment),
    items: shipment.items.map(serializeItem),
    summary: {
      itemCount: shipment.items.length,
      ...totals,
    },
  });
}
