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
const categoryInUseMessage = "This category cannot be deleted because it has child categories or assigned products.";

function collectDescendantIds(categories, parentId, descendants = new Set()) {
  for (const category of categories) {
    if (category.parentId !== parentId || descendants.has(category.id)) continue;
    descendants.add(category.id);
    collectDescendantIds(categories, category.id, descendants);
  }

  return descendants;
}

async function validateParentAssignment(categoryId, parentId) {
  if (!parentId) return null;
  if (parentId === categoryId) return "A category cannot be its own parent.";

  const categories = await prisma.category.findMany({ select: { id: true, parentId: true } });
  const descendantIds = collectDescendantIds(categories, categoryId);

  if (descendantIds.has(parentId)) {
    return "A category cannot be assigned under one of its own child categories.";
  }

  return null;
}

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
  const parentError = await validateParentAssignment(categoryId, payload.category.parentId);
  if (parentError) return apiError(parentError, 422);

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

  const categoryId = await id(context);
  const [childCount, productCount] = await prisma.$transaction([
    prisma.category.count({ where: { parentId: categoryId } }),
    prisma.product.count({ where: { categoryId } }),
  ]);

  if (childCount > 0 || productCount > 0) {
    return json({ error: "CATEGORY_IN_USE", message: categoryInUseMessage }, 409);
  }

  await prisma.category.delete({ where: { id: categoryId } });
  return json({ ok: true });
}
