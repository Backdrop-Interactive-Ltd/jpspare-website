import { apiError, json, prisma, requireAdminApi } from "../../../../_utils";
import { PRODUCT_READ_ROLES, PRODUCT_WRITE_ROLES } from "../../../../../../../lib/admin/productPayload";
import { normalizeProductVariantPayload, productVariantInclude, serializeProductVariant } from "../../../../../../../lib/admin/productVariantPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getParams(context) {
  const params = await context.params;
  return { productId: params.id, assignmentId: params.assignmentId };
}

function codedError(code, message, status = 400) {
  return json({ error: code, message }, status);
}

async function ensureProduct(productId, client = prisma) {
  return client.product.findUnique({ where: { id: productId }, select: { id: true } });
}

async function promoteDefaultAssignment(client, productId, excludeId = null) {
  const nextDefault = await client.productVariant.findFirst({
    where: { productId, isActive: true, ...(excludeId ? { id: { not: excludeId } } : {}) },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  if (!nextDefault) return null;

  await client.productVariant.updateMany({ where: { productId, isDefault: true }, data: { isDefault: false } });
  return client.productVariant.update({
    where: { id: nextDefault.id },
    data: { isDefault: true },
    include: productVariantInclude(),
  });
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(PRODUCT_READ_ROLES);
  if (auth.response) return auth.response;

  const { productId, assignmentId } = await getParams(context);
  const product = await ensureProduct(productId);
  if (!product) return codedError("PRODUCT_NOT_FOUND", "Product not found.", 404);

  const item = await prisma.productVariant.findFirst({
    where: { id: assignmentId, productId },
    include: productVariantInclude(),
  });

  if (!item) return codedError("PRODUCT_VARIANT_NOT_FOUND", "Product variant assignment not found.", 404);
  return json({ item: serializeProductVariant(item) });
}

export async function PATCH(request, context) {
  const auth = await requireAdminApi(PRODUCT_WRITE_ROLES);
  if (auth.response) return auth.response;

  const { productId, assignmentId } = await getParams(context);
  const body = await request.json().catch(() => ({}));
  const { data, errors } = normalizeProductVariantPayload(body, { partial: true });
  if (errors.length) return codedError("INVALID_PRODUCT_VARIANT", errors[0], 400);

  try {
    const item = await prisma.$transaction(async (tx) => {
      const product = await ensureProduct(productId, tx);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");

      const existing = await tx.productVariant.findFirst({
        where: { id: assignmentId, productId },
        select: { id: true, isDefault: true },
      });
      if (!existing) throw new Error("PRODUCT_VARIANT_NOT_FOUND");

      if (data.isDefault === true) {
        await tx.productVariant.updateMany({ where: { productId, isDefault: true, id: { not: assignmentId } }, data: { isDefault: false } });
      }

      const updated = await tx.productVariant.update({
        where: { id: assignmentId },
        data,
        include: productVariantInclude(),
      });

      if (existing.isDefault && (data.isDefault === false || data.isActive === false)) {
        if (data.isActive === false && updated.isDefault) {
          await tx.productVariant.update({ where: { id: assignmentId }, data: { isDefault: false } });
        }
        const activeDefaultCount = await tx.productVariant.count({ where: { productId, isDefault: true } });
        if (!activeDefaultCount) {
          await promoteDefaultAssignment(tx, productId, assignmentId);
        }
      }

      return updated;
    });

    const refreshed = await prisma.productVariant.findFirst({
      where: { id: item.id, productId },
      include: productVariantInclude(),
    });

    return json({ item: serializeProductVariant(refreshed || item) });
  } catch (error) {
    if (error?.message === "PRODUCT_NOT_FOUND") return codedError("PRODUCT_NOT_FOUND", "Product not found.", 404);
    if (error?.message === "PRODUCT_VARIANT_NOT_FOUND") return codedError("PRODUCT_VARIANT_NOT_FOUND", "Product variant assignment not found.", 404);
    return apiError("Unable to update product variant assignment.", 500);
  }
}

export async function DELETE(_request, context) {
  const auth = await requireAdminApi(PRODUCT_WRITE_ROLES);
  if (auth.response) return auth.response;

  const { productId, assignmentId } = await getParams(context);

  try {
    await prisma.$transaction(async (tx) => {
      const product = await ensureProduct(productId, tx);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");

      const existing = await tx.productVariant.findFirst({
        where: { id: assignmentId, productId },
        select: { id: true, isDefault: true },
      });
      if (!existing) throw new Error("PRODUCT_VARIANT_NOT_FOUND");

      await tx.productVariant.delete({ where: { id: assignmentId } });

      if (existing.isDefault) {
        await promoteDefaultAssignment(tx, productId);
      }
    });

    return json({ ok: true });
  } catch (error) {
    if (error?.message === "PRODUCT_NOT_FOUND") return codedError("PRODUCT_NOT_FOUND", "Product not found.", 404);
    if (error?.message === "PRODUCT_VARIANT_NOT_FOUND") return codedError("PRODUCT_VARIANT_NOT_FOUND", "Product variant assignment not found.", 404);
    return apiError("Unable to delete product variant assignment.", 500);
  }
}
