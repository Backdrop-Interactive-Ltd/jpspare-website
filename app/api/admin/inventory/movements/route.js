import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { INVENTORY_READ_ROLES, STOCK_MOVEMENT_TYPES } from "../../../../../lib/commerce/inventory";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeMovement(movement) {
  return {
    id: movement.id,
    type: movement.type,
    quantity: movement.quantity,
    previousStock: movement.previousStock,
    newStock: movement.newStock,
    previousReservedStock: movement.previousReservedStock,
    newReservedStock: movement.newReservedStock,
    reason: movement.reason,
    warehouseId: movement.warehouseId,
    externalStockId: movement.externalStockId,
    source: movement.source,
    syncStatus: movement.syncStatus,
    lastSyncedAt: movement.lastSyncedAt?.toISOString() || null,
    createdAt: movement.createdAt.toISOString(),
    product: movement.product
      ? {
          id: movement.product.id,
          title: movement.product.title,
          sku: movement.product.sku,
        }
      : null,
    order: movement.order ? { id: movement.order.id, orderNumber: movement.order.orderNumber } : null,
    adminUser: movement.adminUser ? { id: movement.adminUser.id, name: movement.adminUser.name, email: movement.adminUser.email } : null,
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(INVENTORY_READ_ROLES);
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId") || undefined;
    const orderId = searchParams.get("orderId") || undefined;
    const type = searchParams.get("type") || "";
    const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "50", 10), 1), 200);

    const movements = await prisma.inventoryMovement.findMany({
      where: {
        ...(productId ? { productId } : {}),
        ...(orderId ? { orderId } : {}),
        ...(type && STOCK_MOVEMENT_TYPES.includes(type) ? { type } : {}),
      },
      include: {
        product: { select: { id: true, title: true, sku: true } },
        order: { select: { id: true, orderNumber: true } },
        adminUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return json({ items: movements.map(serializeMovement) });
  } catch (error) {
    return apiError(error.message || "Failed to load stock movements.", 500);
  }
}
