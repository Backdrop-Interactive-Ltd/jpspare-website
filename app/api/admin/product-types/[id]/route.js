import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_MANAGE_ROLES, CATALOG_READ_ROLES, slugify } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const id = async (context) => (await context.params).id;

function cleanString(value) {
  if (value === undefined || value === null) return null;
  const clean = String(value).trim();
  return clean || null;
}

function intValue(value, fallback = 0) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeProductTypePayload(body) {
  const name = cleanString(body.name);
  const slug = cleanString(body.slug) || slugify(name);

  return {
    name,
    slug,
    description: cleanString(body.description),
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    sortOrder: intValue(body.sortOrder),
  };
}

function validateProductTypePayload(payload) {
  if (!payload.name || !payload.slug) return "Product type name and slug are required.";
  return null;
}

function serializeProductType(productType) {
  if (!productType) return null;
  return {
    ...productType,
    createdAt: productType.createdAt?.toISOString?.() ?? productType.createdAt,
    updatedAt: productType.updatedAt?.toISOString?.() ?? productType.updatedAt,
  };
}

function productTypeError(error) {
  if (error?.code === "P2025") return apiError("Product type not found.", 404);
  if (error?.code === "P2002") {
    const field = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : "name or slug";
    return apiError(`Product type ${field} already exists.`, 409);
  }
  return apiError("Unable to save product type.", 400);
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const item = await prisma.productType.findUnique({ where: { id: await id(context) } });
  if (!item) return apiError("Product type not found.", 404);
  return json({ item: serializeProductType(item) });
}

async function updateProductType(request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeProductTypePayload(await request.json());
  const error = validateProductTypePayload(payload);
  if (error) return apiError(error, 422);

  try {
    const item = await prisma.productType.update({ where: { id: await id(context) }, data: payload });
    return json({ item: serializeProductType(item) });
  } catch (error) {
    return productTypeError(error);
  }
}

export async function PUT(request, context) {
  return updateProductType(request, context);
}

export async function PATCH(request, context) {
  return updateProductType(request, context);
}

export async function DELETE(_request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  try {
    await prisma.productType.delete({ where: { id: await id(context) } });
    return json({ ok: true });
  } catch (error) {
    return productTypeError(error);
  }
}
