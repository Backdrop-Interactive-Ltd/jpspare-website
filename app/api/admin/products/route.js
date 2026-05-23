import { apiError, json, prisma, requireAdminApi } from "../_utils";
import { normalizeProductPayload, PRODUCT_READ_ROLES, PRODUCT_WRITE_ROLES, productInclude, replaceProductRelations, serializeProduct, validateProductPayload } from "../../../../lib/admin/productPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildWhere(searchParams) {
  const query = searchParams.get("q")?.trim();
  const categoryId = searchParams.get("categoryId") || undefined;
  const brandId = searchParams.get("brandId") || undefined;
  const status = searchParams.get("status") || undefined;

  return {
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
            { barcode: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(brandId ? { brandId } : {}),
    ...(status && status !== "ALL" ? { status } : {}),
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(PRODUCT_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "12", 10), 1), 100);
  const where = buildWhere(searchParams);

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: productInclude(),
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return json({
    items: items.map(serializeProduct),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
}

export async function POST(request) {
  const auth = await requireAdminApi(PRODUCT_WRITE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeProductPayload(await request.json());
  const validationError = validateProductPayload(payload);
  if (validationError) return apiError(validationError, 422);

  const item = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({ data: payload.product });
    await replaceProductRelations(tx, product.id, payload);
    return tx.product.findUnique({ where: { id: product.id }, include: productInclude() });
  });

  return json({ item: serializeProduct(item) }, 201);
}
