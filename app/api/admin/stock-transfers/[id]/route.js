import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function transferId(context) {
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
  };
}

function serializeLocation(location) {
  if (!location) return null;
  return {
    id: location.id,
    code: location.code,
    name: location.name,
  };
}

function serializeBin(bin) {
  if (!bin) return null;
  return {
    id: bin.id,
    code: bin.code,
  };
}

function serializeTransfer(transfer) {
  return {
    id: transfer.id,
    transferNumber: transfer.transferNumber,
    status: transfer.status,
    fromWarehouse: serializeWarehouse(transfer.fromWarehouse),
    toWarehouse: serializeWarehouse(transfer.toWarehouse),
    fromLocation: serializeLocation(transfer.fromLocation),
    toLocation: serializeLocation(transfer.toLocation),
    fromBin: serializeBin(transfer.fromBin),
    toBin: serializeBin(transfer.toBin),
    requestedAt: serializeDate(transfer.requestedAt),
    shippedAt: serializeDate(transfer.shippedAt),
    receivedAt: serializeDate(transfer.receivedAt),
    notes: transfer.notes,
    createdAt: serializeDate(transfer.createdAt),
    updatedAt: serializeDate(transfer.updatedAt),
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
    receivedQuantity: item.receivedQuantity,
    createdAt: serializeDate(item.createdAt),
    updatedAt: serializeDate(item.updatedAt),
  };
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const transfer = await prisma.stockTransfer.findUnique({
    where: { id: await transferId(context) },
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
      fromLocation: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      toLocation: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      fromBin: {
        select: {
          id: true,
          code: true,
        },
      },
      toBin: {
        select: {
          id: true,
          code: true,
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

  if (!transfer) return apiError("Stock transfer not found.", 404);

  const totalQuantity = transfer.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalReceivedQuantity = transfer.items.reduce((sum, item) => sum + item.receivedQuantity, 0);

  return json({
    transfer: serializeTransfer(transfer),
    items: transfer.items.map(serializeItem),
    summary: {
      itemCount: transfer.items.length,
      totalQuantity,
      totalReceivedQuantity,
      remainingQuantity: Math.max(0, totalQuantity - totalReceivedQuantity),
    },
  });
}
