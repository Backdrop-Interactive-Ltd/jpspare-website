import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { normalizeProductPayload, PRODUCT_READ_ROLES, PRODUCT_WRITE_ROLES, productInclude, replaceProductRelations, serializeProduct, validateProductPayload } from "../../../../../lib/admin/productPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getId(context) {
  const params = await context.params;
  return params.id;
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(PRODUCT_READ_ROLES);
  if (auth.response) return auth.response;

  const item = await prisma.product.findUnique({
    where: { id: await getId(context) },
    include: productInclude(),
  });

  if (!item) return apiError("Product not found.", 404);
  return json({ item: serializeProduct(item) });
}

export async function PUT(request, context) {
  const auth = await requireAdminApi(PRODUCT_WRITE_ROLES);
  if (auth.response) return auth.response;

  const id = await getId(context);
  const payload = normalizeProductPayload(await request.json());
  const validationError = validateProductPayload(payload);
  if (validationError) return apiError(validationError, 422);

  const item = await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: payload.product });
    await replaceProductRelations(tx, id, payload);
    return tx.product.findUnique({ where: { id }, include: productInclude() });
  });

  return json({ item: serializeProduct(item) });
}

export async function PATCH(request, context) {
  const auth = await requireAdminApi(PRODUCT_WRITE_ROLES);
  if (auth.response) return auth.response;

  const id = await getId(context);
  const body = await request.json();
  if (body.action === "archive") {
    const item = await prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
      include: productInclude(),
    });
    return json({ item: serializeProduct(item) });
  }
  if (body.action === "restore") {
    const item = await prisma.product.update({
      where: { id },
      data: { status: "ACTIVE" },
      include: productInclude(),
    });
    return json({ item: serializeProduct(item) });
  }
  return PUT(request, context);
}

export async function DELETE(request, context) {
  const auth = await requireAdminApi(PRODUCT_WRITE_ROLES);
  if (auth.response) return auth.response;

  const id = await getId(context);
  const { searchParams } = new URL(request.url);
  if (searchParams.get("permanent") === "true") {
    const product = await prisma.product.findUnique({ where: { id }, select: { status: true } });
    if (!product) return apiError("Product not found.", 404);
    if (product.status !== "ARCHIVED") return apiError("Only archived products can be permanently deleted.", 409);
    await prisma.product.delete({ where: { id } });
    return json({ ok: true });
  }

  await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
  return json({ ok: true });
}
