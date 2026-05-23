import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import {
  CATALOG_MANAGE_ROLES,
  CATALOG_READ_ROLES,
  categoryInclude,
  normalizeCategoryPayload,
  replaceCategoryImages,
  serializeCategory,
  validateNamedPayload,
} from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const id = async (context) => (await context.params).id;

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const item = await prisma.category.findUnique({ where: { id: await id(context) }, include: categoryInclude() });
  if (!item) return apiError("Category not found.", 404);
  return json({ item: serializeCategory(item) });
}

async function updateCategory(request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const categoryId = await id(context);
  const payload = normalizeCategoryPayload(await request.json());
  const error = validateNamedPayload(payload.category, "Category");
  if (error) return apiError(error, 422);
  if (payload.category.parentId === categoryId) return apiError("A category cannot be its own parent.", 422);

  const item = await prisma.$transaction(async (tx) => {
    await tx.category.update({ where: { id: categoryId }, data: payload.category });
    await replaceCategoryImages(tx, categoryId, payload.images);
    return tx.category.findUnique({ where: { id: categoryId }, include: categoryInclude() });
  });

  return json({ item: serializeCategory(item) });
}

export async function PUT(request, context) {
  return updateCategory(request, context);
}

export async function PATCH(request, context) {
  return updateCategory(request, context);
}

export async function DELETE(_request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  await prisma.category.delete({ where: { id: await id(context) } });
  return json({ ok: true });
}
