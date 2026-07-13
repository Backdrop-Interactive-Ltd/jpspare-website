import { apiError, json, prisma, requireAdminApi } from "../../../_utils";
import { PRODUCT_READ_ROLES, PRODUCT_WRITE_ROLES } from "../../../../../../lib/admin/productPayload";
import { normalizeProductVariantPayload, productVariantInclude, serializeProductVariant } from "../../../../../../lib/admin/productVariantPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getProductId(context) {
  const params = await context.params;
  return params.id;
}

function codedError(code, message, status = 400) {
  return json({ error: code, message }, status);
}

async function productExists(productId, client = prisma) {
  return client.product.findUnique({ where: { id: productId }, select: { id: true } });
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(PRODUCT_READ_ROLES);
  if (auth.response) return auth.response;

  const productId = await getProductId(context);
  const product = await productExists(productId);
  if (!product) return codedError("PRODUCT_NOT_FOUND", "Product not found.", 404);

  const items = await prisma.productVariant.findMany({
    where: { productId },
    include: productVariantInclude(),
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return json({ items: items.map(serializeProductVariant) });
}

export async function POST(request, context) {
  const auth = await requireAdminApi(PRODUCT_WRITE_ROLES);
  if (auth.response) return auth.response;

  const productId = await getProductId(context);
  const body = await request.json().catch(() => ({}));
  const variantId = body.variantId ? String(body.variantId).trim() : "";

  if (!variantId) return codedError("VARIANT_NOT_FOUND", "Variant is required.", 404);

  const { data, errors } = normalizeProductVariantPayload(body);
  if (errors.length) return codedError("INVALID_PRODUCT_VARIANT", errors[0], 400);

  try {
    const item = await prisma.$transaction(async (tx) => {
      const product = await productExists(productId, tx);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");

      const variant = await tx.variant.findUnique({ where: { id: variantId }, select: { id: true, isActive: true } });
      if (!variant) throw new Error("VARIANT_NOT_FOUND");
      if (!variant.isActive) throw new Error("VARIANT_INACTIVE");

      const existing = await tx.productVariant.findUnique({
        where: { productId_variantId: { productId, variantId } },
        select: { id: true },
      });
      if (existing) throw new Error("PRODUCT_VARIANT_EXISTS");

      const totalAssignments = await tx.productVariant.count({ where: { productId } });
      const shouldBeDefault = body.isDefault === undefined ? totalAssignments === 0 : Boolean(data.isDefault);

      if (shouldBeDefault) {
        await tx.productVariant.updateMany({ where: { productId, isDefault: true }, data: { isDefault: false } });
      }

      return tx.productVariant.create({
        data: {
          ...data,
          productId,
          variantId,
          isDefault: shouldBeDefault,
        },
        include: productVariantInclude(),
      });
    });

    return json({ item: serializeProductVariant(item) }, 201);
  } catch (error) {
    if (error?.message === "PRODUCT_NOT_FOUND") return codedError("PRODUCT_NOT_FOUND", "Product not found.", 404);
    if (error?.message === "VARIANT_NOT_FOUND") return codedError("VARIANT_NOT_FOUND", "Variant not found.", 404);
    if (error?.message === "VARIANT_INACTIVE") return codedError("VARIANT_INACTIVE", "Inactive variants cannot be assigned to products.", 400);
    if (error?.message === "PRODUCT_VARIANT_EXISTS" || error?.code === "P2002") {
      return codedError("PRODUCT_VARIANT_EXISTS", "This variant is already assigned to the product.", 409);
    }
    return apiError("Unable to save product variant assignment.", 500);
  }
}
