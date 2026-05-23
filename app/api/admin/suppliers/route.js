import { apiError, json, prisma, requireAdminApi } from "../_utils";
import { normalizeSupplierPayload, serializeSupplier, supplierInclude, SUPPLIER_MANAGE_ROLES, SUPPLIER_READ_ROLES, validateSupplierPayload } from "../../../../lib/admin/purchasePayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildWhere(searchParams) {
  const query = searchParams.get("q")?.trim();
  const status = searchParams.get("status") || undefined;

  return {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { companyName: { contains: query, mode: "insensitive" } },
            { contactPerson: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status && status !== "ALL" ? { status } : {}),
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(SUPPLIER_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);
  const where = buildWhere(searchParams);

  const [items, total] = await prisma.$transaction([
    prisma.supplier.findMany({
      where,
      include: supplierInclude(),
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supplier.count({ where }),
  ]);

  return json({
    items: items.map(serializeSupplier),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}

export async function POST(request) {
  const auth = await requireAdminApi(SUPPLIER_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeSupplierPayload(await request.json());
  const validationError = validateSupplierPayload(payload);
  if (validationError) return apiError(validationError, 422);

  const item = await prisma.supplier.create({
    data: payload,
    include: supplierInclude(),
  });

  return json({ item: serializeSupplier(item) }, 201);
}
