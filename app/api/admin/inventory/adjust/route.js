import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { adjustProductStock, INVENTORY_ADJUST_ROLES, serializeInventoryProduct } from "../../../../../lib/commerce/inventory";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  const auth = await requireAdminApi(INVENTORY_ADJUST_ROLES);
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const productId = String(body.productId || "").trim();
    const adjustment = Number.parseInt(body.adjustment, 10);
    const reason = String(body.reason || "Manual stock adjustment").trim();
    const warehouseId = body.warehouseId ? String(body.warehouseId).trim() : null;

    if (!productId) return apiError("Product is required.", 422);
    if (!Number.isFinite(adjustment) || adjustment === 0) return apiError("Adjustment must be a non-zero number.", 422);

    const product = await prisma.$transaction(async (tx) => {
      const updated = await adjustProductStock(tx, {
        productId,
        adjustment,
        reason,
        warehouseId,
        adminUserId: auth.session.user.id,
      });

      return tx.product.findUnique({
        where: { id: updated.id },
        include: {
          category: true,
          brand: true,
          images: { orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }], take: 1 },
          media: { include: { media: true }, orderBy: { sortOrder: "asc" }, take: 1 },
        },
      });
    });

    return json({ item: serializeInventoryProduct(product) });
  } catch (error) {
    return apiError(error.message || "Stock adjustment failed.", 422);
  }
}
