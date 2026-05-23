import { apiError, json, prisma, requireAdminApi } from "../_utils";
import { receivePurchaseStock } from "../../../../lib/commerce/inventory";
import {
  makePurchaseNumber,
  normalizePurchasePayload,
  purchaseInclude,
  PURCHASE_MANAGE_ROLES,
  PURCHASE_READ_ROLES,
  serializePurchase,
  statusDatePatch,
  timelineTypeForStatus,
  validatePurchasePayload,
} from "../../../../lib/admin/purchasePayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildWhere(searchParams) {
  const query = searchParams.get("q")?.trim();
  const supplierId = searchParams.get("supplierId") || undefined;
  const status = searchParams.get("status") || undefined;

  return {
    ...(query
      ? {
          OR: [
            { purchaseNumber: { contains: query, mode: "insensitive" } },
            { externalPurchaseId: { contains: query, mode: "insensitive" } },
            { supplier: { name: { contains: query, mode: "insensitive" } } },
            { supplier: { companyName: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(supplierId ? { supplierId } : {}),
    ...(status && status !== "ALL" ? { status } : {}),
  };
}

async function productMapForItems(items) {
  const productIds = [...new Set((items || []).map((item) => item.productId).filter(Boolean))];
  if (!productIds.length) return new Map();
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, sku: true, costPrice: true },
  });
  return new Map(products.map((product) => [product.id, product]));
}

export async function GET(request) {
  const auth = await requireAdminApi(PURCHASE_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);
  const where = buildWhere(searchParams);

  const [items, total] = await prisma.$transaction([
    prisma.purchaseOrder.findMany({
      where,
      include: purchaseInclude(),
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.purchaseOrder.count({ where }),
  ]);

  return json({
    items: items.map(serializePurchase),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}

export async function POST(request) {
  const auth = await requireAdminApi(PURCHASE_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const body = await request.json();
  const productMap = await productMapForItems(body.items);
  const payload = normalizePurchasePayload(body, productMap);
  const validationError = validatePurchasePayload(payload);
  if (validationError) return apiError(validationError, 422);

  const item = await prisma.$transaction(async (tx) => {
    const created = await tx.purchaseOrder.create({
      data: {
        ...payload.purchase,
        purchaseNumber: makePurchaseNumber(),
        createdById: auth.session.user.id,
        updatedById: auth.session.user.id,
        ...statusDatePatch(payload.purchase.status),
        items: { create: payload.items },
        timeline: {
          create: [
            {
              type: "CREATED",
              title: "Purchase created",
              message: "Purchase order was created.",
              toStatus: payload.purchase.status,
              adminUserId: auth.session.user.id,
            },
          ],
        },
      },
      include: purchaseInclude(),
    });

    if (created.status === "RECEIVED") {
      await receivePurchaseStock(tx, created, { adminUserId: auth.session.user.id, warehouseId: created.warehouseId, source: "ADMIN" });
      await tx.purchaseTimelineEvent.create({
        data: {
          purchaseOrderId: created.id,
          type: "RECEIVED",
          title: "Purchase received",
          message: "Stock was increased from this purchase receipt.",
          toStatus: "RECEIVED",
          adminUserId: auth.session.user.id,
        },
      });
    }

    return tx.purchaseOrder.findUnique({ where: { id: created.id }, include: purchaseInclude() });
  });

  return json({ item: serializePurchase(item) }, 201);
}
