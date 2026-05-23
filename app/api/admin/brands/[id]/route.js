import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import {
  CATALOG_MANAGE_ROLES,
  CATALOG_READ_ROLES,
  brandInclude,
  normalizeBrandPayload,
  serializeBrand,
  validateNamedPayload,
} from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const id = async (context) => (await context.params).id;

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const item = await prisma.brand.findUnique({ where: { id: await id(context) }, include: brandInclude() });
  if (!item) return apiError("Brand not found.", 404);
  return json({ item: serializeBrand(item) });
}

async function updateBrand(request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeBrandPayload(await request.json());
  const error = validateNamedPayload(payload.brand, "Brand");
  if (error) return apiError(error, 422);

  const item = await prisma.brand.update({ where: { id: await id(context) }, data: payload.brand, include: brandInclude() });
  return json({ item: serializeBrand(item) });
}

export async function PUT(request, context) {
  return updateBrand(request, context);
}

export async function PATCH(request, context) {
  return updateBrand(request, context);
}

export async function DELETE(_request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  await prisma.brand.delete({ where: { id: await id(context) } });
  return json({ ok: true });
}
