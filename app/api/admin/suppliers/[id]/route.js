import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { normalizeSupplierPayload, serializeSupplier, supplierInclude, SUPPLIER_MANAGE_ROLES, SUPPLIER_READ_ROLES, validateSupplierPayload } from "../../../../../lib/admin/purchasePayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const auth = await requireAdminApi(SUPPLIER_READ_ROLES);
  if (auth.response) return auth.response;

  const { id } = await params;
  const item = await prisma.supplier.findUnique({ where: { id }, include: supplierInclude() });
  if (!item) return apiError("Supplier not found.", 404);

  return json({ item: serializeSupplier(item) });
}

export async function PUT(request, { params }) {
  const auth = await requireAdminApi(SUPPLIER_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const { id } = await params;
  const payload = normalizeSupplierPayload(await request.json());
  const validationError = validateSupplierPayload(payload);
  if (validationError) return apiError(validationError, 422);

  const item = await prisma.supplier.update({
    where: { id },
    data: payload,
    include: supplierInclude(),
  });

  return json({ item: serializeSupplier(item) });
}

export async function DELETE(_request, { params }) {
  const auth = await requireAdminApi(SUPPLIER_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const { id } = await params;
  await prisma.supplier.delete({ where: { id } });
  return json({ ok: true });
}
