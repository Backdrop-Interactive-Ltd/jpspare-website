import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { receivePurchaseStock } from "../../../../../lib/commerce/inventory";
import {
  normalizePurchasePayload,
  purchaseInclude,
  PURCHASE_MANAGE_ROLES,
  PURCHASE_READ_ROLES,
  serializePurchase,
  statusDatePatch,
  timelineTypeForStatus,
  validatePurchasePayload,
} from "../../../../../lib/admin/purchasePayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function productMapForItems(items) {
  const productIds = [...new Set((items || []).map((item) => item.productId).filter(Boolean))];
  if (!productIds.length) return new Map();
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, sku: true, costPrice: true },
  });
  return new Map(products.map((product) => [product.id, product]));
}

export async function GET(_request, { params }) {
  const auth = await requireAdminApi(PURCHASE_READ_ROLES);
  if (auth.response) return auth.response;

  const { id } = await params;
  const item = await prisma.purchaseOrder.findUnique({ where: { id }, include: purchaseInclude() });
  if (!item) return apiError("Purchase order not found.", 404);

  return json({ item: serializePurchase(item) });
}

export async function PUT(request, { params }) {
  const auth = await requireAdminApi(PURCHASE_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const productMap = await productMapForItems(body.items);
  const payload = normalizePurchasePayload(body, productMap);
  const validationError = validatePurchasePayload(payload);
  if (validationError) return apiError(validationError, 422);

  const item = await prisma.$transaction(async (tx) => {
    const existing = await tx.purchaseOrder.findUnique({ where: { id }, include: { items: true } });
    if (!existing) throw new Error("Purchase order not found.");

    const statusChanged = existing.status !== payload.purchase.status;
    const canReplaceItems = existing.status !== "RECEIVED";

    if (canReplaceItems) {
      await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
    }

    const updated = await tx.purchaseOrder.update({
      where: { id },
      data: {
        ...payload.purchase,
        updatedById: auth.session.user.id,
        ...statusDatePatch(payload.purchase.status),
        ...(canReplaceItems ? { items: { create: payload.items } } : {}),
        ...(statusChanged
          ? {
              timeline: {
                create: {
                  type: timelineTypeForStatus(payload.purchase.status),
                  title: "Purchase status updated",
                  message: `Status changed from ${existing.status} to ${payload.purchase.status}.`,
                  fromStatus: existing.status,
                  toStatus: payload.purchase.status,
                  adminUserId: auth.session.user.id,
                },
              },
            }
          : {}),
      },
      include: purchaseInclude(),
    });

    if (payload.purchase.notes && payload.purchase.notes !== existing.notes) {
      await tx.purchaseTimelineEvent.create({
        data: {
          purchaseOrderId: id,
          type: "NOTE",
          title: "Admin note updated",
          message: payload.purchase.notes,
          adminUserId: auth.session.user.id,
        },
      });
    }

    if (updated.status === "RECEIVED") {
      await receivePurchaseStock(tx, updated, { adminUserId: auth.session.user.id, warehouseId: updated.warehouseId, source: "ADMIN" });
      if (statusChanged) {
        await tx.purchaseTimelineEvent.create({
          data: {
            purchaseOrderId: updated.id,
            type: "RECEIVED",
            title: "Purchase received",
            message: "Stock was increased from this purchase receipt.",
            fromStatus: existing.status,
            toStatus: "RECEIVED",
            adminUserId: auth.session.user.id,
          },
        });
      }
    }

    return tx.purchaseOrder.findUnique({ where: { id }, include: purchaseInclude() });
  });

  return json({ item: serializePurchase(item) });
}

export async function DELETE(_request, { params }) {
  const auth = await requireAdminApi(PURCHASE_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const { id } = await params;
  const existing = await prisma.purchaseOrder.findUnique({ where: { id }, select: { status: true } });
  if (!existing) return apiError("Purchase order not found.", 404);
  if (existing.status === "RECEIVED") return apiError("Received purchases cannot be deleted because stock has already been posted.", 409);

  await prisma.purchaseOrder.delete({ where: { id } });
  return json({ ok: true });
}
